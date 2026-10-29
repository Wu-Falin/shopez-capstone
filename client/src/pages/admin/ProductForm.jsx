import { useState } from 'react';
import FormField from '../../components/FormField';
import Alert from '../../components/Alert';

const EMPTY = { name: '', category: '', price: '', stock: '', image: '', description: '' };

/**
 * Add / edit form for a product. Used by AdminProducts for both cases.
 * props:
 *   product    - the product to edit, or null to add a new one
 *   categories - list of allowed categories
 *   onSave(data) - async; called with clean data
 *   onCancel()
 */
export default function ProductForm({ product, categories, onSave, onCancel }) {
  const [form, setForm] = useState(() =>
    product
      ? {
          name: product.name,
          category: product.category,
          price: String(product.price),
          stock: String(product.stock),
          image: product.image || '',
          description: product.description,
        }
      : EMPTY
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!form.name.trim() || !form.category || !form.description.trim()) {
      setError('Name, category and description are required.');
      return;
    }
    if (form.price === '' || Number.isNaN(price) || price < 0) {
      setError('Price must be a number of 0 or more.');
      return;
    }
    if (form.stock === '' || !Number.isInteger(stock) || stock < 0) {
      setError('Stock must be a whole number of 0 or more.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        category: form.category,
        price,
        stock,
        image: form.image.trim() || undefined,
        description: form.description.trim(),
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form className="panel product-form" onSubmit={handleSubmit} noValidate>
      <h2>{product ? `Edit “${product.name}”` : 'Add a product'}</h2>
      <div className="form-grid">
        <div className="span-2">
          <FormField label="Name" id="name" value={form.name} onChange={update} required />
        </div>
        <FormField label="Category" id="category" as="select" value={form.category} onChange={update} required>
          <option value="">Choose a category</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </FormField>
        <FormField label="Price (USD)" id="price" type="number" min="0" step="0.01" value={form.price} onChange={update} required />
        <FormField label="Stock" id="stock" type="number" min="0" step="1" value={form.stock} onChange={update} required />
        <FormField
          label="Image URL"
          id="image"
          value={form.image}
          onChange={update}
          placeholder="/images/products/mug.svg or https://…"
          hint="Leave empty to use a placeholder image."
        />
        <div className="span-2">
          <FormField label="Description" id="description" as="textarea" rows="4" value={form.description} onChange={update} required />
        </div>
      </div>
      <Alert type="error">{error}</Alert>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}
