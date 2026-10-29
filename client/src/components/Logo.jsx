/** The ShopEZ wordmark with a small price-tag icon. */
export default function Logo() {
  return (
    <span className="logo">
      <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M4 16 13 6h15v20H13z" fill="#FFC93C" stroke="#14213D" strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="13.5" cy="16" r="2.4" fill="#14213D" />
      </svg>
      <span className="logo-text">ShopEZ</span>
    </span>
  );
}
