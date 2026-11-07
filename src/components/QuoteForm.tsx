import { useState, type FormEvent } from "react";
import { formatPkr, type SolarEstimate } from "../lib/calc";

interface QuoteFormProps {
  estimate: SolarEstimate;
}

interface FormState {
  name: string;
  phone: string;
  city: string;
}

const INITIAL_STATE: FormState = { name: "", phone: "", city: "" };

/**
 * Quote-request form. There is no backend in this demo project, so a
 * successful submit builds a pre-filled WhatsApp message link — the pattern
 * used by most small solar installers — and shows the visitor a summary of
 * exactly what will be sent before they confirm.
 */
export default function QuoteForm({ estimate }: QuoteFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [waLink, setWaLink] = useState<string | null>(null);

  const update =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setWaLink(null);
    };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const phone = form.phone.trim();
    const city = form.city.trim();

    if (!name || !phone) {
      setError("Please add your name and a phone number so we can call you back.");
      return;
    }
    if (!/^\+?[0-9\s-]{10,15}$/.test(phone)) {
      setError("That phone number doesn't look complete — please check it.");
      return;
    }
    setError(null);

    const lines = [
      `Assalam-o-Alaikum, I am ${name}${city ? ` from ${city}` : ""}.`,
      `My monthly electricity bill is about ${formatPkr(estimate.monthlyBillPkr)}.`,
      estimate.isValid
        ? `The calculator recommended a ${estimate.systemKw} kW system (${estimate.panelCount} panels), estimated at ${formatPkr(estimate.estimatedCostPkr)}.`
        : "I would like advice on the right system size for my home.",
      "Please contact me with a detailed quote.",
    ];
    setWaLink(
      `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`,
    );
  };

  return (
    <form className="quote-form" onSubmit={handleSubmit} noValidate>
      <h2>Request a detailed quote</h2>
      <p className="quote-intro">
        Send these details and the estimate above — an installer can then
        confirm the design with a free site survey.
      </p>

      <div className="field">
        <label htmlFor="q-name">Your name</label>
        <input
          id="q-name"
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={update("name")}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="q-phone">Phone / WhatsApp number</label>
        <input
          id="q-phone"
          type="tel"
          autoComplete="tel"
          placeholder="03XX XXXXXXX"
          value={form.phone}
          onChange={update("phone")}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="q-city">City</label>
        <input
          id="q-city"
          type="text"
          autoComplete="address-level2"
          value={form.city}
          onChange={update("city")}
        />
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary">
        Prepare my quote request
      </button>

      {waLink && (
        <div className="quote-ready">
          <p>
            Your request is ready, <strong>{form.name.trim()}</strong>
            {estimate.isValid &&
              ` — for a ${estimate.systemKw} kW system at an estimated ${formatPkr(estimate.estimatedCostPkr)}.`}
          </p>
          <a
            className="btn-whatsapp"
            href={waLink}
            target="_blank"
            rel="noreferrer"
          >
            Send it on WhatsApp
          </a>
        </div>
      )}
    </form>
  );
}
