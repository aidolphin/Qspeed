/**
 * @fileoverview UI state controller.
 * Manages phase card transitions (idle → ping → jitter → download → upload → done),
 * FAQ accordion, and full UI reset.
 */

    ping: 'phPing',
    jitter: 'phJitter',
    download: 'phDown',
    upload: 'phUp',
};

const PHASE_LABELS = {
    ping: 'Measuring latency...',
    jitter: 'Calculating jitter...',
    download: 'Testing download speed...',
    upload: 'Testing upload speed...',
    done: 'Test complete',
};

function setPhase(p) {
    STATE.phase = p;
    Object.values(PHASE_MAP).forEach(id => $(id).classList.remove('active', 'done'));
    if (PHASE_MAP[p]) $(PHASE_MAP[p]).classList.add('active');
    const label = PHASE_LABELS[p] || '';
    $('statusMsg').textContent = label;
    $('graphLabel').textContent = label || '--';
}

function markPhaseDone(p) {
    if (PHASE_MAP[p]) $(PHASE_MAP[p]).classList.replace('active', 'done');
}

function resetUI() {
    STATE.targetSpeed = 0;
    $('goBtn').classList.remove('testing');
    $('goIco').className = 'fas fa-play text-lg';
    $('goTxt').textContent = 'GO';
    Object.values(PHASE_MAP).forEach(id => $(id).classList.remove('active', 'done'));
    $('phLoss').classList.remove('active', 'done');
    $('statusMsg').textContent = 'Press GO to start the test';
    $('graphLabel').textContent = '--';
    $('graphSection').style.display = 'none';
    $('vPing').textContent = '-- ms';
    $('vJitter').textContent = '-- ms';
    $('vDown').textContent = '-- Mbps';
    $('vUp').textContent = '-- Mbps';
    $('vLoss').textContent = '-- %';
}

function initFAQ() {
    document.querySelectorAll('.faq-q').forEach(btn => {
        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            document.querySelectorAll('.faq-q').forEach(b => {
                b.setAttribute('aria-expanded', 'false');
                b.nextElementSibling.classList.remove('open');
            });
            if (!expanded) {
                btn.setAttribute('aria-expanded', 'true');
                btn.nextElementSibling.classList.add('open');
            }
        });
    });
}
