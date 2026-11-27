// charts.js — small SVG charts drawn from the ledger's own numbers.
// No library, no network: every arc and bar is computed here from the
// rows in data.js, so the pictures always match the figures beside them.

export function money(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

// A donut of spending by category. rows: [{label, value, color}].
// Returns an SVG string; zero-value rows are left out.
export function donutChart(rows, size = 220) {
  const total = rows.reduce((s, r) => s + r.value, 0);
  if (total <= 0) return '<p class="empty">No spending in this month yet.</p>';
  const cx = size / 2, cy = size / 2, r = size / 2 - 14, inner = r - 30;
  let angle = -Math.PI / 2;
  let paths = '';
  for (const row of rows) {
    if (row.value <= 0) continue;
    const frac = row.value / total;
    const a0 = angle, a1 = angle + frac * Math.PI * 2;
    angle = a1;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const xi1 = cx + inner * Math.cos(a1), yi1 = cy + inner * Math.sin(a1);
    const xi0 = cx + inner * Math.cos(a0), yi0 = cy + inner * Math.sin(a0);
    paths += `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L ${xi1.toFixed(1)} ${yi1.toFixed(1)} A ${inner} ${inner} 0 ${large} 0 ${xi0.toFixed(1)} ${yi0.toFixed(1)} Z" fill="${row.color}"><title>${row.label}: ${money(row.value)}</title></path>`;
  }
  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Spending by category, total ${money(total)}" class="donut">${paths}<text x="${cx}" y="${cy - 4}" text-anchor="middle" class="donut-total">${money(total)}</text><text x="${cx}" y="${cy + 18}" text-anchor="middle" class="donut-label">spent</text></svg>`;
}

// Grouped bars: income (green) against spending (amber) per month.
export function monthlyBars(months, width = 640, height = 240) {
  const max = Math.max(...months.map((m) => Math.max(m.income, m.spent))) * 1.08;
  const padL = 52, padB = 26, padT = 12;
  const plotW = width - padL - 8, plotH = height - padT - padB;
  const slot = plotW / months.length, bw = Math.min(26, slot / 3.4);
  let out = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Income against spending by month" class="bars">`;
  for (let g = 1; g <= 4; g++) {
    const y = padT + plotH - (plotH * g) / 4;
    out += `<line x1="${padL}" y1="${y}" x2="${width - 8}" y2="${y}" class="grid"/><text x="${padL - 6}" y="${y + 4}" text-anchor="end" class="axis">${money(max * g / 4 / 1.08)}</text>`;
  }
  months.forEach((m, i) => {
    const x = padL + i * slot + slot / 2;
    const ih = (m.income / max) * plotH, sh = (m.spent / max) * plotH;
    out += `<rect x="${(x - bw - 3).toFixed(1)}" y="${(padT + plotH - ih).toFixed(1)}" width="${bw}" height="${ih.toFixed(1)}" rx="3" fill="#2f6b4f"><title>${m.month}: income ${money(m.income)}</title></rect>`;
    out += `<rect x="${(x + 3).toFixed(1)}" y="${(padT + plotH - sh).toFixed(1)}" width="${bw}" height="${sh.toFixed(1)}" rx="3" fill="#c98a2e"><title>${m.month}: spent ${money(m.spent)}</title></rect>`;
    out += `<text x="${x}" y="${height - 8}" text-anchor="middle" class="axis">${m.month}</text>`;
  });
  out += '</svg>';
  return out;
}

// A horizontal progress bar, 0–100%, with a text label beside it.
export function progressBar(pct, color) {
  const p = Math.max(0, Math.min(100, pct));
  return `<div class="bar-track" role="progressbar" aria-valuenow="${p.toFixed(0)}" aria-valuemin="0" aria-valuemax="100"><div class="bar-fill" style="width:${p.toFixed(1)}%;background:${color}"></div></div>`;
}
