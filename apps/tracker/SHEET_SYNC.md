# Live-sync the tracker to a Google Sheet (durable + cross-device)

By default the tracker stores data in your browser (per-device, and clearable).
Connecting a Google Sheet makes your data **durable and available on any
computer**: the sheet becomes the shared source of truth. Setup is ~5 minutes,
once per Google account; then paste the same URL into the tracker on each device.

Flow: your browser ⇄ your own Google Apps Script ⇄ your own Sheet. Nothing passes
through any third party.

## What you get
- **Write:** every change syncs to the sheet (a readable **Applications** tab).
- **Read:** on load, the tracker pulls the latest state from the sheet — so a
  computer that's never seen your data gets it. **Last-write-wins by timestamp**,
  and it will **never** overwrite newer local data or wipe you with an empty sheet.

## Setup

1. **Make a Google Sheet** — [sheets.new](https://sheets.new).
2. **Extensions → Apps Script**. Delete what's there, paste this, **Save**:

   ```js
   function doPost(e) {
     try {
       var data = JSON.parse(e.parameter.payload);
       var ss = SpreadsheetApp.getActiveSpreadsheet();
       // 1) store raw state (hidden tab) so other devices can load it
       var meta = ss.getSheetByName("_state") || ss.insertSheet("_state").hideSheet();
       meta.getRange("A1").setValue(data.state || "");
       // 2) write the human-readable rows to the Applications tab
       var sheet = ss.getSheetByName("Applications") || ss.insertSheet("Applications");
       sheet.clearContents();
       var head = ["Company","Role","Category","Level","Term","Location","Status","Applied","Follow-up","Notes","Fit","URL"];
       var rows = [head].concat(data.rows || []);
       sheet.getRange(1, 1, rows.length, head.length).setValues(rows);
       sheet.getRange(1, 1, 1, head.length).setFontWeight("bold");
       return ContentService.createTextOutput("ok");
     } catch (err) {
       return ContentService.createTextOutput("error: " + err.message);
     }
   }
   function doGet(e) {
     var ss = SpreadsheetApp.getActiveSpreadsheet();
     var meta = ss.getSheetByName("_state");
     var state = meta ? meta.getRange("A1").getValue() : "";
     var out = JSON.stringify({ state: state });
     var cb = e && e.parameter && e.parameter.callback;
     if (cb) return ContentService.createTextOutput(cb + "(" + out + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
     return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. **Deploy → New deployment** → gear → **Web app**:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**

   **Deploy**, authorize (it's your own script — Advanced → Go to project → Allow),
   and copy the **Web app URL** (ends in `/exec`).

4. In the tracker, click **⧉ Sheet**, paste the URL. Turns green **Synced ✓**.

## Use it on another computer
On the other machine, open [leebrian.dev/tracker](https://leebrian.dev/tracker),
click **⧉ Sheet**, and paste the **same URL**. On load it pulls your data from the
sheet. Switch freely — whichever device you edited most recently wins.

## Notes
- Editing on two devices at the *same second* is last-write-wins (fine for one
  person). The tracker re-pulls when you refocus the tab, so switching devices
  just works.
- The **Applications** tab is a live mirror (rewritten each sync) — don't hand-edit
  it; use a second tab for your own notes. The hidden **_state** tab holds the raw
  data; leave it alone.
- If you already deployed the older (write-only) script, **re-paste this version**
  and redeploy a **New version** (Deploy → Manage deployments → ✏️) so the read
  endpoint exists.
- The URL lives only in your browser (`careeros-sync-url`), never in the repo.
