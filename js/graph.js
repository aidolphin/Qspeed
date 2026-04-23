/**
 * @fileoverview Real-time speed graph renderer.
 * Draws a bezier-smoothed line graph of speed over time
 * with gradient fill, grid lines, and a live end-dot.
 * Resamples to the last 80 data points to keep it readable.
 */

let grCtx;

function resizeGraph() {
    const canvas = $('graphCanvas');
    const box = canvas.parentElement;
    const dpr = devicePixelRatio || 1;
    const w = box.clientWidth;
    const h = 140;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    grCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawGraph() {
    const canvas = $('graphCanvas');
    const w = canvas.width / (devicePixelRatio || 1);
    const h = canvas.height / (devicePixelRatio || 1);
    const c = grCtx;
    c.clearRect(0, 0, w, h);

    const data = STATE.history;
    if (data.length < 2) {
        c.font = '11px "Space Grotesk"';
        c.fillStyle = 'rgba(255,255,255,0.1)';
        c.textAlign = 'center';
        c.fillText('Collecting data...', w / 2, h / 2);
        return;
    }

    const pts = data.length > 80 ? data.slice(-80) : data;
    const maxV = Math.max(...pts.map(p => p.v), 5) * 1.15;
    const pad = { t: 6, r: 6, b: 18, l: 38 };
    const gw = w - pad.l - pad.r;
    const gh = h - pad.t - pad.b;

    // Grid lines
    for (let i = 0; i <= 4; i++) {
        const y = pad.t + gh * (i / 4);
        c.beginPath(); c.moveTo(pad.l, y); c.lineTo(w - pad.r, y);
        c.strokeStyle = 'rgba(255,255,255,0.03)'; c.lineWidth = 1; c.stroke();
        const v = maxV - maxV * (i / 4);
        c.font = '9px "JetBrains Mono"';
        c.fillStyle = 'rgba(255,255,255,0.18)';
        c.textAlign = 'right'; c.textBaseline = 'middle';
        c.fillText(v < 10 ? v.toFixed(0) : Math.round(v), pad.l - 5, y);
    }

    // Curve points
    const cp = pts.map((p, i) => ({
        x: pad.l + gw * (i / (pts.length - 1)),
        y: pad.t + gh * (1 - p.v / maxV),
    }));

    // Fill gradient
    const grad = c.createLinearGradient(0, pad.t, 0, h - pad.b);
    grad.addColorStop(0, 'rgba(0,229,153,0.15)');
    grad.addColorStop(1, 'rgba(0,229,153,0.0)');
    c.beginPath(); c.moveTo(cp[0].x, h - pad.b);
    for (let i = 0; i < cp.length; i++) {
        if (i === 0) { c.lineTo(cp[i].x, cp[i].y); continue; }
        const mx = (cp[i - 1].x + cp[i].x) / 2;
        c.bezierCurveTo(mx, cp[i - 1].y, mx, cp[i].y, cp[i].x, cp[i].y);
    }
    c.lineTo(cp[cp.length - 1].x, h - pad.b);
    c.closePath(); c.fillStyle = grad; c.fill();

    // Stroke line
    c.beginPath();
    for (let i = 0; i < cp.length; i++) {
        if (i === 0) { c.moveTo(cp[i].x, cp[i].y); continue; }
        const mx = (cp[i - 1].x + cp[i].x) / 2;
        c.bezierCurveTo(mx, cp[i - 1].y, mx, cp[i].y, cp[i].x, cp[i].y);
    }
    c.strokeStyle = '#00e599'; c.lineWidth = 2; c.stroke();

    // End dot
    const last = cp[cp.length - 1];
    c.beginPath(); c.arc(last.x, last.y, 6, 0, Math.PI * 2);
    c.fillStyle = 'rgba(0,229,153,0.2)'; c.fill();
    c.beginPath(); c.arc(last.x, last.y, 3, 0, Math.PI * 2);
    c.fillStyle = '#00e599'; c.fill();
}

function initGraph() {
    grCtx = $('graphCanvas').getContext('2d');
    resizeGraph();
    drawGraph();
}
