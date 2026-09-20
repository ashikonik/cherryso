// Netlify Scheduled Function: release-expired-reservations
//
// Fires every 15 minutes (see [functions."release-expired-reservations"] in
// netlify.toml). Delegates to the Next.js Route Handler at
// /api/cron/release-expired-reservations which holds the actual stock-restoration
// logic in the Next.js codebase (transactional, testable, versioned).
//
// The cron handler enforces its own auth (X-CRON-SECRET header) so this
// function just needs to read the secret from the env and pass it through.
//
// We use the deployment URL from SITE_URL or fall back to the relative path
// pattern that Netlify provides for internal-to-site calls.

const SITE_URL =
  process.env.URL || // Netlify always sets this for the deployed site
  process.env.DEPLOY_PRIME_URL ||
  "";

export default async () => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron] CRON_SECRET not set; refusing to run.");
    return { statusCode: 500 };
  }

  const url = `${SITE_URL}/api/cron/release-expired-reservations`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "x-cron-secret": cronSecret },
    });
    const body = await res.text();
    console.log(`[cron] release-expired-reservations -> ${res.status}: ${body}`);
    return { statusCode: res.status };
  } catch (err) {
    console.error("[cron] release-expired-reservations failed:", err);
    return { statusCode: 502 };
  }
};
