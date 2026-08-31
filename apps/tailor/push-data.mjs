// Serializes the résumé data for the deployed tailor page and prints the
// steps to store it as the TAILOR_DATA env var (gzip + base64 keeps it far
// under Vercel's env size limit). Run again after editing resume-data.mjs.
//
//   node push-data.mjs [outfile]

import { gzipSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { buildData } from "./data.mjs";

const json = JSON.stringify(buildData());
const b64 = gzipSync(Buffer.from(json, "utf8")).toString("base64");
const out = process.argv[2] || "tailor-data.b64";
writeFileSync(out, b64);
console.log(`data: ${json.length} bytes json -> ${b64.length} bytes base64 gzip`);
console.log(`written to ${out} (gitignored). Store it with:`);
console.log(`  cd ../portfolio`);
console.log(`  npx vercel env rm TAILOR_DATA production -y`);
console.log(`  npx vercel env add TAILOR_DATA production --sensitive < ../tailor/${out}`);
console.log(`then redeploy so the function picks it up.`);
