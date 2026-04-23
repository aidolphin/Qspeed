/**
 * @fileoverview Shared utility functions used across all modules.
 */

/** @param {string} id @returns {HTMLElement|null} */
const $ = id => document.getElementById(id);

/**
 * Format a speed value for display.
 * @param {number} v - Speed in Mbps
 * @param {number} [d=1] - Decimal places for values under 10
 * @returns {string}
 */
const fmt = (v, d = 1) => v < 10 ? v.toFixed(d) : Math.round(v).toString();

/**
 * Clamp a number between min and max.
 * @param {number} v @param {number} min @param {number} max @returns {number}
 */
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * Show a toast notification.
 * @param {string} msg - Message text
 * @param {'info'|'error'|'warn'} [type='info'] - Toast type
 */
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
