import { formatPkr, type SolarEstimate } from "../lib/calc";

interface ResultsPanelProps {
  estimate: SolarEstimate;
}

/**
 * Renders the recommendation produced by {@link calculateEstimate}.
 * Shows a prompt to enter a bill when there is nothing to estimate yet.
 */
export default function ResultsPanel({ estimate }: ResultsPanelProps) {
  if (!estimate.isValid) {
    return (
      <div className="results results-empty" aria-live="polite">
        <h2>Your estimate</h2>
        <p>
          Move the slider or type your average monthly bill and your
          recommended system size, cost and savings will appear here.
        </p>
      </div>
    );
  }

  const stats: Array<{ label: string; value: string; hint: string }> = [
    {
      label: "Recommended system",
      value: `${estimate.systemKw} kW`,
      hint: `${estimate.panelCount} panels · ~${estimate.monthlyGenerationUnits} units/month`,
    },
    {
      label: "Estimated monthly use",
      value: `${estimate.estimatedUnits} units`,
      hint: "Based on your bill at the average tariff",
    },
    {
      label: "Estimated cost",
      value: formatPkr(estimate.estimatedCostPkr),
      hint: "Complete installed on-grid system",
    },
    {
      label: "Monthly savings",
      value: formatPkr(estimate.monthlySavingsPkr),
      hint: `${formatPkr(estimate.yearlySavingsPkr)} per year`,
    },
  ];

  return (
    <div className="results" aria-live="polite">
      <h2>Your estimate</h2>
      <div className="stats-grid">
        {stats.map((stat) => (
          <div className="stat" key={stat.label}>
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-hint">{stat.hint}</span>
          </div>
        ))}
      </div>
      {estimate.paybackYears !== null && (
        <p className="payback">
          At this rate the system pays for itself in about{" "}
          <strong>{estimate.paybackYears} years</strong> — the panels are
          typically warranted for 25 years.
        </p>
      )}
      <p className="results-note">
        Estimates use an average tariff of PKR 48/unit and roughly 120 units
        generated per kW per month. A site survey confirms the final design
        and price.
      </p>
    </div>
  );
}
