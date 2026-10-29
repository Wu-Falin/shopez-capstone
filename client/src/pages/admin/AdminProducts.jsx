import { useCallback, useEffect, useState } from 'react';
import { productApi } from '../../api/services';
import { getErrorMessage } from '../../api/client';
import { formatPrice } from '../../utils/format';
import ProductForm from './ProductForm';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  // null = form closed, 'new' = adding, a product object = editing
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    return productApi
      .list({ sort: 'name' })
      .then(setProducts)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    productApi.categories().then(setCategories).catch(() => {});
  }, [load]);

  const handleSave = async (data) => {
    try {
      if (editing === 'new') {
        await productApi.create(data);
        setNotice(`Added “${data.name}”.`);
      } else {
        await productApi.update(editing._id, data);
        setNotice(`Saved changes to “${data.name}”.`);
      }
      setEditing(null);
      await load();
    } catch (err) {
      // ProductForm shows this message under the form.
      throw new Error(getErrorMessage(err));
    }
  };

  const handleDelete = async (product) => {
    setError('');
    try {
      await productApi.remove(product._id);
      setNotice(`Deleted “${product.name}”.`);
      setConfirmId(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="section-head">
        <h2>Products ({products.length})</h2>
        {!editing && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setNotice('');
              setEditing('new');
            }}
          >
            Add product
          </button>
        )}
      </div>

      <Alert type="success">{notice}</Alert>
      <Alert type="error">{error}</Alert>

      {editing && (
        <ProductForm
          key={editing === 'new' ? 'new' : editing._id}
          product={editing === 'new' ? null : editing}
          categories={categories}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading ? (
        <Loader label="Loading products" />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Category</th>
                <th scope="col">Price</th>
                <th scope="col">Stock</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="table-product">
                      <img src={p.image} alt="" />
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td className={p.stock === 0 ? 'stock-out' : p.stock <= 5 ? 'stock-low' : ''}>{p.stock}</td>
                  <td className="table-actions">
                    {confirmId === p._id ? (
                      <>
                        <span>Delete this product?</span>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>
                          Yes, delete
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirmId(null)}>
                          Keep
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setNotice('');
                            setEditing(p);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          Edit
                        </button>
                        <button type="button" className="btn btn-link btn-sm" onClick={() => setConfirmId(p._id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
