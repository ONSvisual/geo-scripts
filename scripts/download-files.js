import { writeFileSync, appendFileSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { csvFormat } from "d3-dsv";
import { download, fetch, run, csvParse } from "./utils.js";
import source_files from "../config/source-files.js";

const keys = Object.keys(source_files);
const cache = {};

const cacheFetch = async (url) => {
  if (!cache[url]) cache[url] = await fetch(url);
  return cache[url];
};

const apiUrl = (id, fields, offset) => `https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/${id}/FeatureServer/0/query?where=1%3D1&outFields=${fields.join(",")}&resultOffset=${offset}&outSR=4326&f=geojson`;

const downloadGeo = async (file, path) => {
  let complete = false;
  let offset = 0;
  writeFileSync(path, "");
  while (!complete) {
    let geo = JSON.parse(await fetch(apiUrl(file.id, file.fields, offset)));
    if (geo.features) {
      if (geo.features.length > 0) {
        appendFileSync(path, `${geo.features.map(f => JSON.stringify(f)).join("\n")}\n`);
      } else {
        complete = true;
      }
      if (geo?.properties?.exceededTransferLimit) {
        offset += geo.features.length;
      } else {
        complete = true;
      }
    } else {
      console.log("Bad API response. Trying again...")
    }
  }
  console.log(`Downloaded ${path}`);
}

const makeUrl = (id, ref_id = null) => ref_id ?
  `https://opendata.arcgis.com/api/v3/datasets/${id}/downloads/data?format=csv&spatialRefId=${ref_id}&where=1%3D1` :
  `https://www.arcgis.com/sharing/rest/content/items/${id}/data`;

const downloadNames = async (file, path) => {
  const href = makeUrl(file.id, 4326); // 4326 is the default spatial reference id for the API
  const data_raw = await cacheFetch(href);
  const names = file.names ? file.names : ["areacd", "areanm", "areanmw"];
  let data = csvParse(data_raw, (d) => {
    const row = {};
    file.fields.forEach((field, i) => {
      row[names[i]] = d[field];
    });
    return row;
  });
  writeFileSync(path, csvFormat(data, names));
  console.log(`Downloaded ${path}`);
};

const downloadLookup = async (file, files, path) => {
  const href = makeUrl(file.id, file.ref_id);
  const data_raw = await cacheFetch(href);
  const names = file.names ? file.names : ["areacd", "parentcd"];
  const last_name = names[names.length - 1];
  const codes = [];
  let data = csvParse(data_raw, (d) => {
    const row = {};
    file.fields.forEach((field, i) => {
      row[names[i]] = d[field];
    });
    const code = row[names[0]];
    if (file.map) row[names[1]] = file.map[code[0]];
    if (!codes.includes(code)) {
      codes.push(code);
      return (!file.filter || file.filter.includes(code[0]) || file.filter.includes(code.slice(0, 3))) &&
        (row[last_name] && row[last_name].slice(3) !== "999999") ?
        row : null;
    } else {
      return null;
    }
  });
  // Transform for case of indirect lookups
  if (path.includes("/oa21") && file.fields[0].toLowerCase() !== "oa21cd") {
    const parent_lookup = {};
    data.forEach(d => parent_lookup[d.areacd] = d.parentcd);
    const oa_file = files.find(f => f.fields[0].toLowerCase() === "oa21cd" && f.fields[1].toLowerCase() === file.fields[0].toLowerCase());
    const oa_href = makeUrl(oa_file.id, oa_file.ref_id);
    const oa_raw = await cacheFetch(oa_href);
    data = csvParse(oa_raw, (d) => {
      const parentcd = parent_lookup[d[oa_file.fields[1]]];
      return parentcd ? {areacd: d[oa_file.fields[0]], parentcd} : null;
    });
  }
  writeFileSync(path, csvFormat(data, names));
  console.log(`Downloaded ${path}`);
};

const convertGeo = async (path, name, fields) => {
  const out_path = path.replace(".jsonl", ".json");
  const precision = path.includes("_bf") ? 6 : path.includes("_bu") ? 4 : 5;
  const field_map = fields.map(f => `${f} AS ${f.toLowerCase().slice(-2) === "cd" ? "areacd" : "areanm"}`).join(", ");
  const opts = {env: {"OGR_GEOJSON_MAX_OBJ_SIZE": 8000}};
  await run(`ogr2ogr -f GeoJSONSeq -lco COORDINATE_PRECISION=${precision} ${out_path} ${path} -sql "SELECT ${field_map} from ${name}"`, opts);
  unlinkSync(path);
  return await run(`gzip ${out_path}`);
};

async function downloadFiles() {
  for (const key of keys) {
    const dir = `./input/${key}`;
    if (!existsSync(dir)) mkdirSync(dir);
    for (const file of source_files[key]) {
      const path = `${dir}/${file.name}`;
      const out_path = path.replace(".jsonl", ".json.gz");
      if (existsSync(path) || existsSync(`${out_path}`)) {
        console.log(`${path} already downloaded`);
      } else {
        if (key === "boundaries") {
          // Simplify and gzip json-ld features
          await downloadGeo(file, path);
          await convertGeo(path, file.name.split(".")[0], file.fields);
        } else if (key === "names") {
          await downloadNames(file, path);
        } else if (["oas", "parents"].includes(key)) {
          await downloadLookup(file, source_files[key], path);
        } else {
          await download(file.href, path);
        }
      }
    }
  }
}
downloadFiles();