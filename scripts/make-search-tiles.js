import readline from "line-by-line";
import geos from "../config/geo-config.js";
import { run, getValidBoundariesPath, writeGzip, clearTemp, mkdir } from "./utils.js";

const sources = geos
  .filter(g => g.key !== "uk")
  .map(g => {
    const year = g.years[g.years.length - 1];
    const path = getValidBoundariesPath(g.key, `${year}`.slice(-2), ["bgc", "bfc"]);
    return {key: g.key, year, path};
  });

function makeGeoJSONTiles(path, yr) {
  return new Promise((resolve) => {
    console.log(`Making GeoJSON tiles from ${path}...`);
    const lineReader = new readline(path);

    let currentTile;

    lineReader.on('line', (line) => {
      lineReader.pause();
      
      if (line.startsWith('{ "type": "FeatureCollection", "properties": { "zoom":')) {
        if (currentTile && currentTile.json.features.length > 0) {
          mkdir(currentTile.dir);
          writeGzip(currentTile.path, JSON.stringify(currentTile.json));
          console.log(`Wrote ${currentTile.path}`);
        }
        // const z = +line.match(/(?<="zoom":\s)\d+(?=,)/)[0];
        const x = +line.match(/(?<="x":\s)\d+(?=,)/)[0];
        const y = +line.match(/(?<="y":\s)\d+(?=\s)/)[0];
        const dir = `./output/search${yr}/${x}`;
        const path = `${dir}/${y}.json`;
        const json = {type: "FeatureCollection", features: []};
        currentTile = {dir, path, json};
      }

      let feature;

      try {
        feature = JSON.parse(line);
      }
      catch {
        // Suppress parsing errors
      }

      if (feature?.type === "Feature") {
        currentTile.json.features.push(feature);
      }

      lineReader.resume();
    });

    lineReader.on("end", async () => {
      resolve();
    });
  });
}

const yr = `${Math.max(...sources.map(l => l.year).flat())}`.slice(-2);
const output = `./temp/search${yr}.mbtiles`;

const mbtilesCmd = `tippecanoe -o ${output} --read-parallel --detect-shared-borders --no-feature-limit -Z 12 -z 12 ${sources.map(s => `-L boundaries:${s.path}`).join(" ")}`;

console.log("Generating search tiles...");
await run(mbtilesCmd);

const json_path = `./temp/search${yr}.json`;

console.log("Unpacking search tiles...");
const unpackCmd = `tippecanoe-decode ${output} > ${json_path}`;
await run(unpackCmd);

await makeGeoJSONTiles(json_path, yr);

clearTemp();
