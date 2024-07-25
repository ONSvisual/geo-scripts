import { readdirSync, readFileSync, writeFileSync, createReadStream } from "fs";
import zlib from "zlib";
import readline from "line-by-line";
import { csvFormat } from "d3-dsv";
import { csvParse } from "./utils.js";
import geo_config from "../config/geo-config.js";

const geo_dir = "./input/boundaries"
const msoa_path = "./input/other/msoa_names.csv";
const outpath_names = "./input/lookups/lookup_names.csv";
const outpath_typecds = "./input/other/typecds.json";

const cols = ["areacd", "areanm", "areanmw", "hclnm", "hclnmw", "start", "end"];

let lookup = {};
let typecds = {};
let typeyrs = {};

function getGeoNames(geo, latest) {
  return new Promise((resolve) => {
    const filter = geo_config.find(d => d.key === geo.cd)?.filter;
    const input = `./input/boundaries/${geo.path}`;

    console.log(`Getting names from ${geo.path}`);
    const cds = [];
    writeFileSync(outpath_names, "");

    const lineReader = new readline(createReadStream(input).pipe(zlib.createGunzip()));

    lineReader.on('line', (line) => {
      lineReader.pause();
      const feature = JSON.parse(line);
      if (!filter || filter.includes(feature.properties.areacd[0])) {
        if (lookup[feature.properties.areacd]) {
          lookup[feature.properties.areacd].years.push(geo.yr + 2000);
        } else {
          const props = {};
          Object.keys(feature.properties).forEach(key => {
            // Filter to remove empty props
            if (feature.properties[key] && feature.properties[key] !== " ") {
              props[key] = feature.properties[key];
            }
          });
          props.years = [geo.yr + 2000];
          lookup[feature.properties.areacd] = props;
        }
        const cd = feature.properties.areacd.slice(0, 3);
        if (!cds.includes(cd)) cds.push(cd);
      }
      lineReader.resume();
    });

    lineReader.on("end", async () => {
      if (latest) typecds[geo.cd] = cds;
      for (const cd of cds) {
        if (!typeyrs[cd]) typeyrs[cd] = [];
        typeyrs[cd].push(geo.yr + 2000);
      }
      resolve();
    });
  });
}

function addMSOANames() {
  const msoa_raw = readFileSync(msoa_path, {encoding: 'utf8', flag: 'r'});
  const rows = csvParse(msoa_raw);
  for (const row of rows) {
    lookup[row.msoa21cd].hclnm = row.msoa21hclnm;
    if (row.msoa21hclnmw) lookup[row.msoa21cd].hclnmw = row.msoa21hclnmw;
  }
}

const files = readdirSync(geo_dir).filter(f => f.slice(-8) === ".json.gz");
const prefixes = files.map(f => f.split("_")[0]);
const prefixes_unique = Array.from(new Set(prefixes));
const geos = prefixes_unique.map(p => {
  const path = files[prefixes.lastIndexOf(p)];
  return {
    path,
    cd: path.match(/[a-z]*(?=\d)/)[0],
    yr: +path.match(/\d\d/)[0]
  };
});

for (const geo of geos) {
  await getGeoNames(geo, geo.yr === Math.max(...geos.filter(g => g.cd === geo.cd).map(g => g.yr)));
}
addMSOANames();

const data = Object.keys(lookup).map(key => lookup[key]);
for (const d of data) {
  const typecd = d.areacd.slice(0, 3);
  if (d.years.length < typeyrs[typecd].length) {
    if (d.years[0] > typeyrs[typecd][0]) d.start = d.years[0];
    if (d.years[d.years.length - 1] < typeyrs[typecd][typeyrs[typecd].length - 1]) {
      const last_valid_index = typeyrs[typecd].indexOf(d.years[d.years.length - 1]);
      d.end = typeyrs[typecd][last_valid_index + 1] - 1;
    };
  }
}

writeFileSync(outpath_names, csvFormat(data, cols));
console.log(`Wrote ${outpath_names}`);

writeFileSync(outpath_typecds, JSON.stringify(typecds));
console.log(`Wrote ${outpath_typecds}`);
