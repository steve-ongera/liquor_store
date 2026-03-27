// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0, item_count: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (e) {}
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const data = await api.addToCart(productId, quantity);
      setCart(data);
      return true;
    } catch (e) { return false; }
    finally { setLoading(false); }
  };

  const updateItem = async (itemId, quantity) => {
    const data = await api.updateCartItem(itemId, quantity);
    setCart(data);
  };

  const removeItem = async (itemId) => {
    const data = await api.removeCartItem(itemId);
    setCart(data);
  };

  const clearCart = async () => {
    const data = await api.clearCart();
    setCart(data);
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);