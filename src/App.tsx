import { useMemo, useState } from "react";
import BillSlider from "./components/BillSlider";
import QuoteForm from "./components/QuoteForm";
import ResultsPanel from "./components/ResultsPanel";
import { calculateEstimate } from "./lib/calc";

export default function App() {
  const [bill, setBill] = useState(15_000);
  const estimate = useMemo(() => calculateEstimate(bill), [bill]);

  return (
    <div className="page">
      <header className="site-header">
        <div className="wrap header-in">
          <span className="brand">Solar Calculator</span>
          <span className="header-note">Pakistan · On-grid systems</span>
        </div>
      </header>

      <main className="wrap">
        <section className="hero">
          <p className="eyebrow">Free estimate · No sign-up</p>
          <h1>What size solar system does your home actually need?</h1>
          <p className="hero-sub">
            Start from the one number you already know — your monthly
            electricity bill — and get a realistic system size, the number of
            panels, an installed cost in PKR and what you would save every
            month.
          </p>
        </section>

        <section className="calculator" aria-label="Solar calculator">
          <BillSlider bill={bill} onChange={setBill} />
          <ResultsPanel estimate={estimate} />
        </section>

        <section className="how" aria-label="How the estimate works">
          <h2>How the estimate works</h2>
          <ol className="how-grid">
            <li>
              <strong>Bill to units.</strong> Your bill is divided by a blended
              tariff of PKR 48 per unit to estimate your monthly consumption.
            </li>
            <li>
              <strong>Units to system size.</strong> One kW of panels generates
              roughly 120 units a month in Punjab sun, so the system is sized
              to cover your usage and rounded to real inverter sizes.
            </li>
            <li>
              <strong>Size to cost and savings.</strong> Cost uses PKR 145,000
              per installed kW; savings count the energy you actually use
              yourself (90%), never more than your bill.
            </li>
          </ol>
        </section>

        <QuoteForm estimate={estimate} />
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <p>
            Solar Calculator — an estimation tool. Figures are indicative;
            final system design and pricing require a site survey.
          </p>
        </div>
      </footer>
    </div>
  );
}
