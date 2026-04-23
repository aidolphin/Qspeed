/**
 * @fileoverview Application entry point.
 * Initialises all modules, binds DOM events, and orchestrates the test run.
 * Load order in index.html must be: config → state → utils → particles →
 *   gauge → graph → score → engine → results → ui → main
 */

async function runTest() {
    if (STATE.testing) {
        if (STATE.abort) STATE.abort.abort();
        STATE.testing = false;
        resetUI();
        return;
    }

    if (!STATE.serverOk) {
        toast('Test server is unreachable. Please check your connection.', 'error');
        checkServer();
        return;
    }

    STATE.testing = true;
    STATE.currentSpeed = 0; STATE.targetSpeed = 0; STATE.maxGauge = 100;
    STATE.history = []; STATE.pingSamples = []; STATE.dlSamples = []; STATE.ulSamples = [];
    STATE.failedRequests = 0; STATE.totalRequests = 0; STATE.results = null;

    $('vPing').textContent = '-- ms'; $('vJitter').textContent = '-- ms';
    $('vDown').textContent = '-- Mbps'; $('vUp').textContent = '-- Mbps'; $('vLoss').textContent = '-- %';
    Object.values(PHASE_MAP).forEach(id => $(id).classList.remove('active', 'done'));
    $('phLoss').classList.remove('active', 'done');
    $('resultsSection').style.display = 'none';
    $('graphSection').style.display = 'none';

    $('goBtn').classList.add('testing');
    $('goIco').className = 'fas fa-stop';
    $('goTxt').textContent = 'STOP';

    STATE.abort = new AbortController();
    const ac = STATE.abort;

    try {
        const pj = await testPing(ac);
        if (ac.signal.aborted) return;
        markPhaseDone('ping');
        markPhaseDone('jitter');

        const dl = await testDownload(ac);
        if (ac.signal.aborted) return;
        markPhaseDone('download');

        const ul = await testUpload(ac);
        if (ac.signal.aborted) return;
        markPhaseDone('upload');

        const loss = STATE.totalRequests > 0
            ? (STATE.failedRequests / STATE.totalRequests) * 100
            : 0;

        STATE.results = {
            download: dl || 0,
            upload: ul || 0,
            ping: pj.ping || 0,
            jitter: pj.jitter || 0,
            loss: Math.min(loss, 100),
        };

        STATE.targetSpeed = 0;
        setPhase('done');
        showResults(STATE.results);
        toast('Speed test complete!');

    } catch (e) {
        if (!ac.signal.aborted) {
            toast('Test error: ' + e.message, 'error');
            setPhase('done');
        }
    }

    STATE.testing = false;
    $('goBtn').classList.remove('testing');
    $('goIco').className = 'fas fa-redo';
    $('goTxt').textContent = 'RETRY';
}

function init() {
    initParticles();
    initGauge();
    initGraph();
    initFAQ();
    renderHistory();
    checkServer();
    detectConnection();

    $('goBtn').addEventListener('click', runTest);
    $('btnShare').addEventListener('click', copyResults);
    $('btnRetest').addEventListener('click', () => {
        $('resultsSection').style.display = 'none';
        runTest();
    });
    $('btnClearHistory').addEventListener('click', () => {
        localStorage.removeItem('qspeed_history');
        renderHistory();
        toast('History cleared');
    });
    window.addEventListener('resize', () => { resizeGraph(); drawGraph(); });
}

document.addEventListener('DOMContentLoaded', init);
