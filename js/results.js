const GRADE_COLORS = {
    'A+': 'var(--success)', 'A': 'var(--success)',
    'B+': '#22d3ee', 'B': '#22d3ee',
    'C': 'var(--warn)', 'D': '#f97316', 'F': 'var(--danger)',
};

function showResults(r) {
    const { score, grade } = calculateScore(r);

    $('rDown').textContent = fmt(r.download);
    $('rUp').textContent = fmt(r.upload);
    $('rPing').textContent = Math.round(r.ping);
    $('rJitter').textContent = r.jitter.toFixed(1);
    $('rLoss').textContent = r.loss.toFixed(1);
    $('rISP').textContent = STATE.ispInfo.isp || 'Unknown';
    $('rServer').textContent = STATE.ispInfo.city
        ? `${STATE.ispInfo.city}, ${STATE.ispInfo.country}`
        : 'Cloudflare';
    $('rConn').textContent = getConnectionLabel();

    // Animate score ring
    const circumference = 2 * Math.PI * 34;
    const offset = circumference - (score / 100) * circumference;
    const arc = $('scoreArc');
    arc.style.transition = 'stroke-dashoffset 1.2s ease-out';
    arc.style.strokeDashoffset = offset;
    arc.style.stroke = GRADE_COLORS[grade] || 'var(--accent)';
    $('scoreNum').textContent = score;
    $('scoreGrade').textContent = grade;
    $('scoreGrade').style.color = GRADE_COLORS[grade] || 'var(--fg)';

    $('vLoss').textContent = r.loss.toFixed(1) + ' %';
    $('phLoss').classList.add('done');

    $('resultsSection').style.display = '';
    $('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    saveHistory(r, score, grade);
}

function saveHistory(r, score, grade) {
    let history = JSON.parse(localStorage.getItem('qspeed_history') || '[]');
    history.unshift({ date: new Date().toISOString(), download: r.download, upload: r.upload, ping: r.ping, score, grade });
    if (history.length > CONFIG.MAX_HISTORY) history = history.slice(0, CONFIG.MAX_HISTORY);
    localStorage.setItem('qspeed_history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('qspeed_history') || '[]');
    const list = $('historyList');

    // FIX: never destroy historyEmpty via innerHTML — always keep it in DOM, just toggle visibility
    const empty = $('historyEmpty');
    if (empty) empty.style.display = history.length === 0 ? '' : 'none';
    if (history.length === 0) return;

    // Remove only history rows, not the empty placeholder
    list.querySelectorAll('.history-row').forEach(el => el.remove());

    const rows = history.map(h => {
        const d = new Date(h.date);
        const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        const color = GRADE_COLORS[h.grade] || 'var(--muted)';
        return `<div class="history-row">
            <span style="color:var(--muted);font-size:.75rem">${dateStr}</span>
            <span class="h-val" style="font-size:.75rem">${fmt(h.download)} <span style="color:var(--muted);font-size:.6rem">Mbps</span></span>
            <span class="h-val" style="font-size:.75rem">${fmt(h.upload)} <span style="color:var(--muted);font-size:.6rem">Mbps</span></span>
            <span class="h-val" style="font-size:.75rem">${Math.round(h.ping)} <span style="color:var(--muted);font-size:.6rem">ms</span></span>
            <span class="h-val" style="font-size:.75rem;color:${color}">${h.grade}</span>
        </div>`;
    }).join('');
    // FIX: actually insert the rows into the DOM
    list.insertAdjacentHTML('afterbegin', rows);
}

function copyResults() {
    const r = STATE.results;
    if (!r) return;
    const { score, grade } = calculateScore(r);
    const text = [
        'Qspeed Results',
        '─────────────────',
        `Download: ${fmt(r.download)} Mbps`,
        `Upload:   ${fmt(r.upload)} Mbps`,
        `Ping:     ${Math.round(r.ping)} ms`,
        `Jitter:   ${r.jitter.toFixed(1)} ms`,
        `Loss:     ${r.loss.toFixed(1)}%`,
        `Quality:  ${grade} (${score}/100)`,
        `ISP:      ${STATE.ispInfo.isp || 'Unknown'}`,
        `Date:     ${new Date().toLocaleString()}`,
        '─────────────────',
        'Tested with Qspeed — qspeed.com',
    ].join('\n');

    navigator.clipboard.writeText(text)
        .then(() => toast('Results copied to clipboard!'))
        .catch(() => toast('Failed to copy', 'error'));
}
