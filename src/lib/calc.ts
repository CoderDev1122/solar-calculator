/**
 * Solar sizing and cost estimation for homes in Pakistan.
 *
 * The model is deliberately simple and transparent — every assumption is a
 * named constant below so it can be tuned as tariffs and market prices move:
 *
 * - Blended tariff: PKR 48 per unit (kWh), an average across domestic slabs
 *   including taxes and surcharges.
 * - Yield: a 1 kW system generates roughly 120 units per month
 *   (~4 peak sun hours/day × 30 days), a conservative figure for Punjab.
 * - Self-consumption: 90% of generated energy offsets the bill; the rest is
 *   exported or unused, so savings are capped accordingly.
 * - Installed cost: PKR 145,000 per kW for a complete on-grid system
 *   (Tier-1 panels, inverter, structure, wiring and net-metering paperwork).
 * - Panels: 585 W modules, the common residential size in the local market.
 */

export const TARIFF_PER_UNIT_PKR = 48;
export const UNITS_PER_KW_PER_MONTH = 120;
export const SELF_CONSUMPTION_RATIO = 0.9;
export const COST_PER_KW_PKR = 145_000;
export const PANEL_WATTAGE = 585;
export const MIN_SYSTEM_KW = 1;

/** Everything the UI needs to render a recommendation for one bill amount. */
export interface SolarEstimate {
  /** The monthly bill the estimate was calculated from (PKR). */
  monthlyBillPkr: number;
  /** Estimated monthly consumption in units (kWh). */
  estimatedUnits: number;
  /** Recommended system size in kW, rounded to the nearest 0.5 kW. */
  systemKw: number;
  /** Number of panels required at {@link PANEL_WATTAGE} W each. */
  panelCount: number;
  /** Estimated monthly generation of the recommended system (units). */
  monthlyGenerationUnits: number;
  /** Estimated installed cost of the recommended system (PKR). */
  estimatedCostPkr: number;
  /** Estimated monthly saving on the electricity bill (PKR). */
  monthlySavingsPkr: number;
  /** Estimated yearly saving (PKR). */
  yearlySavingsPkr: number;
  /** Simple payback period in years, or null when it cannot be computed. */
  paybackYears: number | null;
  /** True when the input was a positive bill that produced a recommendation. */
  isValid: boolean;
}

const EMPTY_ESTIMATE: SolarEstimate = {
  monthlyBillPkr: 0,
  estimatedUnits: 0,
  systemKw: 0,
  panelCount: 0,
  monthlyGenerationUnits: 0,
  estimatedCostPkr: 0,
  monthlySavingsPkr: 0,
  yearlySavingsPkr: 0,
  paybackYears: null,
  isValid: false,
};

/**
 * Estimate monthly consumption (units / kWh) from a bill amount.
 * Returns 0 for non-positive or non-finite input.
 */
export function estimateUnitsFromBill(monthlyBillPkr: number): number {
  if (!Number.isFinite(monthlyBillPkr) || monthlyBillPkr <= 0) return 0;
  return Math.round(monthlyBillPkr / TARIFF_PER_UNIT_PKR);
}

/**
 * Recommended system size in kW for a given monthly consumption.
 * Rounds to the nearest 0.5 kW (the step residential inverters come in) and
 * never recommends less than {@link MIN_SYSTEM_KW} for a positive load.
 */
export function recommendedSystemKw(monthlyUnits: number): number {
  if (!Number.isFinite(monthlyUnits) || monthlyUnits <= 0) return 0;
  const rawKw = monthlyUnits / UNITS_PER_KW_PER_MONTH;
  const rounded = Math.round(rawKw * 2) / 2;
  return Math.max(MIN_SYSTEM_KW, rounded);
}

/** Number of panels needed for a system of the given size. */
export function panelCountForKw(systemKw: number): number {
  if (!Number.isFinite(systemKw) || systemKw <= 0) return 0;
  return Math.ceil((systemKw * 1000) / PANEL_WATTAGE);
}

/** Estimated installed cost in PKR for a system of the given size. */
export function estimatedCostForKw(systemKw: number): number {
  if (!Number.isFinite(systemKw) || systemKw <= 0) return 0;
  return Math.round(systemKw * COST_PER_KW_PKR);
}

/**
 * Run the full estimation for a monthly electricity bill.
 * Non-positive bills return a zeroed estimate with `isValid: false`.
 */
export function calculateEstimate(monthlyBillPkr: number): SolarEstimate {
  if (!Number.isFinite(monthlyBillPkr) || monthlyBillPkr <= 0) {
    return { ...EMPTY_ESTIMATE, monthlyBillPkr: 0 };
  }

  const estimatedUnits = estimateUnitsFromBill(monthlyBillPkr);
  const systemKw = recommendedSystemKw(estimatedUnits);
  const panelCount = panelCountForKw(systemKw);
  const monthlyGenerationUnits = systemKw * UNITS_PER_KW_PER_MONTH;
  const estimatedCostPkr = estimatedCostForKw(systemKw);

  // Savings are the value of generated energy actually consumed on site,
  // and can never exceed the bill itself.
  const grossSaving = monthlyGenerationUnits * TARIFF_PER_UNIT_PKR;
  const monthlySavingsPkr = Math.round(
    Math.min(monthlyBillPkr, grossSaving * SELF_CONSUMPTION_RATIO),
  );
  const yearlySavingsPkr = monthlySavingsPkr * 12;
  const paybackYears =
    monthlySavingsPkr > 0
      ? Math.round((estimatedCostPkr / yearlySavingsPkr) * 10) / 10
      : null;

  return {
    monthlyBillPkr,
    estimatedUnits,
    systemKw,
    panelCount,
    monthlyGenerationUnits,
    estimatedCostPkr,
    monthlySavingsPkr,
    yearlySavingsPkr,
    paybackYears,
    isValid: true,
  };
}

/** Format a PKR amount with thousands separators, e.g. 507500 -> "PKR 507,500". */
export function formatPkr(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString("en-PK")}`;
}
