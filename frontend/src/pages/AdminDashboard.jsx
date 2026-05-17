import { useState, useEffect } from "react";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const STATUS_COLORS = {
  pending: "bg-yellow-50 text-yellow-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-500",
};
const EMPTY_PRODUCT = {
  name: "",
  price: "",
  category: "",
  description: "",
  stock: "",
  size: "",
  color: "",
  imageUrl: "",
};

export default function AdminDashboard() {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (tab === "products") fetchProducts();
    if (tab === "orders") fetchOrders();
  }, [tab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products");
      setProducts(
        Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : data.products || [],
      );
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders");
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm(EMPTY_PRODUCT);
    setFormErrors({});
    setShowProductModal(true);
  };
  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name || "",
      price: p.price || "",
      category: p.category || "",
      description: p.description || "",
      stock: p.stock || "",
      size: Array.isArray(p.size) ? p.size.join(", ") : p.size || "",
      color: Array.isArray(p.color) ? p.color.join(", ") : p.color || "",
      imageUrl: p.imageUrl || "",
    });
    setFormErrors({});
    setShowProductModal(true);
  };

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!form.price || isNaN(Number(form.price)))
      e.price = "Valid price required";
    if (!form.stock || isNaN(Number(form.stock)))
      e.stock = "Valid stock required";
    if (!form.description.trim()) e.description = "Description required";
    if (!form.imageUrl.trim()) e.imageUrl = "Image URL required";
    if (!form.category.trim()) e.category = "Category required";
    if (!form.size.trim()) e.size = "Size required";
    if (!form.color.trim()) e.color = "Color required";
    return e;
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category.trim().toLowerCase(),
      size: form.size
        ? form.size
            .split(",")
            .map((s) => s.trim().toUpperCase())
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      color: form.color
        ? form.color
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)
        : [],
      imageUrl: form.imageUrl || "",
    };
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product created");
      }
      setShowProductModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      setProducts((p) => p.filter((x) => x._id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    setUpdatingStatus(orderId);
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: data.status || status } : o,
        ),
      );
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-display text-4xl mb-1">Admin Dashboard</h1>
          <p className="text-white/50 font-body text-sm">Manage your store</p>
          {/* Tabs */}
          <div className="flex gap-1 mt-6">
            {[
              { id: "products", label: "Products" },
              { id: "orders", label: "Orders" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-6 py-3 text-sm uppercase tracking-widest font-body transition-all ${tab === t.id ? "bg-gold text-navy" : "text-white/60 hover:text-white"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Products Tab */}
        {tab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-navy">
                {products.length} Products
              </h2>
              <button
                onClick={openCreate}
                className="btn-primary flex items-center gap-2 text-sm uppercase tracking-widest"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Product
              </button>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-white">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Product", "Category", "Price", "Stock", "Actions"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-4 text-xs uppercase tracking-widest text-gray-400 font-body"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map((product) => {
                      const image =
                        product.imageUrl ||
                        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=80&q=60";
                      return (
                        <tr
                          key={product._id}
                          className="hover:bg-gray-50 transition-colors animate-fade-in"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={image}
                                alt={product.name}
                                className="w-12 h-14 object-cover bg-gray-100 flex-shrink-0"
                                onError={(e) => {
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=80&q=60";
                                }}
                              />
                              <span className="font-body font-medium text-navy text-sm line-clamp-2 max-w-[200px]">
                                {product.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="badge bg-navy/10 text-navy text-[10px] capitalize">
                              {product.category || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-body font-semibold text-gold">
                            ${Number(product.price).toFixed(2)}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`font-body text-sm font-medium ${product.stock === 0 ? "text-red-500" : product.stock <= 5 ? "text-yellow-600" : "text-green-600"}`}
                            >
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEdit(product)}
                                className="text-navy hover:text-gold transition-colors p-1.5 hover:bg-gray-100"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(product._id)}
                                disabled={deletingId === product._id}
                                className="text-gray-300 hover:text-red-400 transition-colors p-1.5 hover:bg-red-50"
                              >
                                {deletingId === product._id ? (
                                  <span className="h-4 w-4 border-2 border-red-200 border-t-red-400 rounded-full animate-spin block" />
                                ) : (
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {products.length === 0 && !loading && (
                  <div className="text-center py-16 text-gray-400 font-body">
                    No products yet. Add your first product!
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {tab === "orders" && (
          <div>
            <h2 className="font-display text-2xl text-navy mb-6">
              {orders.length} Orders
            </h2>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order._id} className="bg-white animate-fade-in">
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() =>
                            setExpandedOrder(
                              expandedOrder === order._id ? null : order._id,
                            )
                          }
                          className="text-gray-400 hover:text-navy transition-colors"
                        >
                          <svg
                            className={`w-4 h-4 transition-transform ${expandedOrder === order._id ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        <div>
                          <p className="font-mono text-xs text-gray-400">
                            #{order._id?.slice(-8).toUpperCase()}
                          </p>
                          <p className="font-body text-sm text-navy font-medium">
                            {order.user?.name ||
                              order.user?.email ||
                              "Customer"}
                          </p>
                          <p className="font-body text-xs text-gray-400">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString()
                              : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-gold font-semibold font-body">
                          $
                          {Number(
                            order.totalAmount || order.total || 0,
                          ).toFixed(2)}
                        </span>
                        <select
                          value={order.status || "pending"}
                          onChange={(e) =>
                            handleUpdateStatus(order._id, e.target.value)
                          }
                          disabled={updatingStatus === order._id}
                          className={`text-xs font-body px-3 py-2 border-0 focus:outline-none focus:ring-1 focus:ring-navy ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option
                              key={s}
                              value={s}
                              className="bg-white text-navy"
                            >
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {expandedOrder === order._id && (
                      <div className="border-t border-gray-100 px-5 pb-5 animate-slide-up">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-gray-400 font-body mb-2">
                              Items
                            </p>
                            {order.items?.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 py-1.5"
                              >
                                <span className="font-body text-sm text-navy">
                                  {item.product?.name || item.name}
                                </span>
                                <span className="text-gray-400 text-xs">
                                  × {item.quantity}
                                </span>
                                <span className="text-gold text-xs font-medium ml-auto">
                                  $
                                  {((item.price || 0) * item.quantity).toFixed(
                                    2,
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                          {order.shippingAddress && (
                            <div>
                              <p className="text-xs uppercase tracking-widest text-gray-400 font-body mb-2">
                                Shipping
                              </p>
                              <p className="font-body text-sm text-navy">
                                {order.shippingAddress.street}
                              </p>
                              <p className="font-body text-sm text-navy">
                                {order.shippingAddress.city}
                              </p>
                              <p className="font-body text-xs text-gray-400">
                                {order.shippingAddress.phone}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="text-center py-16 text-gray-400 font-body">
                    No orders yet.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setShowProductModal(false)
          }
        >
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="bg-navy text-white p-6 flex items-center justify-between">
              <h2 className="font-display text-2xl">
                {editingProduct ? "Edit Product" : "New Product"}
              </h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-5">
              {[
                {
                  label: "Product Name",
                  key: "name",
                  placeholder: "Classic Oxford Shirt",
                  type: "text",
                },
                {
                  label: "Price ($)",
                  key: "price",
                  placeholder: "49.99",
                  type: "number",
                },
                {
                  label: "Category",
                  key: "category",
                  placeholder: "men, women, kids, accessories",
                  type: "text",
                },
                {
                  label: "Stock Quantity",
                  key: "stock",
                  placeholder: "100",
                  type: "number",
                },
                {
                  label: "Image URL",
                  key: "imageUrl",
                  placeholder: "https://...",
                  type: "text",
                },
                {
                  label: "Sizes (comma-separated)",
                  key: "size",
                  placeholder: "S, M, L, XL",
                  type: "text",
                },
                {
                  label: "Colors (comma-separated)",
                  key: "color",
                  placeholder: "Black, White, Navy",
                  type: "text",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs uppercase tracking-widest text-navy/60 mb-2 font-body">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={form[field.key]}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, [field.key]: e.target.value }));
                      setFormErrors((p) => ({ ...p, [field.key]: "" }));
                    }}
                    placeholder={field.placeholder}
                    className="input-field"
                  />
                  <ErrorMessage message={formErrors[field.key]} />
                </div>
              ))}

              <div>
                <label className="block text-xs uppercase tracking-widest text-navy/60 mb-2 font-body">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Product description..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              {/* Image preview */}
              {form.imageUrl && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-navy/60 mb-2 font-body">
                    Preview
                  </p>
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-32 h-40 object-cover bg-gray-50"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="btn-outline flex-1 text-sm uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                      Saving...
                    </>
                  ) : editingProduct ? (
                    "Update Product"
                  ) : (
                    "Create Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
