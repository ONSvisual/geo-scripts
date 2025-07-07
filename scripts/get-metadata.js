import { readdirSync, readFileSync, writeFileSync, createReadStream } from "fs";
import zlib from "zlib";
import readline from "line-by-line";
import { csvFormat } from "d3-dsv";
import { bbox, area } from "@turf/turf";
import { csvParse, round, roundAll, findPolylabel } from "./utils.js";
import geo_config from "../config/geo-config.js";

const startTime = new Date();

const geo_dir = "./input/boundaries"
const msoa_path = "./input/other/msoa_names.csv";
const outpath = "./input/lookups/lookup_metadata.csv";
const names_outpath = "./input/lookups/lookup_names.csv";

const cols = [
  "areacd", "areanm", "areanmw",
  "hclnm", "hclnmw",
  "start", "end",
  "areakm2", "centroid", "bounds"
];

const cdKeyLookup = {};
for (const geo of geo_config) {
  for (const cd of geo.codes) cdKeyLookup[cd] = geo.key;
}

let lookup = {};
let typeyrs = {};

function getGeoMetadata(geo) {
  return new Promise((resolve) => {
    const filter = geo_config.find(d => d.key === geo.cd)?.codes;
    const input = `./input/boundaries/${geo.path}`;

    console.log(`Getting metadata from ${geo.path}`);
    const keys = [];
    writeFileSync(outpath, "");

    const lineReader = new readline(createReadStream(input).pipe(zlib.createGunzip()));

    lineReader.on('line', (line) => {
      lineReader.pause();
      const feature = JSON.parse(line);
      if (filter.includes(feature.properties.areacd.slice(0, 3))) {
        if (lookup[feature.properties.areacd]) {
          lookup[feature.properties.areacd].years.push(geo.yr + 2000);
        } else {
          const props = {};
          for (const key of Object.keys(feature.properties)) {
            // Filter to remove empty props
            if (feature.properties[key] && feature.properties[key] !== " ") {
              props[key] = feature.properties[key];
            }
          }
          props.years = [geo.yr + 2000];
          props.areakm2 = round(area(feature) / 1e6, 4);
          props.centroid = roundAll(findPolylabel(feature)).join("|");
          props.bounds = bbox(feature).join("|");
          lookup[feature.properties.areacd] = props;
        }
        const key = cdKeyLookup[feature.properties.areacd.slice(0, 3)];
        if (!keys.includes(key)) keys.push(key);
      }
      lineReader.resume();
    });

    lineReader.on("end", async () => {
      for (const key of keys) {
        if (!typeyrs[key]) typeyrs[key] = [];
        typeyrs[key].push(geo.yr + 2000);
      }
      resolve();
    });
  });
}

function addMSOANames() {
  console.log("Adding MSOA names...")
  const msoa_raw = readFileSync(msoa_path, {encoding: 'utf8', flag: 'r'});
  const rows = csvParse(msoa_raw);
  for (const row of rows) {
    lookup[row.msoa21cd].hclnm = row.msoa21hclnm;
    if (row.msoa21hclnmw) lookup[row.msoa21cd].hclnmw = row.msoa21hclnmw;
  }
}

const getKey = (str) => str.match(/[a-z]*(?=\d)/)?.[0];
const sorted_keys = geo_config.map(g => g.key);

const files = readdirSync(geo_dir)
  .filter(f => f.slice(-8) === ".json.gz" && f.includes("_bfc"))
  .sort((a, b) => {
    return sorted_keys.indexOf(getKey(a)) - sorted_keys.indexOf(getKey(b));
  });
const geos = files.map(f => {
  return {
    path: f,
    cd: getKey(f),
    yr: +f.match(/\d\d/)[0]
  };
});

for (const geo of geos) {
  await getGeoMetadata(geo);
}
addMSOANames();

console.log("Adding start and end years...")
const data = Object.keys(lookup).map(key => lookup[key]);
for (const d of data) {
  const typekey = cdKeyLookup[d.areacd.slice(0, 3)];
  if (d.years.length < typeyrs[typekey].length) {
    if (d.years[0] > typeyrs[typekey][0]) d.start = d.years[0];
    if (d.years[d.years.length - 1] < typeyrs[typekey][typeyrs[typekey].length - 1]) {
      const last_valid_index = typeyrs[typekey].indexOf(d.years[d.years.length - 1]);
      d.end = typeyrs[typekey][last_valid_index + 1] - 1;
    };
  }
}

writeFileSync(outpath, csvFormat(data, cols));
console.log(`Wrote ${outpath}`);

writeFileSync(names_outpath, csvFormat(data, cols.slice(0, 5)));
console.log(`Wrote ${names_outpath}`);

const endTime = new Date();
const duration = Math.round((endTime - startTime) / 1000);
console.log(`Script completed in ${duration.toLocaleString()} seconds.`);
