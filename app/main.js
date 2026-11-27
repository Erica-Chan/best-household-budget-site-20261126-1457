// main.js — Maple Ledger's behaviour: routing, the ledger, the planner,
// goals, bills and calculators. The family's figures live in data.js;
// anything the household types is kept in localStorage on their own
// browser, so the site works offline and remembers what they entered.
import { HOUSEHOLD, CATEGORIES, BUCKETS, TRANSACTIONS, GOALS, BILLS, MONTHLY, MONTH_LABELS } from './data.js';
import { money, donutChart, monthlyBars, progressBar } from './charts.js';

const store = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: keep working in memory */ } },
};

let state = {
  month: HOUSEHOLD.month,
  catFilter: 'all',
  search: '',
  added: store.get('maple-added', []),
  deleted: store.get('maple-deleted', []),
  edited: store.get('maple-edited', {}),
  goalExtra: store.get('maple-goals', {}),
  billsPaid: store.get('maple-bills', {}),
  budgets: store.get('maple-budgets', {}),
  editingId: null,
};

function saveState() {
  store.set('maple-added', state.added);
  store.set('maple-deleted', state.deleted);
  store.set('maple-edited', state.edited);
  store.set('maple-goals', state.goalExtra);
  store.set('maple-bills', state.billsPaid);
  store.set('maple-budgets', state.budgets);
}

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function catById(id) { return CATEGORIES.find((c) => c.id === id); }
function budgetOf(cat) { return state.budgets[cat.id] ?? cat.budget; }

// All transactions for the chosen month: the family's rows, with the
// household's own edits applied, plus anything they added themselves.
function monthTx() {
  const rows = TRANSACTIONS.filter((t) => t.date.slice(0, 7) === state.month && !state.deleted.includes(t.id))
    .map((t) => (state.edited[t.id] ? { ...t, ...state.edited[t.id] } : t));
  return rows.concat(state.added.filter((t) => t.date.slice(0, 7) === state.month));
}
function incomeOf(rows) { return rows.filter((t) => t.kind === 'income').reduce((s, t) => s + t.amount, 0); }
function spentOf(rows) { return rows.filter((t) => t.kind === 'expense').reduce((s, t) => s + t.amount, 0); }
function spentByCategory(rows) {
  const out = {};
  for (const t of rows) if (t.kind === 'expense') out[t.category] = (out[t.category] || 0) + t.amount;
  return out;
}
function bucketSpent(rows) {
  const byCat = spentByCategory(rows);
  const out = { needs: 0, wants: 0, savings: 0 };
  for (const c of CATEGORIES) out[c.bucket] += byCat[c.id] || 0;
  // Savings move on payday, before anything is spent ("pay yourself
  // first"), so the savings bucket counts as moved in full each month —
  // the transfers are not purchases and never appear in the ledger.
  out.savings = CATEGORIES.filter((c) => c.bucket === 'savings').reduce((s, c) => s + budgetOf(c), 0);
  return out;
}
function bucketBudget() {
  const out = { needs: 0, wants: 0, savings: 0 };
  for (const c of CATEGORIES) out[c.bucket] += budgetOf(c);
  return out;
}

const app = document.getElementById('app');
const monthSelect = document.getElementById('month-select');

function navLink(hash, label) {
  const current = (location.hash || '#/').replace('#', '');
  const active = current === hash.replace('#', '') || (hash === '#/' && (current === '/' || current === ''));
  return `<a href="${hash}" class="${active ? 'active' : ''}">${label}</a>`;
}

function header() {
  return `<header class="topbar">
    <a class="brand" href="#/"><span class="brand-mark">🍁</span><span><strong>Maple Ledger</strong><small>${esc(HOUSEHOLD.name)} · ${esc(HOUSEHOLD.city)}</small></span></a>
    <nav class="mainnav" aria-label="Sections">
      ${navLink('#/', 'Overview')}${navLink('#/planner', 'Planner')}${navLink('#/expenses', 'Expenses')}${navLink('#/goals', 'Goals')}${navLink('#/charts', 'Charts')}${navLink('#/calculators', 'Calculators')}${navLink('#/bills', 'Bills')}${navLink('#/guide', 'Guide')}
    </nav>
    <label class="month-pick">Month <select id="month-select" aria-label="Month">
      ${Object.keys(MONTH_LABELS).map((m) => `<option value="${m}" ${m === state.month ? 'selected' : ''}>${MONTH_LABELS[m]}</option>`).join('')}
    </select></label>
  </header>`;
}

function kpiCards(rows) {
  const income = incomeOf(rows), spent = spentOf(rows);
  const saved = CATEGORIES.filter((c) => c.bucket === 'savings').reduce((s, c) => s + budgetOf(c), 0);
  const left = income - spent - saved;
  const daysLeft = state.month === '2026-11' ? 4 : 0;
  return `<section class="kpis">
    <div class="kpi"><span>Income in</span><strong>${money(income)}</strong><small>${MONTH_LABELS[state.month]}</small></div>
    <div class="kpi"><span>Spent so far</span><strong>${money(spent)}</strong><small>${money(Math.max(0, income - spent))} left after spending</small></div>
    <div class="kpi"><span>Planned savings</span><strong>${money(saved)}</strong><small>20% rule: ${money(income * 0.2)}</small></div>
    <div class="kpi ${left < 0 ? 'bad' : 'good'}"><span>Left to spend</span><strong>${money(left)}</strong><small>${daysLeft ? daysLeft + ' days left in November' : 'Month complete'}</small></div>
  </section>`;
}

function categoryRows(rows) {
  const byCat = spentByCategory(rows);
  return CATEGORIES.filter((c) => c.bucket !== 'savings').map((c) => {
    const spent = byCat[c.id] || 0, b = budgetOf(c);
    const pct = b ? Math.min(100, (spent / b) * 100) : 0;
    const over = spent > b;
    return `<tr><td><span class="dot" style="background:${c.color}"></span>${c.label}</td><td>${money(spent)}</td><td>${money(b)}</td><td>${money(b - spent)}</td><td><div class="mini-bar"><div style="width:${pct}%;background:${over ? '#b3402e' : c.color}"></div></div></td><td>${over ? '<span class="tag over">over</span>' : pct > 85 ? '<span class="tag warn">near limit</span>' : '<span class="tag ok">on track</span>'}</td></tr>`;
  }).join('');
}

function viewOverview() {
  const rows = monthTx();
  const byCat = spentByCategory(rows);
  const donutRows = CATEGORIES.filter((c) => c.bucket !== 'savings' && (byCat[c.id] || 0) > 0)
    .map((c) => ({ label: c.label, value: byCat[c.id], color: c.color })).sort((a, b) => b.value - a.value);
  const recent = [...rows].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  const unpaid = BILLS.filter((b) => !(state.billsPaid[b.id] ?? b.paid));
  const buckets = bucketSpent(rows), budgets = bucketBudget();
  return `${kpiCards(rows)}
  <section class="grid-2">
    <div class="card"><h2>Where the money went</h2>${donutChart(donutRows)}
      <ul class="legend">${donutRows.slice(0, 6).map((r) => `<li><span class="dot" style="background:${r.color}"></span>${r.label} <strong>${money(r.value)}</strong></li>`).join('')}</ul>
      <p><a class="btn" href="#/charts">See all charts →</a></p></div>
    <div class="card"><h2>50 / 30 / 20 this month</h2>
      ${Object.keys(BUCKETS).map((k) => {
        const spent = buckets[k], b = budgets[k];
        return `<div class="bucket-line"><div><strong>${BUCKETS[k].label}</strong> — ${money(spent)} of ${money(b)} planned <small>(${BUCKETS[k].target}% rule)</small></div>${progressBar(b ? (spent / b) * 100 : 0, '#2f6b4f')}</div>`;
      }).join('')}
      <p class="muted">${BUCKETS.needs.blurb}</p><p><a class="btn" href="#/planner">Open the planner →</a></p>
      <h3>Goals at a glance</h3>
      ${GOALS.slice(0, 2).map((g) => { const saved = g.saved + (state.goalExtra[g.id] || 0); return `<div class="goal-mini"><span>${g.name}</span><strong>${Math.round((saved / g.target) * 100)}%</strong>${progressBar((saved / g.target) * 100, g.color)}</div>`; }).join('')}
      <p><a class="btn" href="#/goals">All savings goals →</a></p></div>
  </section>
  <section class="grid-2">
    <div class="card"><h2>Recent spending</h2>
      <table class="tbl"><thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th></tr></thead><tbody>
      ${recent.map((t) => `<tr><td>${t.date.slice(5)}</td><td>${esc(t.payee)}</td><td>${t.category ? catById(t.category).label : 'Income'}</td><td class="num ${t.kind === 'income' ? 'in' : ''}">${t.kind === 'income' ? '+' : '−'}${money(t.amount)}</td></tr>`).join('')}
      </tbody></table><p><a class="btn" href="#/expenses">Full ledger →</a></p></div>
    <div class="card"><h2>Bills still to pay</h2>
      ${unpaid.length ? `<ul class="bill-list">${unpaid.map((b) => `<li><span>${esc(b.name)}</span><strong>${money(b.amount)}</strong><small>due ${b.due}</small></li>`).join('')}</ul>` : '<p>Every bill this month is paid. 🎉</p>'}
      <p class="muted">${BILLS.length} recurring bills · ${money(BILLS.reduce((s, b) => s + b.amount, 0))} a month in fixed bills.</p>
      <p><a class="btn" href="#/bills">Manage bills →</a></p>
      <h3>How this household budgets</h3>
      <p>Every dollar has a job before the month starts: needs first, then wants, then savings — the 50/30/20 rule, checked every Sunday night at the kitchen table.</p>
      <p><a class="btn" href="#/guide">Read the guide →</a></p></div>
  </section>`;
}

function viewPlanner() {
  const rows = monthTx();
  const income = incomeOf(rows);
  const byCat = spentByCategory(rows);
  const budgets = bucketBudget();
  return `<section class="card intro"><h1>Monthly budget planner</h1>
    <p>Plan November before it happens: set a budget for every category, and the planner checks it against the 50/30/20 rule. Budgets you change here are saved in this browser and used on every page.</p></section>
  <section class="grid-3">
    ${Object.keys(BUCKETS).map((k) => {
      const target = Math.round(income * BUCKETS[k].target / 100);
      const diff = budgets[k] - target;
      return `<div class="card bucket-card"><h2>${BUCKETS[k].label} · ${BUCKETS[k].target}%</h2><p class="big">${money(budgets[k])}</p><p>Rule says ${money(target)} on ${money(income)} income.</p><p class="${diff > 0 ? 'warn-text' : 'ok-text'}">${diff > 0 ? money(diff) + ' over the rule — trim a category below.' : diff < 0 ? money(-diff) + ' under the rule — room to spare.' : 'Exactly on the rule.'}</p><p class="muted">${BUCKETS[k].blurb}</p></div>`;
    }).join('')}
  </section>
  <section class="card"><h2>Set every category</h2>
    <p class="muted">Change a number and the totals above update at once. “Spent” comes from the ledger, so a budget you break shows up here in red.</p>
    <form id="planner-form"><table class="tbl"><thead><tr><th>Category</th><th>Bucket</th><th class="num">Budget $</th><th class="num">Spent</th><th class="num">Left</th><th></th></tr></thead><tbody>
    ${CATEGORIES.map((c) => { const spent = byCat[c.id] || 0, b = budgetOf(c); return `<tr><td><span class="dot" style="background:${c.color}"></span>${c.label}</td><td>${BUCKETS[c.bucket].label}</td><td class="num"><input type="number" min="0" step="5" value="${b}" data-budget="${c.id}" aria-label="Budget for ${c.label}"></td><td class="num">${money(spent)}</td><td class="num ${spent > b ? 'over-text' : ''}">${money(b - spent)}</td><td>${spent > b ? '<span class="tag over">over</span>' : ''}</td></tr>`; }).join('')}
    </tbody></table>
    <p><button class="btn primary" type="submit">Save this plan</button> <button class="btn" type="button" id="reset-plan">Reset to the family’s plan</button> <span id="plan-saved" class="ok-text"></span></p></form>
    <h3>The 50/30/20 rule, in one paragraph</h3>
    <p>Half the money for needs, thirty percent for wants, twenty percent for savings and extra debt payments. A household that hits 50/30/20 on ${money(income)} puts ${money(income * 0.5)} to needs, ${money(income * 0.3)} to wants and ${money(income * 0.2)} to savings. If rent alone eats more than half, the rule bends — fix housing first, then chase the percentages.</p></section>`;
}

function viewExpenses() {
  const rows = monthTx().filter((t) => t.kind === 'expense');
  const filtered = rows.filter((t) => (state.catFilter === 'all' || t.category === state.catFilter) && (!state.search || (t.payee + ' ' + (t.note || '')).toLowerCase().includes(state.search.toLowerCase())));
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  const total = filtered.reduce((s, t) => s + t.amount, 0);
  const editingBase = state.editingId ? [...TRANSACTIONS, ...state.added].find((t) => t.id === state.editingId) : null;
  const editing = editingBase && state.edited[editingBase.id] ? { ...editingBase, ...state.edited[editingBase.id] } : editingBase;
  return `<section class="card intro"><h1>Expenses — the ledger</h1>
    <p>${rows.length} expenses in ${MONTH_LABELS[state.month]} · <strong>${money(total)}</strong> shown below. Add a purchase the moment it happens, fix a wrong amount, or delete a duplicate — the totals on every page update with it.</p></section>
  <section class="grid-2">
    <div class="card"><h2>${editing ? 'Edit expense' : 'Add an expense'}</h2>
      <form id="expense-form">
        <label>Date <input type="date" id="f-date" value="${editing ? editing.date : state.month + '-26'}" required></label>
        <label>What was it? <input type="text" id="f-payee" value="${editing ? esc(editing.payee) : ''}" placeholder="e.g. Fred Meyer — weekly shop" required></label>
        <label>Category <select id="f-cat">${CATEGORIES.filter((c) => c.bucket !== 'savings').map((c) => `<option value="${c.id}" ${editing && editing.category === c.id ? 'selected' : ''}>${c.label}</option>`).join('')}</select></label>
        <label>Amount ($) <input type="number" id="f-amount" min="0.01" step="0.01" value="${editing ? editing.amount : ''}" placeholder="0.00" required></label>
        <label>Note <input type="text" id="f-note" value="${editing ? esc(editing.note || '') : ''}" placeholder="Optional"></label>
        <p><button class="btn primary" type="submit">${editing ? 'Save changes' : 'Add expense'}</button> ${editing ? '<button class="btn" type="button" id="cancel-edit">Cancel</button>' : ''}</p>
      </form>
      <p class="muted">Saved in this browser only — nothing leaves the household’s computer.</p></div>
    <div class="card"><h2>Filter the ledger</h2>
      <label>Category <select id="filter-cat"><option value="all">All categories</option>${CATEGORIES.filter((c) => c.bucket !== 'savings').map((c) => `<option value="${c.id}" ${state.catFilter === c.id ? 'selected' : ''}>${c.label}</option>`).join('')}</select></label>
      <label>Search <input type="search" id="filter-search" value="${esc(state.search)}" placeholder="Search payee or note"></label>
      <p class="big">${money(total)}</p><p class="muted">${sorted.length} expenses match.</p>
      <h3>Budget vs spent</h3><table class="tbl"><thead><tr><th>Category</th><th class="num">Spent</th><th class="num">Budget</th><th class="num">Left</th><th></th></tr></thead><tbody>${categoryRows(monthTx())}</tbody></table></div>
  </section>
  <section class="card"><h2>All expenses</h2>
    <table class="tbl"><thead><tr><th>Date</th><th>What</th><th>Category</th><th>Note</th><th class="num">Amount</th><th></th></tr></thead><tbody>
    ${sorted.map((t) => `<tr><td>${t.date.slice(5)}</td><td>${esc(t.payee)}</td><td>${catById(t.category).label}</td><td class="muted">${esc(t.note || '')}</td><td class="num">${money(t.amount)}</td><td><button class="btn small" data-edit="${t.id}">Edit</button> <button class="btn small danger" data-del="${t.id}">Delete</button></td></tr>`).join('') || '<tr><td colspan="6">Nothing matches — try another filter.</td></tr>'}
    </tbody></table></section>`;
}

function viewGoals() {
  return `<section class="card intro"><h1>Savings goals</h1>
    <p>Four goals, one order: the emergency fund first, then the car, the holiday and college. Add money to a goal and the bar, the finish date and the months-to-go all move.</p></section>
  <section class="grid-2">
    ${GOALS.map((g) => {
      const saved = g.saved + (state.goalExtra[g.id] || 0);
      const pct = (saved / g.target) * 100;
      const monthsLeft = Math.max(0, Math.ceil((g.target - saved) / g.monthly));
      const done = saved >= g.target;
      return `<div class="card goal-card"><h2>${g.name}</h2><p class="big">${money(saved)} <small>of ${money(g.target)}</small></p>${progressBar(pct, g.color)}<p><strong>${pct.toFixed(0)}% there</strong> · ${money(g.monthly)}/month · ${done ? 'Done! 🎉' : monthsLeft + ' months to go at this rate'}</p><p class="muted">${g.note}</p>
      <form class="goal-form" data-goal="${g.id}"><label>Add to this goal ($) <input type="number" min="1" step="1" placeholder="100" required></label><button class="btn primary" type="submit">Add money</button></form></div>`;
    }).join('')}
  </section>
  <section class="card"><h2>Why this order?</h2><p>An emergency fund is insurance you pay yourself: with ${money(GOALS[0].saved)} of ${money(GOALS[0].target)} saved, one broken furnace no longer means a credit card. The car comes next because the 2014 Outback is the household’s way to work. The holiday and college are real, but they can wait a month — an emergency cannot.</p></section>`;
}

function viewCharts() {
  const rows = monthTx();
  const byCat = spentByCategory(rows);
  const donutRows = CATEGORIES.filter((c) => c.bucket !== 'savings' && (byCat[c.id] || 0) > 0)
    .map((c) => ({ label: c.label, value: byCat[c.id], color: c.color })).sort((a, b) => b.value - a.value);
  const buckets = bucketSpent(rows), budgets = bucketBudget();
  const totalSpent = spentOf(rows);
  return `<section class="card intro"><h1>Charts</h1><p>Every chart is drawn from the ledger — change an expense and the pictures change with it.</p></section>
  <section class="grid-2">
    <div class="card"><h2>Spending by category — ${MONTH_LABELS[state.month]}</h2>${donutChart(donutRows, 260)}
      <table class="tbl"><thead><tr><th>Category</th><th class="num">Spent</th><th class="num">Share</th></tr></thead><tbody>
      ${donutRows.map((r) => `<tr><td><span class="dot" style="background:${r.color}"></span>${r.label}</td><td class="num">${money(r.value)}</td><td class="num">${((r.value / totalSpent) * 100).toFixed(1)}%</td></tr>`).join('')}
      </tbody></table></div>
    <div class="card"><h2>Income vs spending — 2026</h2>${monthlyBars(MONTHLY)}
      <p class="legend-line"><span class="swatch" style="background:#2f6b4f"></span> Income <span class="swatch" style="background:#c98a2e"></span> Spent</p>
      <table class="tbl"><thead><tr><th>Month</th><th class="num">Income</th><th class="num">Spent</th><th class="num">Left over</th></tr></thead><tbody>
      ${MONTHLY.map((m) => `<tr><td>${m.month}</td><td class="num">${money(m.income)}</td><td class="num">${money(m.spent)}</td><td class="num">${money(m.income - m.spent)}</td></tr>`).join('')}
      </tbody></table></div>
  </section>
  <section class="card"><h2>Needs, wants and savings — ${MONTH_LABELS[state.month]}</h2>
    ${Object.keys(BUCKETS).map((k) => `<div class="bucket-line"><div><strong>${BUCKETS[k].label}</strong> — ${money(buckets[k])} spent of ${money(budgets[k])} planned</div>${progressBar(budgets[k] ? (buckets[k] / budgets[k]) * 100 : 0, '#2f6b4f')}</div>`).join('')}
    <p class="muted">Housing is the biggest slice at ${money(byCat.housing || 0)} — ${totalSpent ? ((byCat.housing / totalSpent) * 100).toFixed(0) : 0}% of all spending. Groceries are second at ${money(byCat.groceries || 0)}.</p></section>`;
}

function viewCalculators() {
  const income = incomeOf(monthTx());
  return `<section class="card intro"><h1>Calculators</h1><p>Three tools the household actually uses: how long until a goal is funded, what 50/30/20 means for any pay packet, and how many months the emergency fund covers.</p></section>
  <section class="grid-2">
    <div class="card"><h2>How long until my goal?</h2>
      <form id="calc-goal">
        <label>Goal amount ($) <input type="number" id="cg-target" value="4800" min="1" required></label>
        <label>Already saved ($) <input type="number" id="cg-saved" value="2150" min="0" required></label>
        <label>Save each month ($) <input type="number" id="cg-monthly" value="320" min="1" required></label>
      </form><p class="result" id="cg-result"></p>
      <p class="muted">Example filled in: the Japan holiday, ${money(4800)} target, ${money(2150)} saved, ${money(320)} a month.</p></div>
    <div class="card"><h2>50 / 30 / 20 for my income</h2>
      <form id="calc-split">
        <label>Monthly take-home pay ($) <input type="number" id="cs-income" value="${income}" min="1" required></label>
      </form><p class="result" id="cs-result"></p>
      <p class="muted">Filled in with this household’s ${money(income)} for ${MONTH_LABELS[state.month]}. Try your own pay — the split updates as you type.</p></div>
    <div class="card"><h2>Emergency fund runway</h2>
      <form id="calc-runway">
        <label>Emergency savings ($) <input type="number" id="cr-saved" value="8400" min="0" required></label>
        <label>Monthly needs — rent, food, bills ($) <input type="number" id="cr-needs" value="4027" min="1" required></label>
      </form><p class="result" id="cr-result"></p>
      <p class="muted">Experts suggest 3–6 months of needs. This household’s ${money(8400)} covers about two months of needs — the fund is the top priority for a reason.</p></div>
    <div class="card"><h2>What if I save $100 more?</h2>
      <p>On ${money(income)} a month, an extra $100 a month is $1,200 a year — enough to finish the Japan holiday four months early, or to add a month to the emergency fund. Small, automatic transfers on payday beat big, occasional ones: set the transfer for the day the salary lands, before the money can be spent.</p>
      <p><a class="btn" href="#/goals">Put it on a goal →</a></p></div>
  </section>`;
}

function viewBills() {
  const total = BILLS.reduce((s, b) => s + b.amount, 0);
  const paidTotal = BILLS.filter((b) => state.billsPaid[b.id] ?? b.paid).reduce((s, b) => s + b.amount, 0);
  return `<section class="card intro"><h1>Bills</h1><p>${money(paidTotal)} of ${money(total)} paid for ${MONTH_LABELS[state.month]}. Tick a bill off the moment it clears — the list is the household’s memory, so nothing gets paid twice or missed.</p></section>
  <section class="card"><table class="tbl"><thead><tr><th>Bill</th><th>Due</th><th>Autopay</th><th class="num">Amount</th><th>Status</th><th></th></tr></thead><tbody>
  ${BILLS.map((b) => { const paid = state.billsPaid[b.id] ?? b.paid; return `<tr><td>${esc(b.name)}</td><td>${b.due}</td><td>${b.autopay ? 'Yes' : 'No'}</td><td class="num">${money(b.amount)}</td><td>${paid ? '<span class="tag ok">paid</span>' : '<span class="tag warn">due</span>'}</td><td><button class="btn small" data-bill="${b.id}">${paid ? 'Mark unpaid' : 'Mark paid'}</button></td></tr>`; }).join('')}
  </tbody></table>
  <p><strong>${money(total - paidTotal)}</strong> still to pay this month.</p></section>
  <section class="card"><h2>Never miss one again</h2><p>Seven of the nine bills are on autopay, dated for the day after payday. The two that are not — water and piano lessons — are the ones that used to slip, so they sit on the fridge list and on this page. A bill paid late costs a fee and a credit mark; a bill on autopay costs nothing to remember.</p></section>`;
}

function viewGuide() {
  return `<section class="card intro"><h1>Guide — how the Alvarez household budgets</h1><p>Everything on this site, explained in plain words. No jargon, no selling: this is the method the family actually follows.</p></section>
  <section class="grid-2">
    <div class="card"><h2>1 · Pay yourself first</h2><p>On payday, ${money(1690)} moves to savings before anything is spent: ${money(700)} to the emergency fund, ${money(370)} to the car, ${money(320)} to the holiday, ${money(300)} to college. Money that never sits in the spending account never gets spent by accident.</p></div>
    <div class="card"><h2>2 · The 50/30/20 rule</h2><p>Needs 50%, wants 30%, savings 20%. This household’s plan is ${money(4225)} / ${money(2535)} / ${money(1690)} on ${money(8450)}. It is a compass, not a law: in a month with a car repair, savings bend and needs win.</p></div>
    <div class="card"><h2>3 · Write it down the same day</h2><p>Every purchase goes in the <a href="#/expenses">ledger</a> the day it happens. A budget you check once a month is a history lesson; a budget you check on Sundays is a steering wheel.</p></div>
    <div class="card"><h2>4 · One number to watch</h2><p>“Left to spend” on the <a href="#/">overview</a>. If it is above zero on the 26th, the month is won. If it is below zero, the next want waits — the need does not.</p></div>
    <div class="card"><h2>5 · Goals in order</h2><p>Emergency fund, then the car, then the holiday and college. See the <a href="#/goals">goals page</a> for the finish dates at the current saving rate.</p></div>
    <div class="card"><h2>6 · Bills on autopay</h2><p>Seven of nine bills pay themselves the day after payday. The two that cannot be automated live on the <a href="#/bills">bills page</a> until they are ticked off.</p></div>
  </section>
  <section class="card"><h2>Questions families ask</h2>
    <h3>We spent more than we earned. What now?</h3><p>First, find the leak in the <a href="#/charts">charts</a> — it is usually dining out or groceries, not rent. Then move money between buckets for this month only, and put the fix in next month’s plan.</p>
    <h3>Should we pay off debt or save first?</h3><p>Keep a $1,000 starter emergency fund, then attack the highest-interest debt, then build the fund to six months of needs. This household has no card debt left — the last card was cleared in March 2026.</p>
    <h3>How much should groceries cost?</h3><p>This household spends about ${money(700)} a month for four people, cooking at home five nights a week. A weekly shop, a list, and no shopping hungry: those three habits are worth about $80 a month here.</p>
    <h3>Is my data sent anywhere?</h3><p>No. The site loads no network requests at all, and anything you type is stored in your own browser’s localStorage. Clear the browser data and it is gone.</p></section>`;
}

const VIEWS = {
  '/': viewOverview, '/planner': viewPlanner, '/expenses': viewExpenses,
  '/goals': viewGoals, '/charts': viewCharts, '/calculators': viewCalculators,
  '/bills': viewBills, '/guide': viewGuide,
};

function calcGoal() {
  const t = Number(document.getElementById('cg-target').value || 0);
  const s = Number(document.getElementById('cg-saved').value || 0);
  const m = Number(document.getElementById('cg-monthly').value || 0);
  const el = document.getElementById('cg-result');
  if (!el) return;
  if (s >= t) { el.textContent = 'Already funded — time to pick the next goal.'; return; }
  if (m <= 0) { el.textContent = 'Enter a monthly amount above $0.'; return; }
  const months = Math.ceil((t - s) / m);
  const finish = new Date(2026, 10 + months, 1);
  el.textContent = `${money(t - s)} to go · ${months} month${months === 1 ? '' : 's'} at ${money(m)} a month · funded around ${finish.toLocaleString('en-US', { month: 'long', year: 'numeric' })}.`;
}
function calcSplit() {
  const inc = Number(document.getElementById('cs-income').value || 0);
  const el = document.getElementById('cs-result');
  if (el) el.textContent = `Needs (50%): ${money(inc * 0.5)} · Wants (30%): ${money(inc * 0.3)} · Savings (20%): ${money(inc * 0.2)}.`;
}
function calcRunway() {
  const saved = Number(document.getElementById('cr-saved').value || 0);
  const needs = Number(document.getElementById('cr-needs').value || 0);
  const el = document.getElementById('cr-result');
  if (!el) return;
  if (needs <= 0) { el.textContent = 'Enter monthly needs above $0.'; return; }
  const months = saved / needs;
  el.textContent = `${money(saved)} covers ${months.toFixed(1)} months of needs. ${months >= 6 ? 'Fully funded — well done.' : months >= 3 ? 'A solid start — keep going to six months.' : 'Below three months — this is the goal to fund first.'}`;
}

function bind() {
  const ms = document.getElementById('month-select');
  if (ms) ms.addEventListener('change', (e) => { state.month = e.target.value; render(); });
  const pf = document.getElementById('planner-form');
  if (pf) {
    pf.addEventListener('input', (e) => {
      const id = e.target.dataset?.budget;
      if (id) { state.budgets[id] = Number(e.target.value || 0); renderPlannerTotals(id); }
    });
    pf.addEventListener('submit', (e) => { e.preventDefault(); saveState(); document.getElementById('plan-saved').textContent = 'Saved ✓'; });
    document.getElementById('reset-plan').addEventListener('click', () => { state.budgets = {}; saveState(); render(); });
  }
  const ef = document.getElementById('expense-form');
  if (ef) {
    ef.addEventListener('submit', (e) => {
      e.preventDefault();
      const row = {
        id: state.editingId || ('u' + Date.now()),
        date: document.getElementById('f-date').value,
        kind: 'expense',
        category: document.getElementById('f-cat').value,
        payee: document.getElementById('f-payee').value.trim(),
        amount: Number(document.getElementById('f-amount').value),
        note: document.getElementById('f-note').value.trim(),
      };
      if (state.editingId) {
        const base = TRANSACTIONS.find((t) => t.id === state.editingId);
        if (base) state.edited[state.editingId] = row;
        else { const i = state.added.findIndex((t) => t.id === state.editingId); if (i >= 0) state.added[i] = row; }
        state.editingId = null;
      } else state.added.push(row);
      saveState(); render();
    });
    const cancel = document.getElementById('cancel-edit');
    if (cancel) cancel.addEventListener('click', () => { state.editingId = null; render(); });
  }
  const fc = document.getElementById('filter-cat');
  if (fc) fc.addEventListener('change', (e) => { state.catFilter = e.target.value; render(); });
  const fs = document.getElementById('filter-search');
  if (fs) fs.addEventListener('input', (e) => { state.search = e.target.value; renderExpensesListOnly(); });
  document.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => { state.editingId = b.dataset.edit; render(); window.scrollTo(0, 0); }));
  document.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
    if (TRANSACTIONS.some((t) => t.id === b.dataset.del)) state.deleted.push(b.dataset.del);
    else state.added = state.added.filter((t) => t.id !== b.dataset.del);
    saveState(); render();
  }));
  document.querySelectorAll('.goal-form').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number(f.querySelector('input').value || 0);
    if (amount > 0) { state.goalExtra[f.dataset.goal] = (state.goalExtra[f.dataset.goal] || 0) + amount; saveState(); render(); }
  }));
  document.querySelectorAll('[data-bill]').forEach((b) => b.addEventListener('click', () => {
    const bill = BILLS.find((x) => x.id === b.dataset.bill);
    state.billsPaid[bill.id] = !(state.billsPaid[bill.id] ?? bill.paid);
    saveState(); render();
  }));
  const cg = document.getElementById('calc-goal');
  if (cg) { cg.addEventListener('input', calcGoal); calcGoal(); }
  const cs = document.getElementById('calc-split');
  if (cs) { cs.addEventListener('input', calcSplit); calcSplit(); }
  const cr = document.getElementById('calc-runway');
  if (cr) { cr.addEventListener('input', calcRunway); calcRunway(); }
}

function renderPlannerTotals(activeId) {
  // Re-render the planner page so bucket totals follow the typed budgets,
  // then hand focus back to the box the household was typing in.
  const hash = location.hash || '#/';
  if (hash === '#/planner') {
    const pos = window.scrollY;
    render(false);
    window.scrollTo(0, pos);
    if (activeId) {
      const input = document.querySelector(`[data-budget="${activeId}"]`);
      if (input) { input.focus(); try { const len = input.value.length; input.setSelectionRange(len, len); } catch { /* number inputs take no caret */ } }
    }
  }
}

function renderExpensesListOnly() {
  // Typing in search should not steal focus: re-render only the table.
  render(false);
  const fs = document.getElementById('filter-search');
  if (fs) { fs.focus(); fs.setSelectionRange(fs.value.length, fs.value.length); }
}

function render(scrollTop = true) {
  const path = (location.hash || '#/').replace('#', '') || '/';
  const view = VIEWS[path] || viewOverview;
  app.innerHTML = header() + '<main>' + view() + '</main>' + footer();
  bind();
  if (scrollTop) window.scrollTo(0, 0);
}

function footer() {
  return `<footer class="site-footer"><p><strong>Maple Ledger</strong> — a household budget site for the Alvarez family, Portland. All figures are the family’s example budget for 2026; change any number and the site follows it. No account, no network, no tracking: your numbers stay in your browser.</p><p><a href="#/">Overview</a> · <a href="#/planner">Planner</a> · <a href="#/expenses">Expenses</a> · <a href="#/goals">Goals</a> · <a href="#/charts">Charts</a> · <a href="#/calculators">Calculators</a> · <a href="#/bills">Bills</a> · <a href="#/guide">Guide</a></p></footer>`;
}

window.addEventListener('hashchange', () => render());
render();
