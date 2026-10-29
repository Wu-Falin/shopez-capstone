/** Short stock message: "In stock", "Only 3 left" or "Out of stock". */
export default function StockNote({ stock }) {
  if (stock === 0) return <span className="stock stock-out">Out of stock</span>;
  if (stock <= 5) return <span className="stock stock-low">Only {stock} left</span>;
  return <span className="stock stock-ok">In stock</span>;
}
