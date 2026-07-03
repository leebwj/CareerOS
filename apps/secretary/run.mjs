// CareerOS · secretary — daily runner.
// Composes the brief, always writes it to out/brief.md + prints it, and emails
// it to you IF config.mjs exists with Gmail credentials. Safe to run with no
// config (print-only). Wire this into Windows Task Scheduler at 08:00.
//
//   node run.mjs           compose + print (+ email if configured)
//   node run.mjs --no-mail  never email, even if configured

import { composeBrief } from "./brief.mjs";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const brief = await composeBrief();

mkdirSync(join(ROOT, "out"), { recursive: true });
if (brief.md) writeFileSync(join(ROOT, "out", "brief.md"), brief.md);
console.log("\n" + brief.text + "\n");

const wantMail = !process.argv.includes("--no-mail");
const configPath = join(ROOT, "config.mjs");

if (wantMail && !brief.empty && existsSync(configPath)) {
  try {
    const { default: cfg } = await import(pathToFileURL(configPath).href);
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
} else if (wantMail && !existsSync(configPath)) {
  console.log("[secretary] no config.mjs — printed only. Copy config.example.mjs → config.mjs to enable email.");
}
