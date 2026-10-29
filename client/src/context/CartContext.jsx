import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readJSON, writeJSON } from '../utils/storage';
import { calcTotals, MAX_QTY_PER_ITEM } from '../utils/pricing';

const CART_STORAGE_KEY = 'shopez_cart';
const CartContext = createContext(null);

// A product can't be added beyond its stock or the per-item limit.
const maxFor = (item) => Math.max(0, Math.min(item.stock ?? MAX_QTY_PER_ITEM, MAX_QTY_PER_ITEM));

/**
 * The shopping cart. It lives in the browser (localStorage), so guests can
 * fill a cart before logging in. The server re-checks stock and prices at checkout.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readJSON(CART_STORAGE_KEY, []));

  useEffect(() => {
    writeJSON(CART_STORAGE_KEY, items);
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((i) => i._id === product._id);
      const snapshot = {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
      };
      if (existing) {
        return current.map((i) =>
          i._id === product._id
            ? { ...i, ...snapshot, quantity: Math.min(i.quantity + quantity, maxFor(snapshot)) }
            : i
        );
      }
      return [...current, { ...snapshot, quantity: Math.min(quantity, maxFor(snapshot)) }];
    });
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    setItems((current) =>
      current.map((i) => (i._id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, maxFor(i))) } : i))
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((current) => current.filter((i) => i._id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      totals: calcTotals(items),
      quantityOf: (id) => items.find((i) => i._id === id)?.quantity || 0,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, addItem, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
