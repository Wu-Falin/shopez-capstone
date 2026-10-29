import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { MAX_QTY_PER_ITEM } from '../utils/pricing';
import PriceTag from './PriceTag';
import StockNote from './StockNote';

export default function ProductCard({ product }) {
  const { addItem, quantityOf } = useCart();
  const inCart = quantityOf(product._id);
  const soldOut = product.stock === 0;
  const atLimit = inCart >= Math.min(product.stock, MAX_QTY_PER_ITEM);

  return (
    <article className="product-card">
      <Link to={`/product/${product._id}`} className="product-card-image">
        <img src={product.image} alt={product.name} loading="lazy" />
      </Link>
      <div className="product-card-body">
        <p className="product-card-category">{product.category}</p>
        <h3 className="product-card-name">
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h3>
        <div className="product-card-meta">
          <PriceTag value={product.price} />
          <StockNote stock={product.stock} />
        </div>
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => addItem(product, 1)}
          disabled={soldOut || atLimit}
        >
          {soldOut ? 'Out of stock' : inCart ? `Add another (${inCart} in cart)` : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
