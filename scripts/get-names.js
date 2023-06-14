import { readdirSync, readFileSync, writeFileSync, createReadStream } from "fs";
import zlib from "zlib";
import readline from "line-by-line";
import { csvFormat } from "d3-dsv";
import { csvParse } from "./utils.js";

const geo_dir = "./input/boundaries"
const msoa_path = "./input/other/msoa_names.csv";
const outpath_names = "./input/lookups/lookup_names.csv";
const outpath_typecds = "./input/other/typecds.json";

const cols = ["areacd", "areanm", "areanmw", "hclnm", "hclnmw"];

let lookup = {};
let typecds = {};

function getGeoNames(geo, latest) {
  return new Promise((resolve) => {
    const input = `./input/boundaries/${geo.path}`;

    console.log(`Getting names from  ${geo.path}`);
    const cds = [];
    writeFileSync(outpath_names, "");

    const lineReader = new readline(createReadStream(input).pipe(zlib.createGunzip()));

    lineReader.on('line', (line) => {
      lineReader.pause();
      const feature = JSON.parse(line);
      const props = {};
      Object.keys(feature.properties).forEach(key => {
        // Filter to remove empty props
        if (feature.properties[key] && feature.properties[key] !== " ") {
          props[key] = feature.properties[key];
        }
      });
      lookup[feature.properties.areacd] = props;
      if (!cds.includes(props.areacd.slice(0, 3))) cds.push(props.areacd.slice(0, 3));
      lineReader.resume();
    });

    lineReader.on("end", async () => {
      if (latest) typecds[geo.cd] = cds;
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
writeFileSync(outpath_names, csvFormat(data, cols));
console.log(`Wrote ${outpath_names}`);

writeFileSync(outpath_typecds, JSON.stringify(typecds));
console.log(`Wrote ${outpath_typecds}`);
