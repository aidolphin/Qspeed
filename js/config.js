/**
 * @fileoverview Application-wide configuration constants.
 * All tunable values live here — change once, affects everywhere.
 */

/** @type {Object} Global configuration */
const CONFIG = {
    SERVER: 'https://speed.cloudflare.com',
    PING_SAMPLES: 15,
    PING_WARMUP: 3,
    DL_DURATION: 12000,   // ms — total download window
    UL_DURATION: 8000,    // ms — total upload window
    // Large fixed chunk — connection stays open the whole duration
    DL_CHUNK_SIZE: 25e6,  // 25 MB per stream
    UL_CHUNK_SIZE: 5e6,   // 5 MB per upload request
    // Streams scale up automatically based on measured speed
    DL_STREAMS_INIT: 4,   // start with 4, scales to 8
    UL_STREAMS: 3,        // parallel upload streams
    MAX_HISTORY: 20,
};
