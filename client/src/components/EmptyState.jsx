/** Shown when a list has nothing in it, with an optional action. */
export default function EmptyState({ title, text, action }) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}
