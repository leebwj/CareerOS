// CareerOS · secretary — daily runner.
// Composes the brief, always writes it to out/brief.md + prints it, and emails
// it to you IF config.mjs exists with Gmail credentials. Follow-ups are pulled
// LIVE from your tracker's Google Sheet when config.sheetUrl is set. Safe to run
// with no config (print-only). Runs on GitHub Actions (.github/workflows/
// secretary.yml) so it fires every day regardless of whether your PC is on.
//
//   node run.mjs           compose + print (+ email if configured)
//   node run.mjs --no-mail  never email, even if configured
//   node run.mjs --quiet    don't print the brief body (implied by CI)

import { composeBrief, fetchTrackerState } from "./brief.mjs";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const configPath = join(ROOT, "config.mjs");

// load config up front — needed for the sheet URL, before composing the brief
let cfg = {};
if (existsSync(configPath)) {
  try { cfg = (await import(pathToFileURL(configPath).href)).default; }
  catch (e) { console.error("[secretary] config load failed:", e.message); }
}
// Env overlays the file, so the same runner works on GitHub Actions where
// config.mjs is gitignored and never gets checked out — the values arrive as
// repo secrets instead. Only non-empty vars overlay, so a half-set env can't
// blank out a working local config.
for (const [k, v] of Object.entries({
  gmailUser: process.env.GMAIL_USER,
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD,
  to: process.env.MAIL_TO,
  sheetUrl: process.env.TRACKER_SHEET_URL,
})) if (v) cfg[k] = v;

// The brief names companies you've applied to and when. On Actions the job log
// is as public as the repo, so the body must never reach stdout there.
const quiet = process.argv.includes("--quiet") || !!process.env.CI;

// pull follow-ups LIVE from the tracker's Google Sheet (if configured)
const trackerState = await fetchTrackerState(cfg.sheetUrl);
if (cfg.sheetUrl) {
  console.log(trackerState
    ? "[secretary] tracker follow-ups pulled from sheet ✓"
    : "[secretary] sheet configured but no state fetched — check the /exec URL + access");
}

// A GitHub runner is UTC, and 08:00 KST is 23:00 UTC the PREVIOUS day — dating
// the brief off UTC would head it with yesterday's weekday and shift the "new
// since yesterday" window. Take the date in the reader's timezone. en-CA
// formats as YYYY-MM-DD.
const todayISO = new Date().toLocaleDateString("en-CA", { timeZone: process.env.BRIEF_TZ || "Asia/Seoul" });
const brief = await composeBrief(todayISO, trackerState);

mkdirSync(join(ROOT, "out"), { recursive: true });
if (brief.md) writeFileSync(join(ROOT, "out", "brief.md"), brief.md);
if (quiet) console.log(`[secretary] brief composed for ${todayISO}${brief.stats ? ` — ${JSON.stringify(brief.stats)}` : " (empty)"}`);
else console.log("\n" + brief.text + "\n");

const wantMail = !process.argv.includes("--no-mail");

if (wantMail && !brief.empty && cfg.gmailUser) {
  try {
    const { sendMail } = await import("./send.mjs");
    // minimal markdown → html for the email body
    const html = `<div style="font-family:-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.5;color:#1a1d21;max-width:600px">` +
      brief.md
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/^# (.*)$/gm, '<h2 style="margin:0 0 12px">$1</h2>')
        .replace(/^## (.*)$/gm, '<h3 style="margin:18px 0 6px;color:#3a5bbf">$1</h3>')
        .replace(/\[apply\]\((.*?)\)/g, '<a href="$1" style="color:#3a5bbf">apply →</a>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color:#3a5bbf">$1</a>')
        // safety net: linkify any bare URL not already inside an href="…"
        .replace(/(?<!["(>])(https?:\/\/[^\s<)"]+)/g, '<a href="$1" style="color:#3a5bbf">$1</a>')
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/^- (.*)$/gm, '<div style="margin:3px 0">• $1</div>')
        // italic: only match _..._ at a word boundary with no underscores inside,
        // so URL query params (utm_campaign&utm_source…) inside hrefs are never touched
        .replace(/(^|[\s>])_([^_<>\n]+)_/g, '$1<span style="color:#828c99">$2</span>')
        .replace(/\n\n/g, "<br>") +
      `</div>`;
    await sendMail({
      user: cfg.gmailUser,
      pass: cfg.gmailAppPassword,
      to: cfg.to || cfg.gmailUser,
      subject: `☀️ Morning brief — ${brief.stats.hot} hot · ${brief.stats.followups} follow-ups`,
      text: brief.text,
      html,
    });
    console.log("[secretary] emailed ✓");
  } catch (e) {
    console.error("[secretary] email failed:", e.message);
    process.exitCode = 1;
  }
} else if (wantMail && !cfg.gmailUser) {
  console.error(process.env.CI
    ? "[secretary] no mail credentials — set GMAIL_USER / GMAIL_APP_PASSWORD / MAIL_TO as repo secrets."
    : "[secretary] no credentials — printed only. Copy config.example.mjs → config.mjs to enable email.");
  // A scheduled run that silently sends nothing is worse than a red X — you'd
  // never know the brief had stopped arriving.
  if (process.env.CI) process.exitCode = 1;
} else if (wantMail && brief.empty) {
  console.error("[secretary] roles feed was empty — nothing sent.");
  if (process.env.CI) process.exitCode = 1;
}
