# Changelog

All notable changes to Qspeed are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2025

### Added
- Multi-stream saturating download test (4→8 parallel streams)
- Parallel upload test (3 concurrent streams)
- Ping measurement with 15 samples, median result
- Jitter calculation using sequential RFC 3550 method
- Packet loss estimation across all test requests
- Quality score algorithm (A+ to F) across 5 metrics
- Real-time speed graph with bezier curve rendering
- Canvas arc gauge with smooth lerp animation and auto-scaling
- Test history stored in localStorage (up to 20 entries)
- ISP and location detection via freeipapi.com
- Copy results to clipboard
- FAQ accordion with JSON-LD schema markup
- Sticky header with backdrop blur
- Cloudflare Workers deployment config
- Modular CSS/JS architecture (no build step required)
- MIT license
- Full README and contributing guide
