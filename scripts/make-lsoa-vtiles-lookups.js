import { readFileSync, writeFileSync } from "fs";
import { csvFormat } from "d3-dsv";
import { csvParse, makeLookup } from "./utils.js";

// Set target feature count per zoom level
// Sort MSOAs by size, in ascending order (with total child counts for each)
// For each zoom level, 

const areas = csvParse(readFileSync("./input/lookups/lookup.csv", {encoding: 'utf8', flag: 'r'}));
const areas_lookup = makeLookup(areas);

const codes_raw = readFileSync("./input/parents/lsoa21_msoa21.csv", {encoding: 'utf8', flag: 'r'});
const lsoa_data = csvParse(
  codes_raw,
  d => ({areacd: d.areacd, parentcd: d.parentcd, area: areas_lookup[d.areacd].km2_clipped})
);
console.log("Loaded LSOA data");

const msoa_index = {};
lsoa_data.forEach(d => {
  if (!msoa_index[d.parentcd]) msoa_index[d.parentcd] = {areacd: d.parentcd, area: 0, count: 0, children: [], childarea: 0};
  msoa_index[d.parentcd].area += d.area;
  msoa_index[d.parentcd].count += 1;
  msoa_index[d.parentcd].children.push(d.areacd);
  if (d.area > msoa_index[d.parentcd].childarea) {
    msoa_index[d.parentcd].child = d.areacd;
    msoa_index[d.parentcd].childarea = d.area;
  }
});
const msoa_data = Object.keys(msoa_index).map(key => msoa_index[key]);
console.log("Made MSOA data");

const msoa_sorted = [...msoa_data].sort((a, b) => a.area - b.area);

const drop_rate = 2;
const count = lsoa_data.length;
const targets = [count];

while (targets[targets.length - 1] > msoa_data.length) {
  const new_target = Math.floor(targets[targets.length - 1] / drop_rate);
  targets.push(new_target > msoa_data.length ? new_target : msoa_data.length);
}
console.log("Target feature counts", targets);

const merges = [];

for (let i = 0; i < targets.length - 1; i ++) {
  let merge = [];
  let count = targets[i];
  while (count > targets[i + 1]) {
    if (!msoa_sorted[0]) break;
    count = count + 1 - msoa_sorted[0].count;
    merge = [...merge, msoa_sorted.shift()];
  }
  merges.push(merge);
}

console.log("Generating code merge lookup by zoom level...");
const lsoa_index = {};
let cols = ["areacd"];

lsoa_data.forEach(lsoa => {
  const row = {areacd: lsoa.areacd};
  for (let i = 0; i < merges.length; i ++) {
    row[`areacd${i}`] = lsoa.areacd;
  }
  lsoa_index[lsoa.areacd] = row;
});
for (let i = 0; i < merges.length; i ++) {
  const merge = merges[i];
  for (const m of merge) {
    for (const c of m.children) {
      for (let j = i; j < merges.length; j ++) {
        lsoa_index[c][`areacd${j}`] = m.child;
        lsoa_index[c][`parentcd${j}`] = m.areacd;
      }
    }
  }
  cols = [...cols, `areacd${i}`, `parentcd${i}`];
  console.log(i, (new Set(Object.keys(lsoa_index).map(key => lsoa_index[key][`areacd${i}`]))).size);
}
const oa_lookup = Object.keys(lsoa_index).map(key => lsoa_index[key]);

const oa_path = "./input/lookups/lookup_vtiles_lsoa21.csv";
writeFileSync(oa_path, csvFormat(oa_lookup, cols));
console.log(`Wrote ${oa_path}`);

const msoa_path = "./input/lookups/lookup_vtiles_msoa21.csv";
writeFileSync(msoa_path, csvFormat(msoa_data.map(d => ({areacd: d.areacd, childcd: d.child}))));
console.log(`Wrote ${msoa_path}`);