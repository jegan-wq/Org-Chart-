# Zensciences — Organization Map

A live, editable org chart: founders → finance & CBO → business units, MarTech,
HR, Operations, Advisory → account coverage tables. Click any name or title to
edit it right on the page.

It's a plain static site (`index.html`, `style.css`, `app.js`, `data.js`) — no
build step, no server, so it's easy to host on Vercel straight from GitHub.

## How editing works

Every edit now saves to a small shared backend (Upstash Redis, connected via
Vercel's Storage marketplace — free tier is plenty for this). That means:

- Anyone who opens the live link and edits a name sees it update for
  **everyone else** who has the page open, automatically. No export/import
  needed.
- The toolbar tells you the current status: **"Editing live — synced for
  everyone"** (green) means it's connected; **"Editing live — this browser
  only"** (amber) means the backend isn't connected yet, so edits are only
  saved locally until you do the one-time setup below.

You still have **Export data (JSON)** / **Import data (JSON)** for backups,
and **Export as data.js** if you'd rather bake a set of values in as the
permanent starting point in code (useful for onboarding a fresh deployment
with real names already filled in). **Reset to default** wipes the shared
data back to whatever's in `data.js`.

### One-time setup: connect shared storage

1. In your Vercel project, open the **Storage** tab.
2. Click **Browse Marketplace**, choose **Upstash** → **Redis**, and follow
   the prompts to create a free database and connect it to this project.
   Vercel will add the required environment variables automatically.
3. Redeploy (Vercel usually does this for you after connecting a new
   integration; if not, just push any small commit, or use **Redeploy** in
   the Vercel dashboard).
4. Reload the site — the toolbar should switch to "synced for everyone".

Until you do this, the app still works fine — it just behaves like the
original version, saving only to each visitor's own browser.

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
| `data.js` | Default org data — the seed if shared storage is empty |
| `app.js` | Renders the chart, handles editing, and talks to `/api/state` |
| `api/state.js` | Serverless function: reads/writes the shared state in Redis |
| `package.json` | Declares the `@upstash/redis` dependency the API function needs |
