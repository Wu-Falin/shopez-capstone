import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { productApi } from '../api/services';
import { getErrorMessage } from '../api/client';
import { useCart } from '../context/CartContext';
import { MAX_QTY_PER_ITEM } from '../utils/pricing';
import PriceTag from '../components/PriceTag';
import StockNote from '../components/StockNote';
import QuantityStepper from '../components/QuantityStepper';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem, quantityOf } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    productApi
      .get(id)
      .then(setProduct)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Loading product" />;

  if (error || !product) {
    return (
      <div className="container page">
        <Alert type="error">{error || 'Product not found'}</Alert>
        <Link to="/" className="btn btn-secondary">
          Back to shop
        </Link>
      </div>
    );
  }

  const inCart = quantityOf(product._id);
  const canAdd = Math.max(0, Math.min(product.stock, MAX_QTY_PER_ITEM) - inCart);

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setQuantity(1);
  };

  return (
    <div className="container page">
      <Link to="/" className="back-link">
        ← Back to shop
      </Link>

      <div className="detail">
        <div className="detail-image">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="detail-info">
          <p className="product-card-category">{product.category}</p>
          <h1>{product.name}</h1>
          <div className="detail-price">
            <PriceTag value={product.price} size="lg" />
            <StockNote stock={product.stock} />
          </div>
          <p className="detail-description">{product.description}</p>

          {canAdd > 0 ? (
            <div className="detail-actions">
              <QuantityStepper value={quantity} max={canAdd} onChange={setQuantity} />
              <button type="button" className="btn btn-primary" onClick={handleAdd}>
                Add to cart
              </button>
            </div>
          ) : (
            <p className="muted">
              {product.stock === 0 ? 'This product is out of stock.' : 'You already have the maximum in your cart.'}
            </p>
          )}

          {added && (
            <Alert type="success">
              Added to cart. <Link to="/cart">View cart</Link>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
