import { readFileSync, writeFileSync, existsSync, mkdirSync, createReadStream, createWriteStream } from "fs";
import zlib from "zlib";
import readline from "line-by-line";
import { bbox, area } from "@turf/turf";
import polylabel from "polylabel";
import { csvFormat } from "d3-dsv";
import { csvParse, run } from "./utils.js";
import geos from "../config/geo-config.js";
import types from "../config//geo-types.js";

const dirs = ["geos", "cm-geos"];
const lists = {ap: [], cp: []};

let all_areas = true;

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

function findPolylabel(feature){
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
    let parent = {areacd: parentcd, areanm: lookup[parentcd].areanm};
    if (lookup[parentcd].areanmw) parent.areanmw = lookup[parentcd].areanmw;
    if (lookup[parentcd].hclnm) parent.hclnm = lookup[parentcd].hclnm;
    if (lookup[parentcd].hclnmw) parent.hclnmw = lookup[parentcd].hclnmw;
    return getParents(lookup, parentcd, [...parents, parent]);
  } else {
    return parents;
  }
}

function makeNomisParentLookup() {
  const path = "./input/oas/oa21_lsoa21_msoa21_ltla22.csv";
  const data_raw = readFileSync(path, {encoding: 'utf8', flag: 'r'});
  const data = csvParse(data_raw);
  const lookup = {};
  const counts = {};
  for (let d of data) {
    lookup[d.oa21cd] = d;
    for (let key of ["lsoa21cd", "msoa21cd", "ltla22cd"]) {
      if (!counts[d[key]]) counts[d[key]] = 1;
      else counts[d[key]] ++;
    }
  }
  return {lookup, counts};
}

function getNomisCodes(oa_lkp, pt_lkp, code) {
  if (["K", "N", "S"].includes(code[0])) return null;
  if (["E92", "W92", "E12", "E00", "W00"].includes(code.slice(0, 3))) return [code];
  let oas = oa_lkp.filter(d => d.parentcd === code).map(d => pt_lkp.lookup[d.areacd]);
  const codes = [];
  for (let i = 0; i < oas.length; i ++) {
    const oa = oas[i];
    for (let key of ["ltla22cd", "msoa21cd", "lsoa21cd"]) {
      if (!codes.includes[oa[key]]) {
        if (oas.filter(d => d[key] === oa[key]).length === pt_lkp.counts[oa[key]]) {
          codes.push(oa[key]);
          oas = oas.filter(d => d[key] !== oa[key]);
          break;
        }
      }
    }
  }
  return codes;
}

function writeGzip(path, data) {
  var output = createWriteStream(path);
  var gzip = zlib.createGzip();
  gzip.pipe(output);
  gzip.write(data);
  gzip.end();
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
      if (!existsSync(path) && (!geo.filter || geo.filter.includes(areacd[0]))) {
        // Make simple props
        const props = {areacd};
        const lkp = lookup[areacd];
        if (lkp) {
          ["areanm", "areanmw", "hclnm", "hclnmw"].forEach(key => {
            if (lkp[key]) props[key] = lkp[key];
          });
        } else {
          props.areanm = feature.properties.areanm;
          if (feature.properties.areanmw) props.areanmw = feature.properties.areanmw;
        }
        
        props.groupcd = geo.key;
        props.groupnm = geo.label;
        props.typecd = typecd;
        props.typenm = types[props.typecd] ? types[props.typecd] : geo.label;
        if (lkp?.change) props.expired = lkp.change;
        else if (year !== geo.years[geo.years.length - 1]) props.expired = geo.years[geo.years.indexOf(year) + 1];
        if (lkp?.successor) props.successor = lkp.successor;
        if (lkp?.km2_extent) props.area_km2 = {
          extent: lkp.km2_extent,
          clipped: lkp.km2_clipped,
          water: lkp.km2_water,
          land: lkp.km2_land
        };

        // Add bbox and centroid
        props.bounds = bbox(feature.geometry);
        props.centroid = roundAll(findPolylabel(feature), dp);

        // Add parents and children
        if (!geo.notree) {
          let children = lookup_data.filter(d => d.parentcd == areacd);
          props.children = children.map(d => {
            const child = {areacd: d.areacd};
            if (d.areanm) child.areanm = d.areanm;
            if (d.areanmw) child.areanmw = d.areanmw;
            if (d.hclnm) child.hclnm = d.hclnm;
            if (d.hclnmw) child.hclnmw = d.hclnmw;
            return child;
          })
          .sort((a, b) => a.areacd.localeCompare(b.areacd));
          props.child_typecds = props.children[0] ?
            Array.from(new Set(props.children.map(c => c.areacd.slice(0, 3)))).sort((a, b) => a.localeCompare(b)) :
            [];
          props.parents = getParents(lookup, areacd);
        }

        // Add nomis codes
        props.c21cds = getNomisCodes(oa_lookup, pt_lookup, areacd);
        if (lkp?.nomiscd) props.nomiscd = lkp.nomiscd;

        feature.properties = props;

        // Add feature to lists if necessary
        if (geo.list && year === geo.years[geo.years.length - 1]) {
          const row = {areacd, areanm: props.areanm};
          if (geo.listparents) row.parentcd = lkp?.parentcd;
          ["ap", "cp"].forEach(cd => {
            if (geo.list.includes(cd)) lists[cd].push(row);
          });
        }

        // Create directory if needed
        if (!existsSync(dir)) mkdirSync(dir);

        // Write gzipped file
        writeGzip(path, JSON.stringify(feature));
        console.log(`Wrote ${path}`);

        // Create geo file for Census maps, if required
        if (geo.cmkey) {
          const cm_path = `./output/cm-geos/${areacd}.geojson`;
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
        all_areas = false;
      }

      lineReader.resume();
    });

    lineReader.on("end", async () => {
      resolve();
    });
  });
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
  for (let year of [...geo.years].reverse()) {
    await makeGeo(geo, year, lookup_data, lookup, pt_lookup);
  }
}

// Write list files
if (all_areas) {
  ["ap", "cp"].forEach(key => {
    const path = `./output/${key}_places.csv`;
    writeFileSync(path, csvFormat(lists[key]));
    console.log(`Wrote ${path}`);
  });
}