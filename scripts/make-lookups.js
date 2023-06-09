import { readFileSync, writeFileSync } from "fs";
import xlsx from "xlsx";
import { csvFormat } from "d3-dsv";
import { csvParse } from "./utils.js";
import files from "../config/source-files.js";

const area_path = "./config/lookups/lookup_area.ods";
const parents_aux_path = "./config/lookups/lookup_parent_aux.csv";
const changes_path = "./config/lookups/lookup_changes.csv";
const msoa_path = "./input/other/msoa_names.csv";
const nomis_path = "./input/other/nomis_codes.csv";

const all_outpath = "./input/lookups/lookup.csv";
const names_outpath = "./input/lookups/lookup_names.csv";
const cauth_outpath = "./input/lookups/lookup_cauth.csv";

const cols_all = ["areacd", "areanm", "areanmw", "hclnm", "hclnmw", "parentcd", "nomiscd", "km2_extent", "km2_clipped", "km2_water", "km2_land", "change", "successor"];
const cols_names = cols_all.slice(0, 5);

const lookup = {};
for (const file of files.parents) {
  const path = `./input/parents/${file.name}`;
  const raw = readFileSync(path, {encoding: 'utf8', flag: 'r'});
  const rows = csvParse(raw);
  rows.forEach(row => lookup[row.areacd] = row);
}

const parents_aux_raw = readFileSync(parents_aux_path, {encoding: 'utf8', flag: 'r'});
const parents_aux_data = csvParse(parents_aux_raw);
parents_aux_data.forEach(d => lookup[d.areacd] = d);

const changes_raw = readFileSync(changes_path, {encoding: 'utf8', flag: 'r'});
const changes_data = csvParse(changes_raw);
changes_data.forEach(d => lookup[d.areacd] = {...d, change: d.year, successor: d.newcd});

const names_lookup = {};
for (const file of files.names) {
  const path = `./input/names/${file.name}`;
  const raw = readFileSync(path, {encoding: 'utf8', flag: 'r'});
  const rows = csvParse(raw);
  rows.forEach(row => {
    names_lookup[row.areacd] = row;
    if (!lookup[row.areacd]) lookup[row.areacd] = row;
  });
}

const data = Object.keys(lookup).map(key => lookup[key]);

const msoa_raw = readFileSync(msoa_path, {encoding: 'utf8', flag: 'r'});
const msoa_data = csvParse(msoa_raw);
const msoa_lookup = {};
msoa_data.forEach(d => msoa_lookup[d.msoa21cd] = d);

const nomis_raw = readFileSync(nomis_path, {encoding: 'utf8', flag: 'r'});
const nomis_data = csvParse(nomis_raw);
const nomis_lookup = {};
nomis_data.forEach(d => nomis_lookup[d.GEOGRAPHY_CODE] = d);

const area_ods = xlsx.readFile(area_path);
const area_data = area_ods.SheetNames.map(sheet => {
  return xlsx.utils.sheet_to_json(area_ods.Sheets[sheet]);
}).flat();
const area_lookup = {};
area_data.forEach(d => area_lookup[d.areacd] = d);

data.forEach(d => {
  const name_lkp = names_lookup[d.areacd];
  const msoa_lkp = msoa_lookup[d.areacd];
  const nomis_lkp = nomis_lookup[d.areacd];
  if (name_lkp) {
    d.areanm = name_lkp.areanm;
    if (name_lkp.areanmw) d.areanmw = name_lkp.areanmw;
  }
  if (msoa_lkp) {
    d.hclnm = msoa_lkp.msoa21hclnm;
    if (msoa_lkp.msoa21hclnmw) d.hclnmw = msoa_lkp.msoa21hclnmw;
  }
  if (nomis_lkp) d.nomiscd = nomis_lkp.GEOGRAPHY;
  const area_lkp = area_lookup[d.areacd];
  if (area_lkp) {
    d.km2_extent = area_lkp.km2_extent;
    d.km2_clipped = area_lkp.km2_clipped;
    d.km2_water = area_lkp.km2_water;
    d.km2_land = area_lkp.km2_land;
  }
});



writeFileSync(all_outpath, csvFormat(data, cols_all));
console.log(`Wrote ${all_outpath}`);

writeFileSync(names_outpath, csvFormat(data.filter(d => d.areanm || d.hclnm), cols_names));
console.log(`Wrote ${names_outpath}`);

const cauth_lookup = data
  .filter(d => d.parentcd && ["E06", "E10"].includes(d.areacd.slice(0, 3)) && d.parentcd.slice(0, 3) === "E47")
  .map(d => ({areacd: d.areacd, cauth: true}));
writeFileSync(cauth_outpath, csvFormat(cauth_lookup));
console.log(`Wrote ${cauth_outpath}`);