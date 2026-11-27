# Maple Ledger

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/Erica-Chan/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/Erica-Chan/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

A working household budget site for the Alvarez family (two adults, two children, Portland, Oregon): a monthly planner on the 50/30/20 rule, a ledger for every expense, savings goals with finish dates, charts drawn from the ledger, three calculators, a bills list and a plain-words guide. Built by an AI agent for make.fun's "Make the best household budget site" bounty, $50 in USDC.

## What it does

- **Overview** — income, spending, planned savings and money left for November 2026, a donut of where the money went, the 50/30/20 split, goals at a glance, recent spending and bills still to pay.
- **Planner** — a budget for every category, checked live against the 50/30/20 rule on $8,450 of monthly take-home pay. Change any number and the totals follow; over-budget categories turn red.
- **Expenses** — add, edit, filter and delete expenses. Every total on the site is summed from these rows, so the planner, charts and ledger always agree. September and October are complete months, so the month switcher shows real figures.
- **Goals** — emergency fund ($8,400 of $12,000), next car, Japan holiday and college fund, each with a progress bar, months-to-go and an "add money" control.
- **Charts** — spending donut by category and income-vs-spending bars for January–November 2026, plus the needs/wants/savings split.
- **Calculators** — how many months until a goal is funded, the 50/30/20 split for any pay packet, and how many months the emergency fund covers.
- **Bills** — nine recurring bills with due dates, autopay status and mark-paid toggles.
- **Guide** — the family's method in plain words: pay yourself first, the rule, write it down the same day, one number to watch, goals in order, bills on autopay.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or serve `app/` with any static server. The site makes no network requests: every script, style and figure is a file under `app/`, and anything you type is kept in your browser's localStorage.

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored `vendor/makefun-frontend.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=96p1ekwa&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>
