/**
 * Qspeed — Cloudflare Worker
 *
 * Serves the static site from the KV asset store (wrangler sites).
 * All routing falls through to index.html for SPA behaviour.
 */

import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
    try {
        // Serve static asset (html, css, js, images)
        return await getAssetFromKV(event, {
            cacheControl: {
                browserTTL: 60 * 60 * 24,       // 1 day browser cache
                edgeTTL: 60 * 60 * 24 * 7,      // 7 day edge cache
                bypassCache: false,
            },
        });
    } catch {
        // Fallback to index.html for any unmatched path
        try {
            return await getAssetFromKV(event, {
                mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/index.html`, req),
            });
        } catch (e) {
            return new Response('Not found', { status: 404 });
        }
    }
}
