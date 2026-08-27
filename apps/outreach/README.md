# Outreach sheet

Turns your LinkedIn connections into a ranked list of people worth messaging —
joined against the roles you have actually applied to and the internships open
right now, so the sheet is a task list rather than an address book.

## Why not just connect to LinkedIn

There is no LinkedIn API that exposes connections, search, or the alumni tool —
it is closed to partners. The only other route is driving a logged-in session
with browser automation, which violates their User Agreement and is enforced
with account restriction. Risking your LinkedIn account in the middle of a job
search is a bad trade for a spreadsheet, so this reads the export instead.

## Getting the data (about 10 minutes, most of it waiting)

1. LinkedIn → **Settings & Privacy** → **Data privacy** → **Get a copy of your data**
2. Pick **"Connections"** (the smaller, faster archive — not "the works")
3. LinkedIn emails a download link, usually within ~10 minutes
4. Unzip; you want `Connections.csv`

The file has a three-line `Notes:` preamble before the header — the parser
handles that.

## Running it

```bash
cd apps/outreach
node build.mjs ~/Downloads/Connections.csv
```

Writes two files next to the script:

- **`outreach.csv`** — every person, with tier, reason, and a drafted opener.
  Import straight into Sheets.
- **`outreach.md`** — the same thing readable, grouped by tier.

It pulls your live applications from the tracker sync proxy and caches a
snapshot, so it still runs offline afterwards.

## What it does

Everyone in the output is at a company you have **either applied to or that has
an internship open right now**. Connections with neither are dropped on purpose —
this is a list you work through, not a census.

| Tier | Who | Why they're first |
|---|---|---|
| 1 | Recruiter where you have a live application | The one person who can actually move your file |
| 2 | Someone who works where you applied | Ask about the team, not the status |
| 3 | Recruiter where an internship is open and you haven't applied | Message before the application, not after |
| 4 | Someone at a company with an open internship | Same, one step further out |
| 5 | At a company you applied to, non-adjacent role | Low signal, kept for completeness |

Penn alums are flagged 🎓 and sort first **within** their tier — they don't jump
tiers, because that would put a gameplay programmer under a heading that says
"recruiter".

Each opener is built from the specific role, the specific date, and your actual
recent work. The recruiter version offers to add to the file; the peer version
asks what the team spends a week on. They are meant to be edited, not sent raw.

## Penn alumni

**LinkedIn's export has no school field for your connections**, so alum status
cannot be derived from it — the alumni tool is browse-only and not exportable.
To use the flag, supply your own list:

```bash
node build.mjs Connections.csv --alumni penn.csv
```

`penn.csv` needs a `name` column. Get the names from
`linkedin.com/school/university-of-pennsylvania/people/` (filter by company,
then copy the names) or from Penn's alumni directory. Tedious, but it is the
honest way to get it.
