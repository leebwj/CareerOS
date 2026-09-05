// CareerOS tracker sync proxy — the permanent fix for "I have to re-sync
// again and again": the Apps Script /exec URL lives HERE (Vercel env var
// SHEET_EXEC_URL), not in browser storage, so every device/browser is
// connected automatically with zero client-side setup to lose.
//
// GET  → returns the sheet's current state:            { ok, state }
// POST → forwards the push (form-encoded payload=...), CHECKS what Apps Script
//        said, then re-reads the sheet and returns the fresh state — push +
//        verify in ONE call.
//
// Apps Script answers HTTP 200 even when doPost throws; the failure is only
// visible in the BODY ("error: <message>"). This proxy used to discard that
// response entirely, so a write that never landed looked identical to one that
// did — a sync could sit dead for days with nothing to read. Every failure path
// below now names itself in the reply.
export default async function handler(req, res) {
  const EXEC = process.env.SHEET_EXEC_URL;
  if (!EXEC) return res.status(500).json({ error: "Not configured — set SHEET_EXEC_URL in Vercel" });

  const readState = async () => {
    // unique callback per read: a fixed one lets any cache between here and
    // Apps Script serve yesterday's state, which reads back as a failed write
    const r = await fetch(EXEC + (EXEC.includes("?") ? "&" : "?") + "callback=cb_" + Date.now(), { redirect: "follow", cache: "no-store" });
    const t = await r.text();
    const m = t.match(/^\s*[\w$]+\(([\s\S]*)\)\s*;?\s*$/); // unwrap JSONP if present
    return JSON.parse(m ? m[1] : t);
  };

  try {
    let wrote = null;
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? req.body : new URLSearchParams(req.body || {}).toString();
      if (!body || body.length > 2_000_000) {
        return res.status(400).json({ error: "bad payload", bytes: body ? body.length : 0 });
      }
      const r = await fetch(EXEC, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        redirect: "follow",
      });
      const said = (await r.text()).slice(0, 500).trim();
      // Apps Script signals failure in the body, not the status line.
      if (!r.ok || /^error\b/i.test(said)) {
        return res.status(502).json({
          error: "sheet write failed",
          appsScript: said || `HTTP ${r.status}`,
          bytes: body.length,
        });
      }
      wrote = { said, bytes: body.length };
    } else if (req.method !== "GET") {
      return res.status(405).json({ error: "GET or POST" });
    }
    const payload = await readState();
    // Surface the size of what the sheet is holding: a single Sheets cell caps
    // at 50,000 characters, and _state is one cell, so this is the ceiling the
    // tracker will eventually hit as tracked roles accumulate.
    const stateBytes = (payload && payload.state && payload.state.length) || 0;
    return res.status(200).json({ ok: true, ...payload, stateBytes, cellLimit: 50000, ...(wrote ? { wrote } : {}) });
  } catch (e) {
    return res.status(502).json({ error: String((e && e.message) || e).slice(0, 200) });
  }
}
