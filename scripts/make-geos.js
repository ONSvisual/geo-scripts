import { readFileSync, writeFileSync, existsSync, mkdirSync, createReadStream, createWriteStream, unlinkSync } from "fs";
import zlib from "zlib";
import readline from "line-by-line";
import { bbox, area, bboxPolygon, booleanPointInPolygon } from "@turf/turf";
import polylabel from "polylabel";
import { readGzip, writeGzip, csvParse } from "./utils.js";
import geos from "../config/geo-config.js";
import types from "../config/geo-types.js";

const dirs = ["geos", "cm-geos"];

let geo_years;
let geo_features;

function roundAll(arr, decimals) {
  let newarr = [];
  arr.forEach(d => {
    if (typeof d == "number") {
      newarr.push(round(d, decimals));
    } else if (Array.isArray(d)) {
      newarr.push(roundAll(d, decimals));
    } else {
      newarr.push(d);
    }
  });
  return newarr;
}

function round(num, dp) {
  let multiplier = Math.pow(10, dp);
  return Math.round(num * multiplier) / multiplier;
}

function propsToNames(props, extraCols = []) {
  const newprops = {areacd: props.areacd};
  for (const key of ["areanm", "areanmw", "hclnm", "hclnmw", ...extraCols]) {
    if (props[key]) newprops[key] = props[key];
  }
  return newprops;
}

function findPolylabel(feature) {
  let output = [];
  if (feature.geometry.type === "Polygon"){
    output = polylabel(feature.geometry.coordinates);
  }
  else {
    let maxArea = 0, maxPolygon = [];
    for (let i = 0, l = feature.geometry.coordinates.length; i < l; i++){
      const p = feature.geometry.coordinates[i];
      const _area = area({type: "Polygon", coordinates: p})
      if (_area > maxArea){
        maxPolygon = p;
        maxArea = _area;
      }
    }
    output = polylabel(maxPolygon);
  }
  return output;
}

function getParents(lookup, code, parents = []) {
  let parentcd = lookup[code]?.parentcd;
  if (parentcd) {
    let parent = propsToNames(lookup[parentcd], ["start", "end"]);
    return getParents(lookup, parentcd, [...parents, parent]);
  } else {
    return parents;
  }
}

function getChildren(lookup_data, code) {
  let children = lookup_data.filter(d => d.parentcd == code);
  return children.map(child => propsToNames(child))
    .sort((a, b) => a.areacd.localeCompare(b.areacd));
}

function makeNomisParentLookup() {
  const path = "./input/oas/oa21_lsoa21_msoa21_ltla22.csv";
  const data_raw = readFileSync(path, {encoding: 'utf8', flag: 'r'});
  const data = csvParse(data_raw);
  const lookup = {};
  const counts = {};
  for (const d of data) {
    lookup[d.oa21cd] = d;
    for (let key of ["lsoa21cd", "msoa21cd", "ltla22cd"]) {
      if (!counts[d[key]]) counts[d[key]] = 0;
      counts[d[key]] ++;
    }
  }
  return {lookup, counts};
}

function getNomisCodes(oa_lkp, pt_lkp, code) {
  if (["K", "N", "S"].includes(code[0])) return null;
  if (["E92", "W92", "E12", "E00", "W00"].includes(code.slice(0, 3))) return [code];
  let oas = oa_lkp.filter(d => d.parentcd === code).map(d => pt_lkp.lookup[d.areacd]);
  const codes = [];
  while (oas.length > 0) {
    const oa = oas[0];
    let found = false;
    for (let key of ["ltla22cd", "msoa21cd", "lsoa21cd"]) {
      if (!codes.includes[oa[key]]) {
        if (oas.filter(d => d[key] === oa[key]).length === pt_lkp.counts[oa[key]]) {
          codes.push(oa[key]);
          oas = oas.filter(d => d[key] !== oa[key]);
          found = true;
          break;
        }
      }
    }
    if (!found) codes.push(oas.shift().oa21cd);
  }
  return codes.sort((a, b) => a.localeCompare(b));
}

function makeGeo(geo, year, lookup_data, lookup, pt_lookup) {
  return new Promise((resolve) => {
    const yr = String(year).slice(-2);
    const detail = geo.detail ? geo.detail : "bgc";
    const dp = detail === "bfc" ? 6 : detail === "buc" ? 4 : 5;
    const geo_path = `./input/boundaries/${geo.key}${yr}_${detail}.json.gz`;
    const oa_lookup_path = geo.key !== "oa" && !geo.nolookup ? `./input/oas/oa21_${geo.key}${yr}.csv` : null;
    const oa_lookup = oa_lookup_path ? csvParse(readFileSync(oa_lookup_path, {encoding: 'utf8', flag: 'r'})) : null;

    console.log(`Generating geo files from ${geo_path}`);
    const lineReader = new readline(createReadStream(geo_path).pipe(zlib.createGunzip()));

    lineReader.on('line', (line) => {
      lineReader.pause();
      const feature = JSON.parse(line);
      const areacd = feature.properties.areacd;
      // console.log(areacd);
      const typecd = areacd.slice(0, 3);
      const dir = `./output/geos/${typecd}`;
      const path = `${dir}/${areacd}.json`;
      
      if (!geo.filter || geo.filter.includes(areacd[0])) geo_years[areacd] = year;

      if (!existsSync(path) && (!geo.filter || geo.filter.includes(areacd[0]))) {
        // Make simple props
        const lkp = lookup[areacd];
        const props = propsToNames(lkp);

        // Add additional props
        props.groupcd = geo.key;
        props.groupnm = geo.label;
        props.typecd = typecd;
        props.typenm = types[props.typecd] ? types[props.typecd] : geo.label;
        if (lkp?.km2_extent) props.area_km2 = {
          extent: lkp.km2_extent,
          clipped: lkp.km2_clipped,
          water: lkp.km2_water,
          land: lkp.km2_land
        };

        // Add bbox and centroid
        props.bounds = bbox(feature.geometry);
        props.centroid = roundAll(findPolylabel(feature), dp);

        if (year !== geo.years[geo.years.length - 1]) {
          props.end = year;
          lkp.end = year;
          // Find successor geography
          const point = {type: "Point", coordinates: props.centroid};
          const candidates = geo_features.filter(f => booleanPointInPolygon(point, f) && f.properties.year > year);
          for (const candidate of candidates) {
            const cd = candidate.properties.areacd;
            const c_path = `./output/geos/${cd.slice(0, 3)}/${cd}.json`;
            const c_geo = JSON.parse(readGzip(c_path));
            if (booleanPointInPolygon(point, c_geo)) {
              props.successor = propsToNames(lookup[cd]);
              c_geo.properties.replaces = c_geo.properties.replaces ?
                [...c_geo.properties.replaces, propsToNames(props)] :
                [propsToNames(props)];
              writeGzip(c_path, JSON.stringify(c_geo));
              console.log(`Added superseded codes to ${c_path}`);
              break;
            }
          }
        };

        // Add parents and children
        if (!geo.notree) {
          props.children = getChildren(lookup_data, areacd);
          props.child_typecds = props.children[0] ?
            Array.from(new Set(props.children.map(c => c.areacd.slice(0, 3)))).sort((a, b) => a.localeCompare(b)) :
            [];
          props.parents = getParents(lookup, areacd);
        }

        // Add nomis codes
        props.c21cds = getNomisCodes(oa_lookup, pt_lookup, areacd);
        if (lkp?.nomiscd) props.nomiscd = lkp.nomiscd;

        feature.properties = props;

        // Create directory if needed
        if (!existsSync(dir)) mkdirSync(dir);

        // Write gzipped file
        writeGzip(path, JSON.stringify(feature));
        console.log(`Wrote ${path}`);

        // Add geo bounds to stack
        geo_features.push({type: "Feature", properties: {areacd, year}, geometry: bboxPolygon(props.bounds).geometry});

        // Create geo file for Census maps, if required
        const cm_path = `./output/cm-geos/${areacd}.geojson`;
        if (geo.cmkey && ["E", "W"].includes(areacd[0]) && !existsSync(cm_path)) {
          const cm_data = {
            meta: {
              code: areacd,
              name: props.hclnm ? props.hclnm : props.areanm ? props.areanm : areacd,
              geotype: geo.cmkey
            },
            geo_json: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  id: "centroid",
                  geometry: {
                    type: "Point",
                    coordinates: props.centroid
                  },
                  properties: null
                },
                {
                  type: "Feature",
                  id: "bbox",
                  geometry: {
                    type: "LineString",
                    coordinates: [
                      [props.bounds[0], props.bounds[1]],
                      [props.bounds[2], props.bounds[3]]
                    ]
                  },
                  properties: null
                },
                {
                  type: "Feature",
                  id: "boundary",
                  geometry: feature.geometry,
                  properties: null
                }
              ]
            }
          }
          writeGzip(cm_path, JSON.stringify(cm_data));
          console.log(`Wrote ${cm_path}`);
        }
      } else {
        console.log(`Skipped ${areacd}`);
      }

      lineReader.resume();
    });

    lineReader.on("end", async () => {
      resolve();
    });
  });
}

// Add start year and children to new geographies
async function addStartYear(geo_years, years, lookup_data) {
  const geos = Object.keys(geo_years)
    .map(areacd => ({areacd, year: geo_years[areacd]}))
    .filter(d => d.year !== years[0]);
  
  for (const geo of geos) {
    const areacd = geo.areacd;
    const lkp = lookup[areacd];
    const path = `./output/geos/${areacd.slice(0, 3)}/${areacd}.json`;
    const feature = JSON.parse(readGzip(path));
    feature.properties.start = geo.year;
    lkp.start = geo.year;
    if (Array.isArray(feature.properties.replaces)) {
      const cds = feature.properties.replaces.map(d => d.areacd);
      lookup_data.forEach(d => {
        if (cds.includes(d.parentcd)) d.parentcd = areacd;
      });
      feature.properties.children = getChildren(lookup_data, areacd);
      feature.properties.child_typecds = feature.properties.children[0] ?
        Array.from(new Set(feature.properties.children.map(c => c.areacd.slice(0, 3)))).sort((a, b) => a.localeCompare(b)) :
        [];
    }
    writeGzip(path, JSON.stringify(feature));
    console.log(`Added start year and children to ${path}`);
  }
}

// Load source data
const lookup_path = "./input/lookups/lookup.csv";
const lookup_raw = readFileSync(lookup_path, {encoding: 'utf8', flag: 'r'});
const lookup_data = csvParse(lookup_raw);
const lookup = {};
lookup_data.forEach(d => lookup[d.areacd] = d);

const pt_lookup = makeNomisParentLookup();

// Make directories if needed
for (let dir of dirs) {
  const path = `./output/${dir}`;
  if (!existsSync(path)) mkdirSync(path);
}

// Generate geo files
for (let geo of geos) {
  geo_years = {};
  geo_features = [];
  for (let year of [...geo.years].reverse()) {
    await makeGeo(geo, year, lookup_data, lookup, pt_lookup);
  }
  if (geo.years.length > 1) addStartYear(geo_years, geo.years, lookup_data);
}