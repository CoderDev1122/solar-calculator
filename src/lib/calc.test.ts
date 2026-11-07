import { describe, expect, it } from "vitest";
import {
  calculateEstimate,
  estimatedCostForKw,
  estimateUnitsFromBill,
  formatPkr,
  panelCountForKw,
  recommendedSystemKw,
} from "./calc";

describe("estimateUnitsFromBill", () => {
  it("converts a bill to units at the blended tariff", () => {
    expect(estimateUnitsFromBill(4800)).toBe(100);
    expect(estimateUnitsFromBill(24000)).toBe(500);
  });

  it("returns 0 for zero and negative bills", () => {
    expect(estimateUnitsFromBill(0)).toBe(0);
    expect(estimateUnitsFromBill(-5000)).toBe(0);
  });
});

describe("recommendedSystemKw", () => {
  it("sizes the system from monthly units", () => {
    expect(recommendedSystemKw(120)).toBe(1);
    expect(recommendedSystemKw(600)).toBe(5);
    expect(recommendedSystemKw(1200)).toBe(10);
  });

  it("rounds to the nearest 0.5 kW and never below 1 kW", () => {
    expect(recommendedSystemKw(400)).toBe(3.5);
    expect(recommendedSystemKw(30)).toBe(1);
  });

  it("returns 0 for no consumption", () => {
    expect(recommendedSystemKw(0)).toBe(0);
    expect(recommendedSystemKw(-10)).toBe(0);
  });
});

describe("panelCountForKw", () => {
  it("rounds up to whole 585 W panels", () => {
    expect(panelCountForKw(1)).toBe(2);
    expect(panelCountForKw(5)).toBe(9);
    expect(panelCountForKw(10)).toBe(18);
    expect(panelCountForKw(0)).toBe(0);
  });
});

describe("estimatedCostForKw", () => {
  it("multiplies by the per-kW installed cost", () => {
    expect(estimatedCostForKw(1)).toBe(145_000);
    expect(estimatedCostForKw(5)).toBe(725_000);
    expect(estimatedCostForKw(0)).toBe(0);
  });
});

describe("calculateEstimate", () => {
  it("handles a small household bill", () => {
    const est = calculateEstimate(3000);
    expect(est.isValid).toBe(true);
    expect(est.estimatedUnits).toBe(63);
    expect(est.systemKw).toBe(1);
    expect(est.panelCount).toBe(2);
    expect(est.estimatedCostPkr).toBe(145_000);
    // Savings can never exceed the bill.
    expect(est.monthlySavingsPkr).toBeLessThanOrEqual(3000);
    expect(est.paybackYears).not.toBeNull();
  });

  it("handles a medium household bill", () => {
    const est = calculateEstimate(15000);
    expect(est.estimatedUnits).toBe(313);
    expect(est.systemKw).toBe(2.5);
    expect(est.panelCount).toBe(5);
    expect(est.estimatedCostPkr).toBe(362_500);
    expect(est.monthlySavingsPkr).toBe(12960);
    expect(est.yearlySavingsPkr).toBe(12960 * 12);
    expect(est.paybackYears).toBe(2.3);
  });

  it("handles a large household bill", () => {
    const est = calculateEstimate(60000);
    expect(est.estimatedUnits).toBe(1250);
    expect(est.systemKw).toBe(10.5);
    expect(est.panelCount).toBe(18);
    expect(est.estimatedCostPkr).toBe(1_522_500);
    expect(est.monthlySavingsPkr).toBeLessThanOrEqual(60000);
  });

  it("returns an invalid zeroed estimate for a zero bill", () => {
    const est = calculateEstimate(0);
    expect(est.isValid).toBe(false);
    expect(est.systemKw).toBe(0);
    expect(est.panelCount).toBe(0);
    expect(est.estimatedCostPkr).toBe(0);
    expect(est.paybackYears).toBeNull();
  });

  it("returns an invalid zeroed estimate for a negative bill", () => {
    const est = calculateEstimate(-12000);
    expect(est.isValid).toBe(false);
    expect(est.monthlyBillPkr).toBe(0);
    expect(est.monthlySavingsPkr).toBe(0);
  });

  it("treats NaN as invalid input", () => {
    expect(calculateEstimate(Number.NaN).isValid).toBe(false);
  });
});

describe("formatPkr", () => {
  it("formats amounts with separators", () => {
    expect(formatPkr(507500)).toBe("PKR 507,500");
    expect(formatPkr(0)).toBe("PKR 0");
  });
});
