/**
 * @fileoverview Quality score algorithm.
 * Converts raw test results into a 0–100 score and A+–F letter grade.
 * Weights: Download 30pts, Upload 25pts, Ping 25pts, Jitter 12pts, Loss 8pts.
 *
 * @param {{download:number, upload:number, ping:number, jitter:number, loss:number}} r
 * @returns {{score:number, grade:string}}
 */
function calculateScore(r) {
    if (!r) return { score: 0, grade: 'F' };
    let s = 0;

    // Download (0–30 pts)
    if (r.download >= 100) s += 30;
    else if (r.download >= 50) s += 25;
    else if (r.download >= 25) s += 20;
    else if (r.download >= 10) s += 12;
    else if (r.download >= 5) s += 6;
    else s += Math.max(0, r.download);

    // Upload (0–25 pts)
    if (r.upload >= 50) s += 25;
    else if (r.upload >= 25) s += 20;
    else if (r.upload >= 10) s += 15;
    else if (r.upload >= 5) s += 8;
    else s += Math.max(0, r.upload * 1.5);

    // Ping (0–25 pts)
    if (r.ping <= 10) s += 25;
    else if (r.ping <= 20) s += 22;
    else if (r.ping <= 40) s += 16;
    else if (r.ping <= 80) s += 10;
    else if (r.ping <= 150) s += 5;

    // Jitter (0–12 pts)
    if (r.jitter <= 2) s += 12;
    else if (r.jitter <= 5) s += 10;
    else if (r.jitter <= 15) s += 6;
    else if (r.jitter <= 30) s += 3;

    // Packet loss (0–8 pts)
    if (r.loss <= 0) s += 8;
    else if (r.loss <= 0.5) s += 6;
    else if (r.loss <= 1) s += 4;
    else if (r.loss <= 3) s += 2;

    s = Math.round(clamp(s, 0, 100));
    let grade = 'F';
    if (s >= 92) grade = 'A+';
    else if (s >= 85) grade = 'A';
    else if (s >= 75) grade = 'B+';
    else if (s >= 65) grade = 'B';
    else if (s >= 50) grade = 'C';
    else if (s >= 35) grade = 'D';
    return { score: s, grade };
}
