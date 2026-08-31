// Tailor's model relay (Vercel serverless function).
//
// The tailor tool runs locally (private resume data + Word live there), but the
// API key lives only in this project's Vercel env — so the local tool sends its
// prompt here behind the same APPLY_SECRET gate as /api/draft, and this
// function forwards it to the Claude API and returns the reply text.

const MODEL = process.env.TAILOR_MODEL || process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
const MAX_SYSTEM = 8000;
const MAX_USER = 100000;
const MAX_TOKENS = 4096;

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
  const system = String(body.system || "").slice(0, MAX_SYSTEM);
  const user = String(body.user || "").slice(0, MAX_USER).trim();
  if (!user) return res.status(400).json({ error: "No prompt provided." });
  const maxTokens = Math.min(Math.max(+body.maxTokens || 3500, 1), MAX_TOKENS);

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
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ error: `Claude API error (${r.status}).`, detail: detail.slice(0, 400) });
    }

    const data = await r.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return res.status(200).json({ text });
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
