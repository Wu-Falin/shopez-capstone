import { useEffect, useState } from 'react';
import { productApi } from '../api/services';
import { getErrorMessage } from '../api/client';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A–Z' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Categories for the filter buttons.
  useEffect(() => {
    productApi.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  // Wait until the user stops typing for 300 ms before searching.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load products whenever the search, category or sort changes.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    productApi
      .list({
        search: debouncedSearch || undefined,
        category: category === 'All' ? undefined : category,
        sort,
      })
      .then((list) => active && setProducts(list))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [debouncedSearch, category, sort]);

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <h1>Everything for every day, in one cart.</h1>
            <p>Electronics, fashion, home goods, books and more. Order in a few clicks and follow your delivery.</p>
          </div>
          <ul className="hero-facts">
            <li>
              <strong>Free shipping</strong> on orders over $50
            </li>
            <li>
              <strong>Cash on delivery</strong> available
            </li>
            <li>
              <strong>Track every order</strong> from your account
            </li>
          </ul>
        </div>
      </section>

      <section className="container shop">
        <div className="shop-toolbar">
          <div className="field field-search">
            <label htmlFor="search">Search products</label>
            <input
              id="search"
              type="search"
              placeholder="Try “headphones” or “mug”"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="field field-sort">
            <label htmlFor="sort">Sort by</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="chips" role="group" aria-label="Filter by category">
          {['All', ...categories].map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${category === c ? 'is-active' : ''}`}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <Alert type="error">{error}</Alert>

        {loading ? (
          <Loader label="Loading products" />
        ) : products.length === 0 && !error ? (
          <EmptyState
            title="No products found"
            text={debouncedSearch ? `Nothing matches “${debouncedSearch}” in ${category}.` : `No products in ${category} yet.`}
            action={
              <button type="button" className="btn btn-secondary" onClick={resetFilters}>
                Show all products
              </button>
            }
          />
        ) : (
          <>
            <p className="result-count">
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </p>
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
