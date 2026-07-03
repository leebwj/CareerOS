// CareerOS · resume — résumé-as-code.
// Reads resume-data.mjs (gitignored — personal), renders both variants to
// out/*.docx via docx-gen.mjs, and (on Windows with Word installed) exports
// PDFs + verifies the one-page rule via Word COM.
//
// Run: node build.mjs        (docx only)
//      node build.mjs --pdf  (docx + PDF + page-count check; needs Word)

import { buildDocx } from "./docx-gen.mjs";
import { variants } from "./resume-data.mjs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { rmSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "out");

for (const [name, spec] of Object.entries(variants)) {
  const pkg = join(OUT, `pkg-${name}`);
  const docx = join(OUT, `Brian_Lee_Resume_${name}.docx`);
  if (existsSync(pkg)) rmSync(pkg, { recursive: true });
  buildDocx({ ...spec, out: pkg });
  if (existsSync(docx)) rmSync(docx);
  execSync(
    `powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${pkg.replace(/\\/g, "/")}', '${docx.replace(/\\/g, "/")}')"`
  );
  console.log(`✓ ${docx}`);
}

if (process.argv.includes("--pdf")) {
  const script = `
$word = New-Object -ComObject Word.Application; $word.Visible = $false
Get-ChildItem '${OUT.replace(/\\/g, "/")}' -Filter *.docx | ForEach-Object {
  $doc = $word.Documents.Open($_.FullName, $false, $true)
  $pages = $doc.ComputeStatistics(2)
  $pdf = $_.FullName -replace '\\.docx$', '.pdf'
  $doc.SaveAs([ref]$pdf, [ref]17)
  $doc.Close($false)
  Write-Output ($_.BaseName + ': ' + $pages + ' page(s)')
  if ($pages -gt 1) { Write-Output ('  ⚠ OVER ONE PAGE — trim before sending') }
}
$word.Quit()`;
  console.log(execSync(`powershell -NoProfile -Command "${script.replace(/"/g, '\\"').replace(/\n/g, "; ")}"`).toString());
}
