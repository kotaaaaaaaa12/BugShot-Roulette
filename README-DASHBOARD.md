# Cloudflare Dashboard deployment

This overlay replaces the external Upstash Redis dependency with Cloudflare D1
and deploys the Socket.IO backend as one Cloudflare Container instance.

## Files

- `worker/index.ts`: Worker router and D1 account/statistics API.
- `wrangler.jsonc`: Static assets, D1, Container, and Durable Object configuration.
- `schema.sql`: D1 schema to paste into the D1 console once.
- `server/Dockerfile`: Cloudflare Container image using port 3001.
- `server/index.js`: Removes the obsolete Upstash proxy.
- `utils/redisService.ts`: Keeps the old exports but sends requests to D1 APIs.
- `hooks/useMultiplayer.ts`: Uses the same Cloudflare origin for Socket.IO.

## Important

Extract this ZIP over the repository root and replace matching files.
The old `functions/server/[[path]].js` may remain because it is not used by
Workers Static Assets, but deleting the whole `functions` directory avoids confusion.

After the first deployment, open the automatically created D1 database in the
Cloudflare dashboard, open Console, paste all of `schema.sql`, and click Execute.

Worker logs and traces are persisted at a 100% sampling rate. Open the deployed
Worker and select Observability in the Cloudflare dashboard to inspect them.
