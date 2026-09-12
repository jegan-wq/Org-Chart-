# Zensciences — Organization Map

A live, editable org chart: founders → finance & CBO → business units, MarTech,
HR, Operations, Advisory → account coverage tables. Click any name or title to
edit it right on the page.

It's a plain static site (`index.html`, `style.css`, `app.js`, `data.js`) — no
build step, no server, so it's easy to host on Vercel straight from GitHub.

## How editing works (important to understand)

This is a static site with **no shared database**. When someone edits a name
in their browser, it's saved to that browser's local storage only — it won't
appear for other people who open the same link.

Two ways to make an edit "official" for everyone:

1. **Edit in the browser, then export.** Click **Export as data.js** in the
   toolbar, which downloads a ready-made `data.js` with everything currently
   on screen. Replace the `data.js` file in this repo with it, then commit and
   push — Vercel will redeploy automatically and everyone will see the update
   as the new default.
2. **Edit `data.js` directly** in your code editor (it's a plain, commented
   JS object) if you'd rather type values in than click through the UI.

Use **Export data (JSON)** / **Import data (JSON)** to back up or move your
in-browser edits between machines/browsers, and **Reset to default** to wipe
a browser's local edits back to whatever is in `data.js`.

> Want everyone's edits to sync live for real (like a shared Google Sheet)?
> That needs a small backend (e.g. Vercel KV or Postgres) behind the save
> calls in `app.js` — happy to add that next if it'd help.

## 1. Push this to GitHub

```bash
cd org-chart
git init
git add .
git commit -m "Initial org chart"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

(No GitHub repo yet? Create an empty one first at github.com/new — don't
initialize it with a README, so the push above doesn't conflict.)

## 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (you can sign in with
   your GitHub account).
2. Click **Add New… → Project**, then **Import** the GitHub repo you just
   pushed.
3. Framework Preset: leave it as **Other** (or it may auto-detect as a static
   site). No build command and no output directory override are needed.
4. Click **Deploy**. In under a minute you'll get a live URL like
   `your-repo.vercel.app`.

From then on, every `git push` to `main` redeploys automatically — including
whenever you replace `data.js` per the workflow above.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page shell + toolbar |
| `style.css` | All visual styling / brand colors |
| `data.js` | Default org data — the source of truth for a fresh browser |
| `app.js` | Renders the chart from data and handles editing/add/remove/export |
