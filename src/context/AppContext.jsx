import React, { createContext, useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { getUserProfile, logoutUser } from "../api/authApi";
import { resolveImageUrl } from "../utils/media";

export const AppContext = createContext();

const normalizeProduct = (product) => ({
  ...product,
  image_url: resolveImageUrl(product.image),
});

const normalizeUserOrder = (order) => ({
  ...order,
  product_image_url: resolveImageUrl(order.product_image),
});

const generateCheckoutRef = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `CHK-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [featuredFeedbacks, setFeaturedFeedbacks] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error("Invalid cart state:", err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const clearAuthState = ({ clearCart = false } = {}) => {
    setUser(null);
    setOrders([]);
    setMyOrders([]);
    setFeedbacks([]);
    setAdminStats(null);
    if (clearCart) {
      localStorage.removeItem("cart");
      setCart([]);
    }
  };

  const fetchSession = async () => {
    try {
      const sessionUser = await getUserProfile();
      setUser(sessionUser);
      return sessionUser;
    } catch {
      setUser(null);
      return null;
    }
  };

  const loadProtectedData = async (sessionUser) => {
    if (!sessionUser) return;
    if (sessionUser.role === "admin") {
      await Promise.all([fetchAdminProducts(), fetchOrders(), fetchAdminFeedback(), fetchAdminStats()]);
      return;
    }
    await fetchMyOrders();
  };

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([fetchProducts(), fetchFeaturedFeedback()]);
      const sessionUser = await fetchSession();
      await loadProtectedData(sessionUser);
      setLoading(false);
    };

    initialize();
  }, []);

  useEffect(() => {
    const clearAuthOn401 = () => {
      clearAuthState();
    };
    window.addEventListener("auth:unauthorized", clearAuthOn401);
    return () => window.removeEventListener("auth:unauthorized", clearAuthOn401);
  }, []);

  const login = async () => {
    const sessionUser = await fetchSession();
    await loadProtectedData(sessionUser);
    return sessionUser;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Failed to logout cleanly:", err);
    } finally {
      clearAuthState({ clearCart: true });
    }
  };

  const fetchProducts = async (searchQuery = "") => {
    try {
      const q = searchQuery.trim();
      const res = await api.get("/products", {
        params: q ? { q } : undefined,
      });
      setProducts(res.data.map(normalizeProduct));
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const fetchAdminProducts = async (searchQuery = "") => {
    try {
      const q = searchQuery.trim();
      const res = await api.get("/admin/products", {
        params: q ? { q } : undefined,
      });
      setProducts(res.data.map(normalizeProduct));
    } catch (err) {
      console.error("Failed to fetch admin products:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/admin/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch admin orders:", err);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const res = await api.get("/orders");
      setMyOrders(res.data.map(normalizeUserOrder));
    } catch (err) {
      console.error("Failed to fetch user orders:", err);
    }
  };

  const addProduct = async (product) => {
    try {
      let res;
      if (product.imageFile) {
        const formData = new FormData();
        formData.append("name", product.name);
        formData.append("price", product.price);
        formData.append("grams", product.grams);
        formData.append("description", product.description);
        formData.append("image", product.imageFile);
        res = await api.post("/admin/products/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.post("/admin/products", product);
      }
      setProducts((prev) => [...prev, normalizeProduct(res.data)]);
      return res.data;
    } catch (err) {
      console.error("Failed to add product:", err);
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await api.put(`/admin/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((order) => (order.id === id ? res.data : order)));
    } catch (err) {
      console.error("Failed to update order status:", err);
      throw err;
    }
  };

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateCartQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(item.quantity + delta, 0) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const placeOrdersFromCart = async ({ shippingPhone, shippingAddress, shippingPincode }) => {
    if (!cart.length) return;
    const checkoutRef = generateCheckoutRef();
    await Promise.all(
      cart.map((item) =>
        api.post("/orders", {
          product_id: item.id,
          checkout_ref: checkoutRef,
          grams: item.grams * item.quantity,
          shipping_phone: shippingPhone,
          shipping_address: shippingAddress,
          shipping_pincode: shippingPincode,
        })
      )
    );
    setCart([]);
    await fetchMyOrders();
  };

  const submitFeedback = async ({ orderId, message, rating }) => {
    const payload = { order_id: orderId, message, rating };
    await api.post("/feedback", payload);
    await fetchFeaturedFeedback();
    await fetchMyOrders();
  };

  const fetchAdminFeedback = async () => {
    try {
      const res = await api.get("/admin/feedback");
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Failed to fetch feedbacks:", err);
    }
  };

  const toggleFeedbackFeatured = async (feedbackId, featured) => {
    await api.put(`/admin/feedback/${feedbackId}/feature`, { featured });
    await Promise.all([fetchAdminFeedback(), fetchFeaturedFeedback()]);
  };

  const deleteMyFeedback = async (feedbackId) => {
    await api.delete(`/feedback/${feedbackId}`);
    await Promise.all([fetchMyOrders(), fetchFeaturedFeedback()]);
  };

  const fetchAdminStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setAdminStats(res.data);
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
    }
  };

  const fetchFeaturedFeedback = async () => {
    try {
      const res = await api.get("/feedback/featured");
      setFeaturedFeedbacks(res.data);
    } catch (err) {
      console.error("Failed to fetch featured feedback:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        setCart,
        products,
        setProducts,
        orders,
        myOrders,
        feedbacks,
        featuredFeedbacks,
        adminStats,
        fetchProducts,
        fetchAdminProducts,
        addProduct,
        deleteProduct,
        fetchOrders,
        fetchMyOrders,
        updateOrderStatus,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        placeOrdersFromCart,
        submitFeedback,
        fetchAdminFeedback,
        fetchAdminStats,
        toggleFeedbackFeatured,
        deleteMyFeedback,
        user,
        isAuthenticated,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
