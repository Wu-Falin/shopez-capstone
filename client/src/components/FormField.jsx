/**
 * Label + input pair used by every form in the app.
 * Pass as="textarea" or as="select" for other field types.
 */
export default function FormField({ label, id, as = 'input', children, hint, ...props }) {
  const Control = as;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Control id={id} name={id} {...props}>
        {children}
      </Control>
      {hint && <small className="field-hint">{hint}</small>}
    </div>
  );
}
