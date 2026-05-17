import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch cart (with populate)
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], total: 0 });
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get("/cart");
      setCart(data.data || data);
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to cart — then re-fetch to get populated product details
  const addToCart = async ({ productId, quantity, size, color }) => {
    try {
      await api.post("/cart", { productId, quantity, size, color });
      await fetchCart();
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
      throw err;
    }
  };

  // Remove item — then re-fetch
  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      await fetchCart();
      toast.success("Item removed");
    } catch (err) {
      toast.error("Failed to remove item");
      throw err;
    }
  };

  // Update quantity — then re-fetch
  const updateQuantity = async (itemId, quantity) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      await fetchCart();
    } catch (err) {
      toast.error("Failed to update quantity");
      throw err;
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      await api.delete("/cart");
      setCart({ items: [], total: 0 });
    } catch (err) {
      console.error("Failed to clear cart", err);
    }
  };

  const itemCount =
    cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
