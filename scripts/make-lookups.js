import { readFileSync, writeFileSync } from "fs";
import xlsx from "xlsx";
import { csvFormat } from "d3-dsv";
import { csvParse } from "./utils.js";
import files from "../config/source-files.js";

const name_path = "./input/lookups/lookup_names.csv";
const area_path = "./config/lookups/lookup_area.ods";
const parent_path = "./config/lookups/lookup_parent.csv";
const nomis_path = "./input/other/nomis_codes.csv";

const all_outpath = "./input/lookups/lookup.csv";
const cauth_outpath = "./input/lookups/lookup_cauth.csv";

const cols = [
  "areacd", "areanm", "areanmw",
  "hclnm", "hclnmw",
  "parentcd", "nomiscd",
  "start", "end",
  "km2_extent", "km2_clipped", "km2_water", "km2_land"
];

const lookup = {};

const name_raw = readFileSync(name_path, {encoding: 'utf8', flag: 'r'});
const name_data = csvParse(name_raw);
name_data.forEach(d => lookup[d.areacd] = d);

for (const file of files.parents) {
  const path = `./input/parents/${file.name}`;
  const raw = readFileSync(path, {encoding: 'utf8', flag: 'r'});
  const data = csvParse(raw);
  data.forEach(d => {
    if (lookup[d.areacd]) lookup[d.areacd].parentcd = d.parentcd;
  });
}

const parent_raw = readFileSync(parent_path, {encoding: 'utf8', flag: 'r'});
const parent_data = csvParse(parent_raw);
parent_data.forEach(d => {
  if (lookup[d.areacd]) lookup[d.areacd].parentcd = d.parentcd;
});

const nomis_raw = readFileSync(nomis_path, {encoding: 'utf8', flag: 'r'});
const nomis_data = csvParse(nomis_raw);
nomis_data.forEach(d => {
  if (lookup[d.GEOGRAPHY_CODE]) lookup[d.GEOGRAPHY_CODE].nomiscd = d.GEOGRAPHY
});

const area_ods = xlsx.readFile(area_path);
const area_data = area_ods.SheetNames.map(sheet => {
  return xlsx.utils.sheet_to_json(area_ods.Sheets[sheet]);
}).flat();
area_data.forEach(d => {
  if (lookup[d.areacd]) {
    lookup[d.areacd].km2_extent = d.km2_extent;
    lookup[d.areacd].km2_clipped = d.km2_clipped;
    lookup[d.areacd].km2_water = d.km2_water;
    lookup[d.areacd].km2_land = d.km2_land;
  }
});

const data = Object.keys(lookup).map(key => lookup[key]);

writeFileSync(all_outpath, csvFormat(data, cols));
console.log(`Wrote ${all_outpath}`);

const cauth_lookup = data
  .filter(d => d.parentcd && ["E06", "E10"].includes(d.areacd.slice(0, 3)) && d.parentcd.slice(0, 3) === "E47")
  .map(d => ({areacd: d.areacd, cauth: true}));
writeFileSync(cauth_outpath, csvFormat(cauth_lookup));
console.log(`Wrote ${cauth_outpath}`);