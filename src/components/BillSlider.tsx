import { formatPkr } from "../lib/calc";

interface BillSliderProps {
  bill: number;
  onChange: (bill: number) => void;
}

const MIN_BILL = 0;
const MAX_BILL = 100_000;
const STEP = 500;
const PRESETS = [5_000, 15_000, 30_000, 60_000];

/**
 * Controlled slider + numeric input for the monthly electricity bill.
 * Both controls stay in sync and clamp to the supported range.
 */
export default function BillSlider({ bill, onChange }: BillSliderProps) {
  const clamp = (value: number) => {
    if (!Number.isFinite(value)) return MIN_BILL;
    return Math.min(MAX_BILL, Math.max(MIN_BILL, value));
  };

  return (
    <div className="bill-slider">
      <div className="bill-slider-head">
        <label htmlFor="bill-range">Your monthly electricity bill</label>
        <div className="bill-input">
          <span aria-hidden="true">PKR</span>
          <input
            id="bill-input"
            type="number"
            min={MIN_BILL}
            max={MAX_BILL}
            step={STEP}
            value={bill === 0 ? "" : bill}
            placeholder="0"
            onChange={(e) => onChange(clamp(Number(e.target.value)))}
            aria-label="Monthly bill in PKR"
          />
        </div>
      </div>

      <input
        id="bill-range"
        type="range"
        min={MIN_BILL}
        max={MAX_BILL}
        step={STEP}
        value={bill}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
      />
      <div className="bill-scale" aria-hidden="true">
        <span>{formatPkr(MIN_BILL)}</span>
        <span>{formatPkr(MAX_BILL)}</span>
      </div>

      <div className="bill-presets" role="group" aria-label="Typical bills">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={preset === bill ? "preset active" : "preset"}
            onClick={() => onChange(preset)}
          >
            {formatPkr(preset)}
          </button>
        ))}
      </div>
    </div>
  );
}
