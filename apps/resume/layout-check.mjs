// Layout check for rendered résumés: how full the page is, and whether any
// bullet ends on a line holding only a word or two. Word does the measuring,
// so this matches what a recruiter opens.
//
//   node layout-check.mjs out/Brian_Lee_Resume_SWE.docx [more.docx ...]
//   node layout-check.mjs                 (checks everything in out/)
//
// A one-page résumé should land near the bottom margin: 720-750pt is full,
// under ~700pt reads as thin experience, over 759pt spills to page two.

import { execSync } from "node:child_process";
import { readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const files = args.length
  ? args.map((f) => resolve(f))
  : (existsSync(join(ROOT, "out")) ? readdirSync(join(ROOT, "out")).filter((f) => f.endsWith(".docx")).map((f) => join(ROOT, "out", f)) : []);
if (!files.length) {
  console.error("no .docx files to check");
  process.exit(2);
}

const ps = `
$word = New-Object -ComObject Word.Application; $word.Visible = $false
foreach ($f in @(${files.map((f) => `'${f.replace(/\\/g, "/")}'`).join(",")})) {
  $doc = $word.Documents.Open($f, $false, $true)
  $pages = $doc.ComputeStatistics(2)
  $end = $doc.Content.End
  $y = [math]::Round($doc.Range($end - 1, $end).Information(6), 1)
  Write-Output ('FILL|' + (Split-Path $f -Leaf) + '|' + $pages + '|' + $y)
  foreach ($p in $doc.Paragraphs) {
    $t = $p.Range.Text.Trim()
    if ($t.Length -lt 2) { continue }
    if ($p.Range.ComputeStatistics(1) -lt 2) { continue }
    $words = @($p.Range.Words); $lastLine = $null; $tail = @()
    for ($i = $words.Count - 1; $i -ge 0; $i--) {
      $wt = $words[$i].Text.Trim()
      if ($wt -eq '') { continue }
      $ln = $words[$i].Information(10)
      if ($null -eq $lastLine) { $lastLine = $ln }
      if ($ln -ne $lastLine) { break }
      $tail = ,$wt + $tail
    }
    if ($tail.Count -le 2) {
      Write-Output ('ORPHAN|' + (Split-Path $f -Leaf) + '|' + ($tail -join ' ') + '|' + $t.Substring(0, [Math]::Min(60, $t.Length)))
    }
  }
  $doc.Close($false)
}
$word.Quit()`;

const out = execSync(`powershell -NoProfile -Command "${ps.replace(/"/g, '\\"').replace(/\n/g, "; ")}"`).toString();
let bad = 0;
for (const line of out.split(/\r?\n/)) {
  const [kind, file, a, b] = line.split("|");
  if (kind === "FILL") {
    const pages = +a, y = +b;
    const verdict = pages > 1 ? "SPILLS to page " + pages : y < 700 ? "thin — " + Math.round(759 - y) + "pt of empty space" : "full";
    if (pages > 1 || y < 700) bad++;
    console.log(`${pages > 1 || y < 700 ? "x" : "+"} ${file}  ${y}pt  ${verdict}`);
  } else if (kind === "ORPHAN") {
    bad++;
    console.log(`x ${file}  orphan line "${a}" ends: ${b}...`);
  }
}
process.exit(bad ? 1 : 0);
