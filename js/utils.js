const $ = id => document.getElementById(id);
const fmt = (v, d = 1) => v < 10 ? v.toFixed(d) : Math.round(v).toString();
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function toast(msg, type = 'info') {
    const box = $('toastBox');
    const el = document.createElement('div');
    el.className = 'toast';
    const icons = { info: 'circle-check', error: 'circle-xmark', warn: 'triangle-exclamation' };
    const colors = { info: 'var(--success)', error: 'var(--danger)', warn: 'var(--warn)' };
    el.innerHTML = `<i class="fas fa-${icons[type] || icons.info}" style="color:${colors[type] || colors.info};flex-shrink:0"></i><span>${msg}</span>`;
    box.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 4000);
}
