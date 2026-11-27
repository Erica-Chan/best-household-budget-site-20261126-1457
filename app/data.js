// Maple Ledger — the Alvarez household's real example figures.
// One household, two adults and two children, living in Portland, Oregon.
// All money is US dollars. November 2026 is the current month (to 26 Nov);
// October and September are complete months, so the month switcher has
// real figures behind it instead of the same numbers relabelled.
export const HOUSEHOLD = {
  name: 'The Alvarez household',
  members: 'Maya (teacher) · Tom (electrician) · Sofia, 9 · Leo, 6',
  city: 'Portland, Oregon',
  month: '2026-11',
  currency: 'USD',
};

// Budget per category, per month. bucket: needs / wants / savings —
// the three buckets of the 50/30/20 rule the planner is built on.
export const CATEGORIES = [
  { id: 'housing', label: 'Housing', bucket: 'needs', budget: 2150, color: '#2f6b4f', icon: '⌂' },
  { id: 'groceries', label: 'Groceries', bucket: 'needs', budget: 720, color: '#4a8c5c', icon: '◍' },
  { id: 'transport', label: 'Transport', bucket: 'needs', budget: 410, color: '#7a9e4b', icon: '➤' },
  { id: 'utilities', label: 'Utilities', bucket: 'needs', budget: 260, color: '#5b8a72', icon: '≋' },
  { id: 'health', label: 'Health', bucket: 'needs', budget: 220, color: '#3e7d8c', icon: '+' },
  { id: 'insurance', label: 'Insurance', bucket: 'needs', budget: 310, color: '#557a8a', icon: '⛨' },
  { id: 'phone', label: 'Phones', bucket: 'needs', budget: 155, color: '#6b8cae', icon: '☏' },
  { id: 'dining', label: 'Dining out', bucket: 'wants', budget: 280, color: '#c98a2e', icon: '🍽' },
  { id: 'fun', label: 'Fun & streaming', bucket: 'wants', budget: 180, color: '#b56a3c', icon: '♪' },
  { id: 'kids', label: 'Kids & school', bucket: 'wants', budget: 380, color: '#a67c52', icon: '✎' },
  { id: 'clothing', label: 'Clothing', bucket: 'wants', budget: 150, color: '#8a6d8b', icon: '◐' },
  { id: 'gifts', label: 'Gifts', bucket: 'wants', budget: 120, color: '#b07d4f', icon: '✿' },
  { id: 'cafes', label: 'Cafés & coffee', bucket: 'wants', budget: 95, color: '#9c7a3f', icon: '☕' },
  { id: 'home', label: 'Home & garden', bucket: 'wants', budget: 110, color: '#7d8c5a', icon: '❀' },
  { id: 'personal', label: 'Personal', bucket: 'wants', budget: 220, color: '#946b54', icon: '✦' },
  { id: 'travel', label: 'Travel', bucket: 'wants', budget: 600, color: '#4f7d6b', icon: '✈' },
  { id: 'hobbies', label: 'Hobbies', bucket: 'wants', budget: 400, color: '#6a8f6a', icon: '⚽' },
  { id: 'emergency', label: 'Emergency fund', bucket: 'savings', budget: 700, color: '#2f6b4f', icon: '⬢' },
  { id: 'vacation', label: 'Vacation fund', bucket: 'savings', budget: 320, color: '#3e7d8c', icon: '☀' },
  { id: 'car', label: 'Next car', bucket: 'savings', budget: 370, color: '#557a8a', icon: '▣' },
  { id: 'college', label: 'College fund', bucket: 'savings', budget: 300, color: '#4a6b7d', icon: '🎓' },
];

export const BUCKETS = {
  needs: { label: 'Needs', target: 50, blurb: 'Rent, food, transport, bills — the things the household cannot skip.' },
  wants: { label: 'Wants', target: 30, blurb: 'Eating out, fun, travel, hobbies — the things that make life good, kept in bounds.' },
  savings: { label: 'Savings', target: 20, blurb: 'Emergency fund first, then the car, the holiday and college.' },
};

// Every transaction the ledger holds. type income is money in; expense is
// money out. Spent totals on every page are summed from these rows, never
// typed in twice, so the planner, the charts and the ledger always agree.
export const TRANSACTIONS = [
  // ---- November 2026 (to 26 Nov) ----
  { id: 'n01', date: '2026-11-01', kind: 'income', category: null, payee: 'Maya — school district salary', amount: 5200, note: 'Net pay, 1 Nov' },
  { id: 'n02', date: '2026-11-01', kind: 'expense', category: 'housing', payee: 'Maple Court Apartments — rent', amount: 2150, note: 'Monthly rent, autopay' },
  { id: 'n03', date: '2026-11-02', kind: 'expense', category: 'groceries', payee: 'Fred Meyer — weekly shop', amount: 184, note: 'Groceries for the week' },
  { id: 'n04', date: '2026-11-03', kind: 'expense', category: 'transport', payee: 'Shell — fuel', amount: 64, note: 'Tom’s work van' },
  { id: 'n05', date: '2026-11-04', kind: 'expense', category: 'dining', payee: 'Bamboo Garden — takeaway', amount: 58, note: 'Tuesday dinner, no cooking' },
  { id: 'n06', date: '2026-11-06', kind: 'expense', category: 'kids', payee: 'Sofia — piano lessons', amount: 120, note: 'November lessons' },
  { id: 'n07', date: '2026-11-07', kind: 'expense', category: 'groceries', payee: 'New Seasons Market', amount: 156, note: 'Weekly shop + Leo’s lunchbox' },
  { id: 'n08', date: '2026-11-08', kind: 'expense', category: 'utilities', payee: 'Portland General Electric', amount: 118, note: 'October electricity' },
  { id: 'n09', date: '2026-11-09', kind: 'expense', category: 'fun', payee: 'Cinema — family film night', amount: 46, note: 'Tickets + popcorn' },
  { id: 'n10', date: '2026-11-10', kind: 'expense', category: 'transport', payee: 'TriMet — monthly passes', amount: 200, note: 'Two adult passes' },
  { id: 'n11', date: '2026-11-11', kind: 'expense', category: 'health', payee: 'CVS Pharmacy', amount: 42, note: 'Prescriptions' },
  { id: 'n12', date: '2026-11-12', kind: 'expense', category: 'groceries', payee: 'Costco — bulk shop', amount: 212, note: 'Rice, chicken, paper goods' },
  { id: 'n13', date: '2026-11-13', kind: 'income', category: null, payee: 'Tom — weekend wiring jobs', amount: 400, note: 'Side work, cash' },
  { id: 'n14', date: '2026-11-14', kind: 'expense', category: 'dining', payee: 'Tasty n Alder — date night', amount: 86, note: 'Maya & Tom, babysitter $40' },
  { id: 'n15', date: '2026-11-15', kind: 'income', category: null, payee: 'Tom — electrician salary', amount: 2850, note: 'Net pay, 15 Nov' },
  { id: 'n16', date: '2026-11-15', kind: 'expense', category: 'insurance', payee: 'State Farm — home + auto', amount: 310, note: 'Monthly premium' },
  { id: 'n17', date: '2026-11-16', kind: 'expense', category: 'phone', payee: 'T-Mobile — family plan', amount: 155, note: 'Four lines' },
  { id: 'n18', date: '2026-11-17', kind: 'expense', category: 'groceries', payee: 'Fred Meyer — weekly shop', amount: 148, note: 'Thanksgiving prep started' },
  { id: 'n19', date: '2026-11-18', kind: 'expense', category: 'kids', payee: 'Leo — soccer fees', amount: 85, note: 'Winter league signup' },
  { id: 'n20', date: '2026-11-19', kind: 'expense', category: 'cafes', payee: 'Stumptown Coffee', amount: 24, note: 'Two lattes' },
  { id: 'n21', date: '2026-11-20', kind: 'expense', category: 'clothing', payee: 'Old Navy — winter coats', amount: 98, note: 'Coats for Sofia & Leo' },
  { id: 'n22', date: '2026-11-21', kind: 'expense', category: 'dining', payee: 'Poke Mon — lunch', amount: 52, note: 'Saturday lunch out' },
  { id: 'n23', date: '2026-11-22', kind: 'expense', category: 'home', payee: 'Home Depot — garden tools', amount: 64, note: 'Rake + bulbs' },
  { id: 'n24', date: '2026-11-23', kind: 'expense', category: 'utilities', payee: 'NW Natural — gas', amount: 96, note: 'Heating, November' },
  { id: 'n25', date: '2026-11-24', kind: 'expense', category: 'health', payee: 'Kaiser — dentist copay', amount: 60, note: 'Leo’s checkup' },
  { id: 'n26', date: '2026-11-25', kind: 'expense', category: 'gifts', payee: 'Powell’s Books — gifts', amount: 48, note: 'Birthday gift for Grandma' },
  { id: 'n27', date: '2026-11-26', kind: 'expense', category: 'groceries', payee: 'Fred Meyer — Thanksgiving shop', amount: 132, note: 'Turkey + trimmings' },
  { id: 'n28', date: '2026-11-26', kind: 'expense', category: 'fun', payee: 'Netflix + Spotify', amount: 32, note: 'Monthly streaming' },
  // ---- October 2026 (complete) ----
  { id: 'o01', date: '2026-10-01', kind: 'income', category: null, payee: 'Maya — school district salary', amount: 5200, note: 'Net pay, 1 Oct' },
  { id: 'o02', date: '2026-10-01', kind: 'expense', category: 'housing', payee: 'Maple Court Apartments — rent', amount: 2150, note: 'Monthly rent, autopay' },
  { id: 'o03', date: '2026-10-05', kind: 'expense', category: 'groceries', payee: 'Fred Meyer — weekly shop', amount: 176, note: '' },
  { id: 'o04', date: '2026-10-09', kind: 'expense', category: 'groceries', payee: 'New Seasons Market', amount: 164, note: '' },
  { id: 'o05', date: '2026-10-12', kind: 'expense', category: 'groceries', payee: 'Costco — bulk shop', amount: 198, note: '' },
  { id: 'o06', date: '2026-10-16', kind: 'expense', category: 'groceries', payee: 'Fred Meyer — weekly shop', amount: 158, note: '' },
  { id: 'o07', date: '2026-10-15', kind: 'income', category: null, payee: 'Tom — electrician salary', amount: 2850, note: 'Net pay, 15 Oct' },
  { id: 'o08', date: '2026-10-15', kind: 'expense', category: 'insurance', payee: 'State Farm — home + auto', amount: 310, note: '' },
  { id: 'o09', date: '2026-10-16', kind: 'expense', category: 'phone', payee: 'T-Mobile — family plan', amount: 155, note: '' },
  { id: 'o10', date: '2026-10-08', kind: 'expense', category: 'transport', payee: 'Shell — fuel', amount: 72, note: '' },
  { id: 'o11', date: '2026-10-20', kind: 'expense', category: 'transport', payee: 'TriMet — monthly passes', amount: 200, note: '' },
  { id: 'o12', date: '2026-10-07', kind: 'expense', category: 'dining', payee: 'Bamboo Garden — takeaway', amount: 61, note: '' },
  { id: 'o13', date: '2026-10-21', kind: 'expense', category: 'dining', payee: 'Tasty n Alder — date night', amount: 92, note: '' },
  { id: 'o14', date: '2026-10-25', kind: 'expense', category: 'dining', payee: 'Poke Mon — lunch', amount: 49, note: '' },
  { id: 'o15', date: '2026-10-10', kind: 'expense', category: 'utilities', payee: 'Portland General Electric', amount: 124, note: '' },
  { id: 'o16', date: '2026-10-24', kind: 'expense', category: 'utilities', payee: 'NW Natural — gas', amount: 88, note: '' },
  { id: 'o17', date: '2026-10-06', kind: 'expense', category: 'kids', payee: 'Sofia — piano lessons', amount: 120, note: '' },
  { id: 'o18', date: '2026-10-18', kind: 'expense', category: 'kids', payee: 'Leo — soccer fees', amount: 65, note: '' },
  { id: 'o19', date: '2026-10-14', kind: 'expense', category: 'health', payee: 'CVS Pharmacy', amount: 38, note: '' },
  { id: 'o20', date: '2026-10-28', kind: 'expense', category: 'health', payee: 'Kaiser — dentist copay', amount: 55, note: '' },
  { id: 'o21', date: '2026-10-31', kind: 'expense', category: 'fun', payee: 'Halloween — costumes', amount: 74, note: 'Sofia & Leo costumes' },
  { id: 'o22', date: '2026-10-26', kind: 'expense', category: 'fun', payee: 'Netflix + Spotify', amount: 32, note: '' },
  { id: 'o23', date: '2026-10-19', kind: 'expense', category: 'clothing', payee: 'Old Navy — school clothes', amount: 112, note: '' },
  { id: 'o24', date: '2026-10-22', kind: 'expense', category: 'cafes', payee: 'Stumptown Coffee', amount: 31, note: '' },
  { id: 'o25', date: '2026-10-30', kind: 'expense', category: 'gifts', payee: 'Powell’s Books — gifts', amount: 36, note: '' },
  { id: 'o26', date: '2026-10-13', kind: 'income', category: null, payee: 'Tom — weekend wiring jobs', amount: 350, note: 'Side work, cash' },
  // ---- September 2026 (complete) ----
  { id: 's01', date: '2026-09-01', kind: 'income', category: null, payee: 'Maya — school district salary', amount: 5200, note: 'Net pay, 1 Sep' },
  { id: 's02', date: '2026-09-01', kind: 'expense', category: 'housing', payee: 'Maple Court Apartments — rent', amount: 2150, note: 'Monthly rent, autopay' },
  { id: 's03', date: '2026-09-04', kind: 'expense', category: 'groceries', payee: 'Fred Meyer — weekly shop', amount: 169, note: '' },
  { id: 's04', date: '2026-09-11', kind: 'expense', category: 'groceries', payee: 'New Seasons Market', amount: 171, note: '' },
  { id: 's05', date: '2026-09-18', kind: 'expense', category: 'groceries', payee: 'Costco — bulk shop', amount: 205, note: '' },
  { id: 's06', date: '2026-09-25', kind: 'expense', category: 'groceries', payee: 'Fred Meyer — weekly shop', amount: 147, note: '' },
  { id: 's07', date: '2026-09-15', kind: 'income', category: null, payee: 'Tom — electrician salary', amount: 2850, note: 'Net pay, 15 Sep' },
  { id: 's08', date: '2026-09-15', kind: 'expense', category: 'insurance', payee: 'State Farm — home + auto', amount: 310, note: '' },
  { id: 's09', date: '2026-09-16', kind: 'expense', category: 'phone', payee: 'T-Mobile — family plan', amount: 155, note: '' },
  { id: 's10', date: '2026-09-08', kind: 'expense', category: 'transport', payee: 'Shell — fuel', amount: 81, note: '' },
  { id: 's11', date: '2026-09-20', kind: 'expense', category: 'transport', payee: 'TriMet — monthly passes', amount: 200, note: '' },
  { id: 's12', date: '2026-09-06', kind: 'expense', category: 'dining', payee: 'Bamboo Garden — takeaway', amount: 54, note: '' },
  { id: 's13', date: '2026-09-19', kind: 'expense', category: 'dining', payee: 'Tasty n Alder — date night', amount: 78, note: '' },
  { id: 's14', date: '2026-09-10', kind: 'expense', category: 'utilities', payee: 'Portland General Electric', amount: 131, note: '' },
  { id: 's15', date: '2026-09-24', kind: 'expense', category: 'utilities', payee: 'NW Natural — gas', amount: 79, note: '' },
  { id: 's16', date: '2026-09-07', kind: 'expense', category: 'kids', payee: 'Sofia — piano lessons', amount: 120, note: '' },
  { id: 's17', date: '2026-09-13', kind: 'expense', category: 'kids', payee: 'School supplies — Target', amount: 96, note: 'Back to school' },
  { id: 's18', date: '2026-09-14', kind: 'expense', category: 'health', payee: 'CVS Pharmacy', amount: 44, note: '' },
  { id: 's19', date: '2026-09-21', kind: 'expense', category: 'fun', payee: 'Oregon Zoo — family day', amount: 68, note: 'Tickets' },
  { id: 's20', date: '2026-09-26', kind: 'expense', category: 'fun', payee: 'Netflix + Spotify', amount: 32, note: '' },
  { id: 's21', date: '2026-09-17', kind: 'expense', category: 'clothing', payee: 'Old Navy — school clothes', amount: 134, note: '' },
];

// Savings goals. saved is what the family has put aside so far;
// monthly is what the plan puts in each month.
export const GOALS = [
  { id: 'emergency', name: 'Emergency fund', target: 12000, saved: 8400, monthly: 700, note: 'Six months of needs. The first goal — everything else waits until this is full.', color: '#2f6b4f' },
  { id: 'car', name: 'Next car', target: 18000, saved: 6200, monthly: 370, note: 'Replace the 2014 Outback before it gives up. Target: spring 2028.', color: '#557a8a' },
  { id: 'vacation', name: 'Japan holiday', target: 4800, saved: 2150, monthly: 320, note: 'Two weeks in Kyoto and Tokyo, summer 2027. Flights first, then hotels.', color: '#3e7d8c' },
  { id: 'college', name: 'College fund', target: 25000, saved: 9800, monthly: 300, note: 'A 529 for Sofia and Leo, split evenly. Small and steady beats big and late.', color: '#4a6b7d' },
];

// Recurring bills. paid is whether this month's bill is settled.
export const BILLS = [
  { id: 'b1', name: 'Rent — Maple Court Apartments', amount: 2150, due: '1st', autopay: true, paid: true, category: 'housing' },
  { id: 'b2', name: 'Electricity — Portland General', amount: 118, due: '8th', autopay: true, paid: true, category: 'utilities' },
  { id: 'b3', name: 'Gas — NW Natural', amount: 96, due: '24th', autopay: true, paid: true, category: 'utilities' },
  { id: 'b4', name: 'Home + auto insurance — State Farm', amount: 310, due: '15th', autopay: true, paid: true, category: 'insurance' },
  { id: 'b5', name: 'Phones — T-Mobile family plan', amount: 155, due: '16th', autopay: true, paid: true, category: 'phone' },
  { id: 'b6', name: 'Internet — Xfinity', amount: 89, due: '20th', autopay: true, paid: false, category: 'utilities' },
  { id: 'b7', name: 'Streaming — Netflix + Spotify', amount: 32, due: '26th', autopay: true, paid: true, category: 'fun' },
  { id: 'b8', name: 'Water — City of Portland', amount: 74, due: '28th', autopay: false, paid: false, category: 'utilities' },
  { id: 'b9', name: 'Piano lessons — Sofia', amount: 120, due: '6th', autopay: false, paid: true, category: 'kids' },
];

// Monthly totals for the bar chart, January to November 2026.
// Spent is everything out except transfers into savings goals.
export const MONTHLY = [
  { month: 'Jan', income: 8050, spent: 4610 },
  { month: 'Feb', income: 8050, spent: 4480 },
  { month: 'Mar', income: 8450, spent: 4720 },
  { month: 'Apr', income: 8050, spent: 4550 },
  { month: 'May', income: 8450, spent: 4790 },
  { month: 'Jun', income: 8050, spent: 4680 },
  { month: 'Jul', income: 8450, spent: 4830 },
  { month: 'Aug', income: 8050, spent: 4590 },
  { month: 'Sep', income: 8050, spent: 4424 },
  { month: 'Oct', income: 8400, spent: 4560 },
  { month: 'Nov', income: 8450, spent: 4740 },
];

export const MONTH_LABELS = {
  '2026-09': 'September 2026',
  '2026-10': 'October 2026',
  '2026-11': 'November 2026',
};
