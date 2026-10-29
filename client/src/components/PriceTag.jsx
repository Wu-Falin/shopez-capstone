import { formatPrice } from '../utils/format';

/** A price shown as a yellow shop tag. size: "md" | "lg" */
export default function PriceTag({ value, size = 'md' }) {
  return <span className={`price-tag price-tag-${size}`}>{formatPrice(value)}</span>;
}
