async function checkServer() {
    const dot = $('statusDot'), txt = $('statusText');
    dot.className = 'status-dot checking';
    txt.textContent = 'Checking server...';
    try {
        const t0 = performance.now();
        const res = await fetch(`${CONFIG.SERVER}/__down?bytes=0`, { cache: 'no-store', mode: 'cors' });
        const ms = performance.now() - t0;
        if (res.ok) {
            STATE.serverOk = true;
            dot.className = 'status-dot ok';
            txt.textContent = `Server ready (${Math.round(ms)}ms)`;
        } else throw new Error();
    } catch {
        STATE.serverOk = false;
        dot.className = 'status-dot err';
        txt.textContent = 'Server unreachable';
        toast('Test server unreachable — try via localhost (python3 serve.py)', 'error');
    }
}

async function detectConnection() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) STATE.connInfo = { type: conn.type || 'unknown', effectiveType: conn.effectiveType || '' };
    try {
        const res = await fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout(4000) });
        const d = await res.json();
        STATE.ispInfo = { isp: d.isp || d.org || 'Unknown', city: d.cityName, country: d.countryCode };
    } catch {
        STATE.ispInfo = { isp: 'Unknown' };
    }
}

function getConnectionLabel() {
    const c = STATE.connInfo;
    if (!c.effectiveType && !c.type) return 'Unknown';
    const types = { wifi: 'Wi-Fi', cellular: 'Cellular', ethernet: 'Ethernet', none: 'None', unknown: 'Unknown' };
    const label = types[c.type] || 'Unknown';
    return c.effectiveType ? `${label} (${c.effectiveType.toUpperCase()})` : label;
}

// ── Ping ──
async function testPing(ac) {
    setPhase('ping');
    STATE.pingSamples = [];
    const el = $('vPing');

    for (let i = 0; i < CONFIG.PING_WARMUP; i++) {
        if (ac.signal.aborted) return { ping: 0, jitter: 0 };
        try { await fetch(`${CONFIG.SERVER}/__down?bytes=0`, { signal: ac.signal, cache: 'no-store', mode: 'cors' }); }
        catch { /* ignore warmup */ }
    }

    for (let i = 0; i < CONFIG.PING_SAMPLES; i++) {
        if (ac.signal.aborted) break;
        STATE.totalRequests++;
        try {
            const t0 = performance.now();
            await fetch(`${CONFIG.SERVER}/__down?bytes=0`, { signal: ac.signal, cache: 'no-store', mode: 'cors' });
            const ms = performance.now() - t0;
            STATE.pingSamples.push(ms);
            el.textContent = Math.round(ms) + ' ms';
        } catch { STATE.failedRequests++; }
        await new Promise(r => setTimeout(r, 100));
    }

    if (STATE.pingSamples.length >= 3) {
        const sorted = [...STATE.pingSamples].sort((a, b) => a - b);
        const trimmed = sorted.slice(1, -1);
        const ping = trimmed[Math.floor(trimmed.length / 2)];
        el.textContent = Math.round(ping) + ' ms';

        setPhase('jitter');
        const seq = STATE.pingSamples.slice(1, -1);
        let jSum = 0;
        for (let i = 1; i < seq.length; i++) jSum += Math.abs(seq[i] - seq[i - 1]);
        const jitter = seq.length > 1 ? jSum / (seq.length - 1) : 0;
        $('vJitter').textContent = jitter.toFixed(1) + ' ms';
        return { ping, jitter };
    }
    return { ping: 0, jitter: 0 };
}

// ── Download — saturating multi-stream ──
// All streams run concurrently for the full DL_DURATION window.
// Bytes are counted globally across all streams every 300ms → real throughput.
async function testDownload(ac) {
    setPhase('download');
    STATE.dlSamples = []; STATE.history = []; STATE.targetSpeed = 0; STATE.maxGauge = 100;
    $('graphSection').style.display = '';
    resizeGraph(); drawGraph();

    const deadline = performance.now() + CONFIG.DL_DURATION;
    // Shared byte counter across all streams
    let totalBytes = 0;
    const testStart = performance.now();

    // Spawn a single persistent download stream
    async function dlStream() {
        while (!ac.signal.aborted && performance.now() < deadline) {
            const url = `${CONFIG.SERVER}/__down?bytes=${CONFIG.DL_CHUNK_SIZE}&_=${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            STATE.totalRequests++;
            try {
                const res = await fetch(url, { signal: ac.signal, cache: 'no-store', mode: 'cors' });
                if (!res.ok) { STATE.failedRequests++; continue; }
                const reader = res.body.getReader();
                while (true) {
                    if (ac.signal.aborted || performance.now() >= deadline) { reader.cancel(); return; }
                    const { done, value } = await reader.read();
                    if (done) break;
                    totalBytes += value.length;
                }
            } catch { if (!ac.signal.aborted) STATE.failedRequests++; }
        }
    }

    // Measurement ticker — samples throughput every 300ms
    const ticker = setInterval(() => {
        const elapsed = (performance.now() - testStart) / 1000;
        if (elapsed < 0.5) return; // ignore first 500ms ramp-up
        const mbps = (totalBytes * 8) / (elapsed * 1e6);
        STATE.targetSpeed = mbps;
        STATE.dlSamples.push(mbps);
        STATE.history.push({ t: performance.now() - testStart, v: mbps });
        $('vDown').textContent = fmt(mbps) + ' Mbps';
        autoScaleGauge(mbps);
        drawGraph();
    }, 300);

    // Start streams — begin with DL_STREAMS_INIT, add more if speed is high
    const streams = [];
    for (let i = 0; i < CONFIG.DL_STREAMS_INIT; i++) streams.push(dlStream());

    // After 3s, if speed > 100 Mbps add more streams to saturate
    setTimeout(() => {
        if (!ac.signal.aborted && STATE.targetSpeed > 100) {
            for (let i = 0; i < 4; i++) streams.push(dlStream());
        }
    }, 3000);

    await Promise.all(streams);
    clearInterval(ticker);

    // Final result: use the peak sustained average (last 60% of samples = warmed up)
    const warmedSamples = STATE.dlSamples.slice(Math.floor(STATE.dlSamples.length * 0.4));
    const result = warmedSamples.length > 0
        ? warmedSamples.reduce((a, b) => a + b, 0) / warmedSamples.length
        : 0;

    STATE.targetSpeed = 0;
    $('vDown').textContent = result > 0 ? fmt(result) + ' Mbps' : 'Failed';
    if (result === 0) toast('Download test failed — check connection', 'error');
    return result;
}

// ── Upload — parallel streams ──
// Multiple streams upload simultaneously for the full UL_DURATION.
// FIX: getRandomValues max is 65536 bytes per call — fill in chunks
const _rndBuf = new Uint8Array(CONFIG.UL_CHUNK_SIZE);
for (let off = 0; off < _rndBuf.length; off += 65536)
    crypto.getRandomValues(_rndBuf.subarray(off, Math.min(off + 65536, _rndBuf.length)));

async function testUpload(ac) {
    setPhase('upload');
    STATE.ulSamples = []; STATE.history = []; STATE.targetSpeed = 0;
    resizeGraph(); drawGraph();

    const deadline = performance.now() + CONFIG.UL_DURATION;
    const testStart = performance.now();
    let totalBytes = 0;

    async function ulStream() {
        while (!ac.signal.aborted && performance.now() < deadline) {
            STATE.totalRequests++;
            try {
                const buf = _rndBuf.slice(0, CONFIG.UL_CHUNK_SIZE);
                const res = await fetch(`${CONFIG.SERVER}/__up`, {
                    method: 'POST', mode: 'cors', cache: 'no-store',
                    body: buf, signal: ac.signal,
                });
                if (res.ok) totalBytes += CONFIG.UL_CHUNK_SIZE;
                else STATE.failedRequests++;
            } catch { if (!ac.signal.aborted) STATE.failedRequests++; }
        }
    }

    const ticker = setInterval(() => {
        const elapsed = (performance.now() - testStart) / 1000;
        if (elapsed < 0.5) return;
        const mbps = (totalBytes * 8) / (elapsed * 1e6);
        STATE.targetSpeed = mbps;
        STATE.ulSamples.push(mbps);
        STATE.history.push({ t: performance.now() - testStart, v: mbps });
        $('vUp').textContent = fmt(mbps) + ' Mbps';
        autoScaleGauge(mbps);
        drawGraph();
    }, 300);

    const streams = [];
    for (let i = 0; i < CONFIG.UL_STREAMS; i++) streams.push(ulStream());
    await Promise.all(streams);
    clearInterval(ticker);

    const warmedSamples = STATE.ulSamples.slice(Math.floor(STATE.ulSamples.length * 0.4));
    const result = warmedSamples.length > 0
        ? warmedSamples.reduce((a, b) => a + b, 0) / warmedSamples.length
        : 0;

    STATE.targetSpeed = 0;
    $('vUp').textContent = result > 0 ? fmt(result) + ' Mbps' : 'Failed';
    return result;
}

function weightedAverage(samples) {
    if (samples.length === 0) return 0;
    let wSum = 0, vSum = 0;
    samples.forEach((v, i) => { const w = i + 1; wSum += w; vSum += v * w; });
    return vSum / wSum;
}
