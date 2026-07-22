// CareerOS tracker sync proxy — the permanent fix for "I have to re-sync
// again and again": the Apps Script /exec URL lives HERE (Vercel env var
// SHEET_EXEC_URL), not in browser storage, so every device/browser is
// connected automatically with zero client-side setup to lose.
//
// GET  → returns the sheet's current state:            { ok, state }
// POST → forwards the push (form-encoded payload=...), then re-reads the
//        sheet and returns the fresh state — push + verify in ONE call
//        (the old client did a blind no-cors POST + a delayed JSONP verify).
export default async function handler(req, res) {
  const EXEC = process.env.SHEET_EXEC_URL;
  if (!EXEC) return res.status(500).json({ error: "Not configured — set SHEET_EXEC_URL in Vercel" });

  const readState = async () => {
    const r = await fetch(EXEC + (EXEC.includes("?") ? "&" : "?") + "callback=cb", { redirect: "follow" });
    const t = await r.text();
    const m = t.match(/^\s*[\w$]+\(([\s\S]*)\)\s*;?\s*$/); // unwrap JSONP if present
    return JSON.parse(m ? m[1] : t);
  };

  try {
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? req.body : new URLSearchParams(req.body || {}).toString();
      if (!body || body.length > 2_000_000) return res.status(400).json({ error: "bad payload" });
      await fetch(EXEC, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        redirect: "follow",
      });
    } else if (req.method !== "GET") {
      return res.status(405).json({ error: "GET or POST" });
    }
    const payload = await readState();
    return res.status(200).json({ ok: true, ...payload });
  } catch (e) {
    return res.status(502).json({ error: String((e && e.message) || e).slice(0, 200) });
  }
}
