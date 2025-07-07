import { writeFileSync, appendFileSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { csvFormat } from "d3-dsv";
import { download, fetch, run, csvParse } from "./utils.js";
import source_files from "../config/source-files.js";

const keys = Object.keys(source_files);

const apiUrl = (file, limit, offset) => file.url || `https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/${file.id}/FeatureServer/0/query?where=1%3D1&outFields=*&&resultRecordCount=${limit}&resultOffset=${offset}&outSR=4326&f=geojson`;

const downloadGeo = async (file, path) => {
  const yr = file.name.match(/\d\d/)[0];
  const uppercase = file.code.toLowerCase() !== file.code;
  const ext = uppercase ? ["CD", "NM", "NMW"] : ["cd", "nm", "nmw"];
  const fields = ext.map(e => ({key: `${file.code}${yr}${e}`, label: `area${e.toLowerCase()}`}));
  
  let complete = false;
  let limit = 2000;
  let offset = 0;
  writeFileSync(path, "");
  while (!complete) {
    const url = apiUrl(file, limit, offset);
    console.log(`Fetching ${url}`);
    let geo = JSON.parse(await fetch(url));
    if (geo.features) {
      if (geo.features.length > 0) {
        appendFileSync(path, `${geo.features.map(feature => {
          const props = {};
          for (const field of fields) {
            if (feature.properties[field.key]) props[field.label] = feature.properties[field.key];
          }
          feature.properties = props;
          return JSON.stringify(feature);
        }).join("\n")}\n`);
      } else {
        complete = true;
      }
      if (geo?.properties?.exceededTransferLimit) {
        offset += geo.features.length;
      } else {
        complete = true;
      }
    } else {
      limit = Math.floor(limit / 2);
      if (limit < 1) {
        complete = true;
        console.log("Download failed!");
      } else {
        console.log(`Bad API response. Reducing limit to ${limit.toLocaleString()}...`);
      }
    }
  }
  console.log(`Downloaded and transformed ${path.replace(".jsonl", ".json.gz")}`);
}

const makeUrl = (id, ref_id) => {
  return id.slice(-2) === "_0" ?
    `https://opendata.arcgis.com/api/v3/datasets/${id}/downloads/data?format=csv&spatialRefId=${ref_id ? ref_id : 4326}&where=1%3D1` :
    `https://www.arcgis.com/sharing/rest/content/items/${id}/data`;
}

const downloadLookup = async (file, path) => {
  const href = makeUrl(file.id, file.ref_id);
  const data_raw = await fetch(href);
  const names = file.names ? file.names : ["areacd", "parentcd"];
  const data = csvParse(data_raw, (d) => {
    const row = {};
    for (let i = 0; i < file.fields.length; i ++) {
      row[names[i]] = d[file.fields[i]];
    }
    return row;
  });
  writeFileSync(path, csvFormat(data, names));
  console.log(`Downloaded ${path}`);
};

const convertGeo = async (path) => {
  const out_path = path.replace(".jsonl", ".json");
  const precision = path.includes("_bf") || path.includes("_pwc") ? 6 : path.includes("_bu") ? 4 : 5;
  const opts = {env: {"OGR_GEOJSON_MAX_OBJ_SIZE": 8000}};
  await run(`ogr2ogr -f GeoJSONSeq -lco COORDINATE_PRECISION=${precision} ${out_path} ${path}`, opts);
  unlinkSync(path);
  return await run(`gzip ${out_path}`);
};

async function downloadFiles() {
  for (const key of keys) {
    const dir = `./input/${key}`;
    if (!existsSync(dir)) mkdirSync(dir);
    for (const file of source_files[key]) {
      const path = `${dir}/${file.name}${file.name.includes(".") ? "" : ".jsonl"}`;
      const out_path = path.replace(".jsonl", ".json.gz");
      if (existsSync(path) || existsSync(`${out_path}`)) {
        console.log(`${path} already downloaded`);
      } else {
        if (["boundaries", "centroids"].includes(key)) {
          // Simplify and gzip json-ld features
          await downloadGeo(file, path);
          await convertGeo(path);
        } else if (key === "census") {
          await downloadLookup(file, path);
        } else {
          await download(file.href, path);
        }
      }
    }
  }
}
downloadFiles();