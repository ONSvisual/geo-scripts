import { readFileSync, writeFileSync } from "fs";
import { csvFormat } from "d3-dsv";
import { csvParse } from "./utils.js";
import geos from "../config/geo-config.js";

const filter = {cp: ["E", "W"]};
const extra = {cp: [{areacd: "K04000001", areanm: "England and Wales"}]};
const lists = Array.from(new Set(geos.map(g => g.list).flat().filter(l => l)));

const inpath = "./input/lookups/lookup.csv";
const data = csvParse(readFileSync(inpath, {encoding: 'utf8', flag: 'r'}));

const typecds = {};
for (const geo of geos) typecds[geo.key] = geo.codes;

for (const list of lists) {
  const include = {};
  for (const g of geos) {
    for (const c of g.codes) {
      if (g?.list?.includes(list) && (!filter[list] || filter[list].includes(c[0]))) include[c] = g;
    }
  }

  const rows =  extra[list] || [];
  for (const d of data) {
    const incl = include[d.areacd.slice(0, 3)];
    if (incl && !d.end) {
      const row = {areacd: d.areacd, areanm: d.hclnm || d.areanm};
      if (incl.listparents) row.parentcd = d.parentcd;
      rows.push(row);
    }
  }
  
  const path = `./output/${list}_places.csv`;
  writeFileSync(path, csvFormat(rows));
  console.log(`Wrote ${path}`);
}