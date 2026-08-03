// Diagnostic: are Microsoft / Google / Meta / Apple career APIs reachable, and
// do they return early-career SWE and Design roles? All four refused a probe
// from Brian's machine in Korea — Microsoft with a bare connection failure
// rather than an HTTP status, which points at geo-blocking rather than a wrong
// URL. Run this on a US runner to tell those two cases apart.
//
//   node apps/role-grabber/probe-giants.mjs
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const H = { "user-agent": UA, accept: "application/json,text/plain,*/*", "accept-language": "en-US,en;q=0.9" };

const EARLY = /\b(intern(ship)?|new ?grad|university ?grad|campus|co-?op|early ?career|student)\b/i;
const DESIGN = /\b(design(er)?|ux|ui|user experience|user research|visual|interaction|human interface)\b/i;

async function probe(label, url, opts, extract) {
  const t0 = Date.now();
  try {
    const r = await fetch(url, { headers: H, ...opts });
    const ms = Date.now() - t0;
    const body = await r.text();
    if (!r.ok) return console.log(`  ${label.padEnd(30)} HTTP ${r.status}  (${ms}ms, ${body.length}b)`);
    let rows = [];
    try { rows = extract(JSON.parse(body)) || []; }
    catch (e) { return console.log(`  ${label.padEnd(30)} HTTP 200 but body is not the JSON we expect (${body.slice(0, 60).replace(/\s+/g, " ")}…)`); }
    const early = rows.filter((x) => EARLY.test(x.t || ""));
    console.log(`  ${label.padEnd(30)} HTTP 200 · ${rows.length} rows · ${early.length} early-career · ${early.filter((x) => DESIGN.test(x.t)).length} design (${ms}ms)`);
    for (const x of early.slice(0, 6)) console.log(`      · ${String(x.t).slice(0, 70)}  [${String(x.l || "").slice(0, 30)}]`);
  } catch (e) {
    console.log(`  ${label.padEnd(30)} NETWORK FAIL — ${e.cause?.code || e.message}`);
  }
}

console.log("=== probing the four giants from this runner ===\n");

console.log("MICROSOFT");
await probe("careers search api",
  "https://gcsservices.careers.microsoft.com/search/api/v1/search?q=intern&l=en_us&pg=1&pgSz=20&o=Recent&flt=true",
  {}, (d) => (d?.operationResult?.result?.jobs || []).map((j) => ({ t: j.title, l: (j.properties?.locations || []).join("; ") })));

console.log("\nAPPLE");
await probe("jobs.apple.com search (POST)", "https://jobs.apple.com/api/role/search",
  { method: "POST", headers: { ...H, "content-type": "application/json", referer: "https://jobs.apple.com/en-us/search" },
    body: JSON.stringify({ query: "intern", filters: {}, page: 1, locale: "en-us", sort: "newest" }) },
  (d) => (d.searchResults || []).map((j) => ({ t: j.postingTitle, l: (j.locations || []).map((x) => x.name).join("; ") })));

console.log("\nGOOGLE");
await probe("careers v3", "https://careers.google.com/api/v3/search/?q=intern&page_size=20",
  {}, (d) => (d.jobs || []).map((j) => ({ t: j.title, l: (j.locations || []).map((x) => x.display).join("; ") })));
await probe("about/careers v2", "https://www.google.com/about/careers/applications/api/v2/search?q=intern&page_size=20",
  {}, (d) => (d.jobs || []).map((j) => ({ t: j.title || j.job_title, l: (j.locations || []).map((x) => x.display).join("; ") })));

console.log("\nMETA");
await probe("metacareers graphql", "https://www.metacareers.com/graphql",
  { method: "POST", headers: { ...H, "content-type": "application/x-www-form-urlencoded" },
    body: "doc_id=9114524511922157&variables=" + encodeURIComponent(JSON.stringify({ search_input: { q: "intern", divisions: [], results_per_page: 20 } })) },
  (d) => (d?.data?.job_search_with_featured_jobs?.all_jobs || []).map((j) => ({ t: j.title, l: (j.locations || []).join("; ") })));

console.log("\n=== done ===");
