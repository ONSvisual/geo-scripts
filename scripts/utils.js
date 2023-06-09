import https from "https";
// import fs from "fs";
import { exec } from "child_process";
import * as d3 from "d3-dsv";

export function csvParse(str, row = d3.autoType) {
  return d3.csvParse(str.replace(/\uFEFF/, ''), row);
}

export function makeLookup(data, key = "areacd") {
  const lookup = {};
  data.forEach(d => lookup[d[key]] = d);
  return lookup;
}

export function fetch(url) {
  return new Promise((resolve) => {
    https.get(url, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => {
        resolve(data);
      });
    })
    .on("error", (err) => {
      console.log("Error: " + err.message);
    });
  });
}

export async function download(url, dest) {
  await run(`curl -o "${dest}" "${url}"`);
  console.log(`Downloaded ${dest}`);
  return;
}

export function run(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, opts, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

export async function clearTemp() {
  try {
    await run("rm ./temp/*");
    console.log("Emptied /temp folder");
  }
  catch {
    console.log("No files to delete in /temp");
  }
}

// export function run(cmd, opts = {}) {
//   return new Promise((resolve, reject) => {
//     const child = spawn(cmd, opts);
//     child.stdout.on('data', (data) => {
//       console.log('stdout: ' + data);
//     });
//     child.stderr.on('data', (data) => {
//       console.log('stderr: ' + data);
//       resolve();
//     });
//     child.on('close', resolve);
//   });
// }