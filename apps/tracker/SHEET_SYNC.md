# Live-sync the tracker to a Google Sheet

The tracker keeps your data in your browser. This connects it to a Google Sheet
that **updates itself every time you change something** — a permanent, shareable,
long-term record of every role you've tracked. Setup is ~5 minutes, once.

Your data flows browser → your own Google Apps Script → your own Sheet. Nothing
passes through any third party.

## Setup

1. **Make a Google Sheet** — [sheets.new](https://sheets.new). Name it anything.
2. In that sheet: **Extensions → Apps Script**. Delete whatever's there, paste
   this, and hit **Save**:

   ```js
   function doPost(e) {
     const data = JSON.parse(e.postData.contents);
     const ss = SpreadsheetApp.getActiveSpreadsheet();
     const sheet = ss.getSheetByName("Applications") || ss.insertSheet("Applications");
     sheet.clearContents();
     const head = ["Company","Role","Category","Level","Term","Location","Status","Applied","Follow-up","Notes","Fit","URL"];
     const rows = [head].concat(data.rows || []);
     sheet.getRange(1, 1, rows.length, head.length).setValues(rows);
     sheet.getRange(1, 1, 1, head.length).setFontWeight("bold");
     return ContentService.createTextOutput("ok");
   }
   ```

3. **Deploy → New deployment** → gear icon → **Web app**. Set:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**

   Click **Deploy**, authorize when prompted (it's your own script — approve it),
   and **copy the Web app URL** (ends in `/exec`).

4. In the tracker, click **⧉ Sheet**, paste that URL, done. The button turns
   green and reads **Synced ✓**. Every change from now on writes to your sheet.

## Notes

- The sheet is **replaced** on each sync (always the current full picture) — so
  don't hand-edit it; treat it as a live mirror. Add your own analysis on a
  *second* tab if you want.
- To share your progress with a mentor, just share the Google Sheet (read-only).
- To turn sync off, click **⧉ Sheet** and clear the URL.
- The URL lives only in your browser (localStorage key `careeros-sync-url`), not
  in the repo.
