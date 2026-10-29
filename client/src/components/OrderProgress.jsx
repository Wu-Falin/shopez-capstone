const STEPS = ['Placed', 'Shipped', 'Delivered'];

/**
 * Shows where an order is: Placed -> Shipped -> Delivered.
 * A cancelled order shows a single cancelled note instead.
 */
export default function OrderProgress({ status }) {
  if (status === 'Cancelled') {
    return <p className="progress-cancelled">This order was cancelled.</p>;
  }

  const current = STEPS.indexOf(status);

  return (
    <ol className="progress">
      {STEPS.map((step, index) => (
        <li
          key={step}
          className={`progress-step ${index <= current ? 'is-done' : ''} ${index === current ? 'is-current' : ''}`}
        >
          <span className="progress-dot" aria-hidden="true">
            {index + 1}
          </span>
          <span className="progress-label">{step}</span>
        </li>
      ))}
    </ol>
  );
}
