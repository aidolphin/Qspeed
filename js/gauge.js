const G = { cx: 340, cy: 340, r: 270, lw: 14, start: Math.PI * 0.75, span: Math.PI * 1.5, ticks: 30, glow: 24 };
let gCtx;

function gaugeColor(ratio) {
    if (ratio < 0.45) {
        const t = ratio / 0.45;
        return `rgb(${Math.round(t * 230)},${Math.round(229 - t * 30)},${Math.round(153 - t * 90)})`;
    }
    if (ratio < 0.75) {
        const t = (ratio - 0.45) / 0.3;
        return `rgb(${Math.round(230 + t * 25)},${Math.round(199 - t * 100)},${Math.round(63 - t * 33)})`;
    }
    const t = (ratio - 0.75) / 0.25;
    return `rgb(255,${Math.round(99 - t * 60)},${Math.round(30 - t * 20)})`;
}

function autoScaleGauge(speed) {
    if (speed > STATE.maxGauge * 0.82) {
        const scales = [50, 100, 200, 500, 1000, 2000, 5000];
        STATE.maxGauge = scales.find(s => s > speed * 1.3) || 5000;
    }
}

function drawGauge() {
    const { cx, cy, r, lw, start, span, ticks, glow } = G;
    const c = gCtx;
    c.clearRect(0, 0, 680, 680);

    STATE.currentSpeed += (STATE.targetSpeed - STATE.currentSpeed) * 0.12;
    const ratio = clamp(STATE.currentSpeed / STATE.maxGauge, 0, 1);
    const endAngle = start + span * ratio;

    // Background arc
    c.beginPath(); c.arc(cx, cy, r, start, start + span);
    c.strokeStyle = 'rgba(255,255,255,0.04)'; c.lineWidth = lw; c.lineCap = 'round'; c.stroke();

    // Ticks
    for (let i = 0; i <= ticks; i++) {
        const a = start + span * (i / ticks);
        const major = i % 5 === 0;
        const ir = r - lw / 2 - (major ? 20 : 11);
        const or = r - lw / 2 - 4;
        const tr = i / ticks;
        const active = tr <= ratio;

        c.beginPath();
        c.moveTo(cx + Math.cos(a) * ir, cy + Math.sin(a) * ir);
        c.lineTo(cx + Math.cos(a) * or, cy + Math.sin(a) * or);
        c.strokeStyle = active ? gaugeColor(tr) : 'rgba(255,255,255,0.06)';
        c.lineWidth = major ? 2.2 : 1; c.lineCap = 'round'; c.stroke();

        if (major) {
            const lr = r - lw / 2 - 32;
            c.font = '500 16px "JetBrains Mono"';
            c.fillStyle = active ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)';
            c.textAlign = 'center'; c.textBaseline = 'middle';
            const label = STATE.maxGauge >= 1000
                ? (STATE.maxGauge * tr / 1000).toFixed(1) + 'G'
                : Math.round(STATE.maxGauge * tr);
            c.fillText(label, cx + Math.cos(a) * lr, cy + Math.sin(a) * lr);
        }
    }

    // Active arc with glow
    if (ratio > 0.002) {
        const clr = gaugeColor(ratio);
        c.save(); c.shadowColor = clr; c.shadowBlur = glow;
        c.beginPath(); c.arc(cx, cy, r, start, endAngle);
        c.strokeStyle = clr; c.lineWidth = lw; c.lineCap = 'round'; c.stroke();
        c.restore();
        // Second pass for intensity
        c.beginPath(); c.arc(cx, cy, r, start, endAngle);
        c.strokeStyle = clr; c.lineWidth = lw; c.lineCap = 'round'; c.stroke();
    }

    // Outer ring
    c.beginPath(); c.arc(cx, cy, r + lw / 2 + 8, start, start + span);
    c.strokeStyle = 'rgba(255,255,255,0.02)'; c.lineWidth = 1; c.stroke();

    // Update number
    const disp = STATE.currentSpeed < 10 ? STATE.currentSpeed.toFixed(1) : Math.round(STATE.currentSpeed);
    $('speedNum').textContent = disp;
    $('speedNum').style.color = ratio > 0.01 ? gaugeColor(ratio) : 'var(--fg)';

    requestAnimationFrame(drawGauge);
}

function initGauge() {
    gCtx = $('gaugeCanvas').getContext('2d');
    drawGauge();
}
