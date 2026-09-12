// Serverless function (deployed automatically by Vercel from /api).
// Reads and writes the whole org chart state to a shared Redis store, so
// every visitor's edits are seen by everyone else — no export/import needed.
//
// Uses the Upstash Redis integration. Add it once from your Vercel
// project's Storage tab (Marketplace -> Upstash -> Redis -> Connect), then
// redeploy — Vercel injects the credentials this reads automatically.
// See README.md for the exact steps.

import { Redis } from "@upstash/redis";

const STATE_KEY = "zensciences-org-chart:state";

function getRedis() {
  // Throws if no Redis integration is connected yet — caught below so the
  // app still works locally / before setup, just without live sync.
  return Redis.fromEnv();
}

export default async function handler(req, res) {
  let redis;
  try {
    redis = getRedis();
  } catch (err) {
    res.status(503).json({ error: "No shared storage connected yet." });
    return;
  }

  try {
    if (req.method === "GET") {
      const data = await redis.get(STATE_KEY);
      res.status(200).json({ data: data ?? null });
      return;
    }

    if (req.method === "POST") {
      const body = req.body && typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
      await redis.set(STATE_KEY, body);
      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    res.status(500).json({ error: String(err && err.message ? err.message : err) });
  }
}
