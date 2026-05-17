import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import toast from "react-hot-toast";

export default function CartPage() {
  const { cart, loading, removeItem, updateQuantity, clearCart, itemCount } =
    useCart();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    street: "",
    city: "",
    phone: "",
  });

  const [shippingErrors, setShippingErrors] = useState({});
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const items = cart?.items || [];

  const total =
    cart?.totalPrice ||
    cart?.total ||
    items.reduce(
      (sum, item) =>
        sum +
        (item.price || item.productId?.price || item.product?.price || 0) *
          item.quantity,
      0,
    );

  const validateShipping = () => {
    const e = {};

    if (!shipping.street.trim()) e.street = "Street address required";

    if (!shipping.city.trim()) e.city = "City required";

    if (!shipping.phone.trim()) e.phone = "Phone number required";

    return e;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    const errs = validateShipping();

    if (Object.keys(errs).length) {
      setShippingErrors(errs);
      return;
    }

    setPlacingOrder(true);

    try {
      const { data } = await api.post("/orders", {
        shippingAddress: shipping,
      });

      await clearCart();

      toast.success("Order placed successfully!");

      navigate("/order-confirmation", {
        state: { order: data },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-8xl">🛒</div>

        <h2 className="font-display text-3xl text-navy">Your cart is empty</h2>

        <p className="text-gray-400 font-body">
          Looks like you haven't added anything yet
        </p>

        <Link to="/" className="btn-primary uppercase tracking-widest text-sm">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-4xl text-navy mb-2">Shopping Cart</h1>

        <p className="text-gray-400 font-body mb-10">
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = item.productId || item.product || item;

              const image =
                product.images?.[0] ||
                product.imageUrl ||
                "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&q=80";

              const price = item.price || product.price || 0;

              const name = product.name || "Product";

              return (
                <div
                  key={item._id}
                  className="bg-white p-5 flex gap-5 items-start animate-fade-in"
                >
                  <Link to={`/products/${product._id || product.id}`}>
                    <img
                      src={image}
                      alt={name}
                      className="w-24 h-28 object-cover bg-gray-50 flex-shrink-0"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&q=80";
                      }}
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${product._id || product.id}`}>
                      <h3 className="font-display text-navy text-lg font-semibold hover:text-gold transition-colors line-clamp-2">
                        {name}
                      </h3>
                    </Link>

                    <div className="flex gap-4 mt-1">
                      {item.size && (
                        <span className="text-xs text-gray-400 font-body uppercase">
                          Size: {item.size}
                        </span>
                      )}

                      {item.color && (
                        <span className="text-xs text-gray-400 font-body">
                          Color: {item.color}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* QUANTITY */}
                      <div className="flex items-center border border-gray-200">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateQuantity(item._id, item.quantity - 1)
                              : removeItem(item._id)
                          }
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg"
                        >
                          −
                        </button>

                        <span className="w-8 h-8 flex items-center justify-center text-sm font-body font-medium border-x border-gray-200">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg"
                        >
                          +
                        </button>
                      </div>

                      {/* PRICE + DELETE */}
                      <div className="flex items-center gap-4">
                        <span className="text-gold font-body font-semibold text-lg">
                          ${(price * item.quantity).toFixed(2)}
                        </span>

                        <button
                          onClick={() => removeItem(item._id)}
                          className="text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SUMMARY */}
          <div className="space-y-6">
            <div className="bg-white p-6 space-y-4">
              <h2 className="font-display text-2xl text-navy">Order Summary</h2>

              <div className="space-y-3 py-4 border-y border-gray-100">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between text-sm font-body text-gray-500"
                  >
                    <span className="truncate max-w-[160px]">
                      {item.productId?.name || item.product?.name || item.name}{" "}
                      × {item.quantity}
                    </span>

                    <span>
                      $
                      {(
                        (item.price ||
                          item.productId?.price ||
                          item.product?.price ||
                          0) * item.quantity
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-body font-semibold text-navy text-lg">
                <span>Total</span>

                <span className="text-gold">${Number(total).toFixed(2)}</span>
              </div>

              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-primary w-full uppercase tracking-widest text-sm"
              >
                {showForm ? "Hide Form" : "Proceed to Checkout"}
              </button>
            </div>

            {/* SHIPPING FORM */}
            {showForm && (
              <form
                onSubmit={handlePlaceOrder}
                className="bg-white p-6 space-y-4 animate-slide-up"
              >
                <h3 className="font-display text-xl text-navy">
                  Shipping Address
                </h3>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-navy/60 mb-2 font-body">
                    Street
                  </label>

                  <input
                    value={shipping.street}
                    onChange={(e) => {
                      setShipping((p) => ({
                        ...p,
                        street: e.target.value,
                      }));

                      setShippingErrors((p) => ({
                        ...p,
                        street: "",
                      }));
                    }}
                    placeholder="123 Main St"
                    className="input-field"
                  />

                  <ErrorMessage message={shippingErrors.street} />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-navy/60 mb-2 font-body">
                    City
                  </label>

                  <input
                    value={shipping.city}
                    onChange={(e) => {
                      setShipping((p) => ({
                        ...p,
                        city: e.target.value,
                      }));

                      setShippingErrors((p) => ({
                        ...p,
                        city: "",
                      }));
                    }}
                    placeholder="New York"
                    className="input-field"
                  />

                  <ErrorMessage message={shippingErrors.city} />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-navy/60 mb-2 font-body">
                    Phone
                  </label>

                  <input
                    value={shipping.phone}
                    onChange={(e) => {
                      setShipping((p) => ({
                        ...p,
                        phone: e.target.value,
                      }));

                      setShippingErrors((p) => ({
                        ...p,
                        phone: "",
                      }));
                    }}
                    placeholder="+1 234 567 8900"
                    className="input-field"
                  />

                  <ErrorMessage message={shippingErrors.phone} />
                </div>

                <button
                  type="submit"
                  disabled={placingOrder}
                  className="btn-gold w-full uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                >
                  {placingOrder ? (
                    <>
                      <span className="h-4 w-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                      Placing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
