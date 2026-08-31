// Hands the tailor page its résumé data (Vercel serverless function).
//
// The data lives only in the TAILOR_DATA env var (gzip + base64, written by
// apps/tailor/push-data.mjs) — never in this public repo — and is released
// only behind the same APPLY_SECRET gate as /api/draft.

import { gunzipSync } from "node:zlib";

export default async function handler(req, res) {
  const secret = process.env.APPLY_SECRET;
  const packed = process.env.TAILOR_DATA;
  if (!secret || !packed) {
    return res.status(500).json({
      error: "Not configured — set APPLY_SECRET and TAILOR_DATA in the Vercel project's Environment Variables.",
    });
  }

  if ((req.headers["x-apply-key"] || "") !== secret) {
    return res.status(401).json({ error: "Wrong passphrase." });
  }

  try {
    const json = gunzipSync(Buffer.from(packed, "base64")).toString("utf8");
    res.setHeader("cache-control", "no-store");
    return res.status(200).json(JSON.parse(json));
  } catch (e) {
    return res.status(500).json({ error: "Data unpack failed.", detail: String(e).slice(0, 200) });
  }
}
