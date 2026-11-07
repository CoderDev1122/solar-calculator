# Solar Calculator

A single-page web app that estimates the right solar system for a home in
Pakistan from one input the homeowner already knows: their **monthly
electricity bill**. It recommends a system size, counts the panels, estimates
the installed cost in PKR and the monthly savings, works out a simple payback
period, and finishes with a quote-request form.

Built with **Vite + React + TypeScript**. No CSS framework, no backend.

## What it does

1. The visitor sets their monthly bill with a slider, quick presets, or by
   typing the amount.
2. The results panel updates live: recommended system (kW), panel count,
   estimated monthly consumption, installed cost, monthly/yearly savings and
   payback period.
3. The quote form validates name and phone number, then prepares a
   WhatsApp-ready message containing the estimate — the contact pattern most
   small solar installers actually use.

## Estimation method

The model is intentionally simple and every assumption is a named constant in
[`src/lib/calc.ts`](src/lib/calc.ts), so it can be retuned as prices move:

| Assumption | Value | Basis |
| --- | --- | --- |
| Blended tariff | PKR 48 / unit | Average across domestic slabs incl. taxes & surcharges |
| Generation yield | ~120 units per kW per month | ~4 peak sun hours/day × 30 days (Punjab) |
| Self-consumption | 90% | Share of generated energy that offsets the bill |
| Installed cost | PKR 145,000 / kW | Complete on-grid system: Tier-1 panels, inverter, structure, wiring, net-metering paperwork |
| Panel size | 585 W | Common residential module in the local market |

Steps: bill ÷ tariff → monthly units; units ÷ 120 → kW, rounded to the
nearest 0.5 kW (minimum 1 kW); panels = ceil(kW × 1000 ÷ 585); savings are
the value of self-consumed generation, capped at the bill itself; payback =
cost ÷ yearly savings.

These are estimates, not quotations — a site survey (roof direction, shading,
load profile) always confirms the final design. That limitation is stated in
the UI as well as here.

## Tech stack

- React 18 + TypeScript (strict) with Vite 5
- Vitest for unit tests
- Plain CSS with custom properties — responsive, no framework

## Run it

```bash
npm install
npm run dev        # start the dev server
npm test           # run the unit tests (vitest)
npm run build      # type-check and build for production
```

## Project structure

```
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src
    ├── main.tsx                  # app entry
    ├── App.tsx                   # page composition
    ├── index.css                 # all styling
    ├── lib
    │   ├── calc.ts               # pure estimation logic + PKR formatting
    │   └── calc.test.ts          # vitest coverage: small/medium/large/edge cases
    └── components
        ├── BillSlider.tsx        # slider + numeric input + presets
        ├── ResultsPanel.tsx      # system size, cost, savings, payback
        └── QuoteForm.tsx         # validated quote request → WhatsApp message
```

The calculation layer is fully decoupled from the UI — `calc.ts` is pure
functions with no React imports, which is what makes it trivially testable
and reusable (e.g. in an installer's admin dashboard).

## Possible next steps

- Slab-aware tariff calculation instead of a blended rate
- Battery / hybrid system option with backup-hours estimate
- Roof-area check (panels × ~2.2 m²) against a visitor's roof size
- Urdu language toggle

---

Part of [Ali Osama's](https://github.com/CoderDev1122) portfolio — front-end
developer specialising in React, Next.js and TypeScript.
