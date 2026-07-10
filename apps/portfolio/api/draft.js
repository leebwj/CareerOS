// ═══ CareerOS Apply-Helper V2 — answer drafter (Vercel serverless function) ═══
// Drafts a job-application answer from Brian's background via the Claude API.
//
// The API key lives ONLY in Vercel's env (ANTHROPIC_API_KEY) — never in this
// repo (leebwj/CareerOS is public; a committed key gets drained in minutes).
// The endpoint is public, so it's gated by APPLY_SECRET: the /apply page asks
// for the passphrase once and sends it as `x-apply-key`. No match → 401.
// Zero dependencies: plain fetch to the Messages API (Vercel Node 18+ has fetch).

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8"; // set ANTHROPIC_MODEL=claude-sonnet-5 in Vercel for a cheaper drafter
const MAX_Q = 2000; // cap question length so one request can't run away
const MAX_CTX = 500;
const MAX_PROFILE = 8000;

const SYSTEM =
  "You are helping me answer a job-application question. Write a first-person answer in my voice — confident but honest, specific, no clichés or filler, no invented facts. Use only the background I provide; if a needed detail is missing, leave a [bracketed placeholder] for me to fill in. Keep it tight and ready to paste — no preamble, just the answer.";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  const secret = process.env.APPLY_SECRET;
  if (!key || !secret) {
    return res.status(500).json({
      error: "Not configured — set ANTHROPIC_API_KEY and APPLY_SECRET in the Vercel project's Environment Variables.",
    });
  }

  if ((req.headers["x-apply-key"] || "") !== secret) {
    return res.status(401).json({ error: "Wrong passphrase." });
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : req.body || {};
  const question = String(body.question || "").slice(0, MAX_Q).trim();
  const context = String(body.context || "").slice(0, MAX_CTX).trim();
  const profile = String(body.profile || "").slice(0, MAX_PROFILE).trim();
  if (!question) return res.status(400).json({ error: "No question provided." });

  const userText =
    `MY BACKGROUND:\n${profile}\n\n` +
    (context ? `CONTEXT (company / role / word limit / tone): ${context}\n\n` : "") +
    `THE QUESTION:\n${question}\n\nWrite the answer:`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM,
        messages: [{ role: "user", content: userText }],
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ error: `Claude API error (${r.status}).`, detail: detail.slice(0, 400) });
    }

    const data = await r.json();
    const answer = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return res.status(200).json({ answer });
  } catch (e) {
    return res.status(500).json({ error: "Request failed.", detail: String(e).slice(0, 200) });
  }
}

function safeParse(s) {
  try {
    return JSON.parse(s || "{}");
  } catch {
    return {};
  }
}
