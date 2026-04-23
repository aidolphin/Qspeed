# Qspeed

> Free, open-source internet speed test. Measure download, upload, ping, jitter, and packet loss — no app, no signup, no tracking.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Workers-orange)](https://workers.cloudflare.com)
[![Made by Quantum Leaf](https://img.shields.io/badge/Made%20by-Quantum%20Leaf%20Automation-blue)](https://quantumleaf.dev)

---

## What is Qspeed?

Qspeed is a browser-based internet speed test built for accuracy and simplicity. It uses multi-stream saturating downloads (the same technique as fast.com and Cloudflare's own speed test) to give you real-world numbers — not best-case marketing figures.

**Live site:** [qspeed.com](https://qspeed.com)

---

## Features

| Feature | Details |
|---|---|
| Download speed | Multi-stream saturating test, auto-scales 4→8 connections |
| Upload speed | 3 parallel streams, full duration window |
| Ping | 15 samples, median result, outliers trimmed |
| Jitter | Sequential sample deviation (RFC 3550 method) |
| Packet loss | Tracked across all test requests |
| Quality score | A+ to F grade based on all 5 metrics |
| Test history | Stored locally in localStorage, never sent anywhere |
| ISP detection | Via freeipapi.com (no API key needed) |
| Zero dependencies | No frameworks, no build step, plain HTML/CSS/JS |
| Cloudflare Workers | Deploys globally to 300+ edge locations in one command |

---

## Project Structure

```
qspeed/
├── index.html          # App shell — clean HTML, imports all modules
├── worker.js           # Cloudflare Worker — serves static assets
├── wrangler.toml       # Cloudflare deployment config
├── package.json        # npm scripts and dev dependencies
├── serve.py            # Local dev server (avoids CORS on file://)
│
├── css/
│   ├── base.css        # CSS variables, reset, atmosphere animations
│   ├── layout.css      # Header (sticky), footer, section containers
│   ├── components.css  # Gauge, GO button, phase cards, graph, CTA cards
│   └── ui.css          # Toast, score ring, result cards, FAQ, history
│
└── js/
    ├── config.js       # All tunable constants (server, durations, streams)
    ├── state.js        # Single global STATE object — single source of truth
    ├── utils.js        # $(), fmt(), clamp(), toast()
    ├── particles.js    # Background particle canvas animation
    ├── gauge.js        # Canvas arc gauge with smooth lerp and auto-scaling
    ├── graph.js        # Real-time speed graph with bezier curve rendering
    ├── score.js        # Quality score algorithm (download/upload/ping/jitter/loss)
    ├── engine.js       # Speed test core: ping, download, upload, ISP detection
    ├── results.js      # Show results, localStorage history, copy to clipboard
    ├── ui.js           # Phase controller, FAQ accordion, resetUI
    └── main.js         # App entry point — init, event bindings, orchestrator
```

---

## Getting Started

### Run locally

You must use the local server — opening `index.html` directly as `file://` blocks all cross-origin requests (CORS).

```bash
git clone https://github.com/QuantumLeafAutomation/qspeed.git
cd qspeed
python3 serve.py
```

Open [http://localhost:8080](http://localhost:8080)

### Deploy to Cloudflare Workers (free)

**One-time setup:**

```bash
# Install wrangler
npm install

# Login to Cloudflare
npx wrangler login

# Deploy (goes live instantly on workers.dev)
npm run deploy
```

Your site will be live at `https://qspeed.<your-subdomain>.workers.dev`

**Add a custom domain:**

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Workers & Pages → qspeed → Custom Domains
3. Add `qspeed.com` (or your domain)

Done. Cloudflare handles SSL, CDN, and global distribution automatically.

---

## How the Speed Test Works

### Download

```
Stream 1 ──────────────────────────── 12s
Stream 2 ──────────────────────────── 12s
Stream 3 ──────────────────────────── 12s
Stream 4 ──────────────────────────── 12s
          ↑ if speed > 100 Mbps, 4 more streams added at 3s
```

All streams run concurrently for the full 12-second window. A global byte counter samples total throughput every 300ms. The final result uses only the last 60% of samples (connection fully warmed up).

### Upload

3 parallel streams run simultaneously for 8 seconds. A pre-generated 5 MB random buffer is reused across all requests to avoid blocking the main thread.

### Ping & Jitter

- 3 warmup requests (not counted)
- 15 timed requests to `/__down?bytes=0`
- Ping = median of trimmed samples (robust against outliers)
- Jitter = mean absolute deviation between **consecutive** samples (RFC 3550)

### Quality Score

| Metric | Weight | Max Points |
|---|---|---|
| Download speed | High | 30 |
| Upload speed | Medium | 25 |
| Ping latency | Medium | 25 |
| Jitter | Low | 12 |
| Packet loss | Low | 8 |

Grades: **A+** (92+) · **A** (85+) · **B+** (75+) · **B** (65+) · **C** (50+) · **D** (35+) · **F** (<35)

---

## Configuration

All tunable values are in `js/config.js`:

```js
const CONFIG = {
    SERVER: 'https://speed.cloudflare.com', // test server
    PING_SAMPLES: 15,       // number of ping measurements
    PING_WARMUP: 3,         // warmup requests before ping test
    DL_DURATION: 12000,     // download test duration (ms)
    UL_DURATION: 8000,      // upload test duration (ms)
    DL_CHUNK_SIZE: 25e6,    // 25 MB per download stream
    UL_CHUNK_SIZE: 5e6,     // 5 MB per upload request
    DL_STREAMS_INIT: 4,     // initial parallel download streams
    UL_STREAMS: 3,          // parallel upload streams
    MAX_HISTORY: 20,        // max entries in localStorage history
};
```

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature
# make changes
git commit -m "feat: describe your change"
git push origin feature/your-feature
# open a pull request
```

**Good first issues:**
- Add dark/light theme toggle
- Add share result as image (canvas screenshot)
- Add IPv4/IPv6 detection
- Localization (i18n support)

---

## Privacy

- No data is sent to Qspeed servers
- Test history is stored in your browser's `localStorage` only
- The only external requests during a test are to `speed.cloudflare.com` (speed test) and `freeipapi.com` (ISP name display)
- No cookies, no analytics, no tracking

---

## License

[MIT](LICENSE) — free to use, modify, and distribute. Attribution appreciated.

---

## Built by

[Quantum Leaf Automation](https://quantumleaf.vercel.app/) — building useful tools for the open web.
