import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";

const STATUS_COLORS = {
  pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  processing: "bg-blue-50 text-blue-700 border border-blue-200",
  shipped: "bg-purple-50 text-purple-700 border border-purple-200",
  delivered: "bg-green-50 text-green-700 border border-green-200",
  cancelled: "bg-red-50 text-red-500 border border-red-200",
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get("/orders/my");

        setOrders(Array.isArray(data) ? data : data.data || data.orders || []);
      } catch {
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (orders.length === 0 && !error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-8xl">📦</div>

        <h2 className="font-display text-3xl text-navy">No orders yet</h2>

        <p className="text-gray-400 font-body">
          Start shopping to see your orders here
        </p>

        <Link to="/" className="btn-primary uppercase tracking-widest text-sm">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-4xl text-navy mb-2">My Orders</h1>

        <p className="text-gray-400 font-body mb-10">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>

        {error && (
          <p className="text-red-500 font-body text-center py-10">{error}</p>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white animate-fade-in">
              {/* ORDER HEADER */}
              <button
                onClick={() =>
                  setExpanded(expanded === order._id ? null : order._id)
                }
                className="w-full p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-mono text-xs text-gray-400">
                    #{order._id?.slice(-8).toUpperCase()}
                  </p>

                  <p className="font-body text-sm text-gray-400">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`badge text-[10px] uppercase ${
                      STATUS_COLORS[order.status] || "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {order.status || "pending"}
                  </span>

                  <span className="font-body font-semibold text-gold">
                    $
                    {Number(
                      order.totalPrice || order.totalAmount || order.total || 0,
                    ).toFixed(2)}
                  </span>

                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      expanded === order._id ? "rotate-180" : ""
                    }`}
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
                </div>
              </button>

              {/* ORDER DETAILS */}
              {expanded === order._id && (
                <div className="border-t border-gray-100 px-6 pb-6 animate-slide-up">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                    {/* ITEMS */}
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 font-body mb-3">
                        Items
                      </p>

                      <div className="space-y-3">
                        {order.items?.map((item, i) => {
                          const prod = item.product || item.productId || item;

                          const image =
                            prod.images?.[0] ||
                            prod.imageUrl ||
                            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&q=60";

                          return (
                            <div key={i} className="flex items-center gap-3">
                              <img
                                src={image}
                                alt={prod.name || "Product"}
                                className="w-12 h-14 object-cover bg-gray-50 flex-shrink-0"
                                onError={(e) => {
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&q=60";
                                }}
                              />

                              <div>
                                <p className="font-body text-sm text-navy font-medium">
                                  {prod.name || item.name || "Product"}
                                </p>

                                <p className="font-body text-xs text-gray-400">
                                  Qty: {item.quantity}
                                  {item.size && ` · Size: ${item.size}`}
                                  {item.color && ` · ${item.color}`}
                                </p>

                                <p className="text-gold text-sm font-medium">
                                  $
                                  {(
                                    (item.price || prod.price || 0) *
                                    item.quantity
                                  ).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* SHIPPING */}
                    {order.shippingAddress && (
                      <div>
                        <p className="text-xs uppercase tracking-widest text-gray-400 font-body mb-3">
                          Shipping Address
                        </p>

                        <div className="font-body text-sm text-navy space-y-1">
                          <p>{order.shippingAddress.street}</p>

                          <p>{order.shippingAddress.city}</p>

                          <p className="text-gray-400">
                            {order.shippingAddress.phone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
