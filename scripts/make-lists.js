import { readFileSync, readdirSync, writeFileSync } from "fs";
import { csvFormat } from "d3-dsv";
import { readGzip } from "./utils.js";
import geos from "../config/geo-config.js";

let lists = [];
geos.forEach(g => {
  if (g.list) lists = [...lists, ...g.list];
});
lists = Array.from(new Set(lists));

const typecds = JSON.parse(readFileSync("./input/other/typecds.json", {encoding: 'utf8', flag: 'r'}));

for (const list of lists) {
  let rows = [];
  let cds = [];
  let pt_cds = [];
  geos.forEach(g => {
    if (g.list && g.list.includes(list)) {
      const newcds = typecds[g.key].filter(cd => !g.filter || g.filter.includes(cd[0]));
      cds = [...cds, ...newcds];
      if (g.listparents) pt_cds = [...pt_cds, ...newcds];
    }
  });
  for (const cd of cds) {
    const dir = `./output/geos/${cd}`;
    const files = readdirSync(dir).filter(f => f.slice(-5) === ".json");
    for (const file of files) {
      const feature = JSON.parse(readGzip(`${dir}/${file}`));
      const props = feature.properties;
      if (!props.end) rows.push({
        areacd: props.areacd,
        areanm: props.areanm,
        parentcd: pt_cds.includes(cd) ? props.parents[0]?.areacd : null
      });
    }
  }
  rows.sort((a, b) => a.areanm.localeCompare(b.areanm));
  const path = `./output/${list}_places.csv`;
  writeFileSync(path, csvFormat(rows));
  console.log(`Wrote ${path}`);
}