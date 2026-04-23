/**
 * @fileoverview Background particle canvas animation.
 * Renders 50 slow-drifting green dots on a fixed canvas behind the UI.
 * Wraps at viewport edges. Respects prefers-reduced-motion via CSS.
 */

    const cv = $('particleCanvas');
    const ctx = cv.getContext('2d');
    let W, H;
    const dots = [];
    const COUNT = 50;

    function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < COUNT; i++) {
        dots.push({
            x: Math.random() * innerWidth,
            y: Math.random() * innerHeight,
            vx: (Math.random() - .5) * .15,
            vy: (Math.random() - .5) * .15,
            r: Math.random() * 1.5 + .5,
            a: Math.random() * .2 + .04,
        });
    }

    function frame() {
        ctx.clearRect(0, 0, W, H);
        for (const d of dots) {
            d.x += d.vx; d.y += d.vy;
            if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
            if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,229,153,${d.a})`;
            ctx.fill();
        }
        requestAnimationFrame(frame);
    }
    frame();
}
