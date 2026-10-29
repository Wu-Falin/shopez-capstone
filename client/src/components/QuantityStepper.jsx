/** Minus / number / plus control used on the product page and in the cart. */
export default function QuantityStepper({ value, min = 1, max = 10, onChange, label = 'Quantity' }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease">
        −
      </button>
      <span className="stepper-value" aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase">
        +
      </button>
    </div>
  );
}
