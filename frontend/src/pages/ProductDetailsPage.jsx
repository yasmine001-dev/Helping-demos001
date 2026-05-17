import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);

        const productData = data.data || data;

        setProduct(productData);

        if (productData.size?.length) setSelectedSize(productData.size[0]);

        if (productData.color?.length) setSelectedColor(productData.color[0]);
      } catch {
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (product.size?.length && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (product.color?.length && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    setAdding(true);
    try {
      await addToCart({
        productId: product._id,
        quantity,
        size: selectedSize,
        color: selectedColor,
      });
    } finally {
      setAdding(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  if (error || !product)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-display text-2xl text-navy">{error}</p>
        <Link to="/" className="btn-outline">
          Back to Shop
        </Link>
      </div>
    );

  const image =
    product.imageUrl ||
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-body text-gray-400 mb-8">
          <Link to="/" className="hover:text-navy transition-colors">
            Shop
          </Link>
          <span>/</span>
          {product.category && (
            <>
              <span className="hover:text-navy cursor-pointer capitalize">
                {product.category}
              </span>
              <span>/</span>
            </>
          )}
          <span className="text-navy">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
          {/* Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 overflow-hidden">
              <img
                src={image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80";
                }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            {product.category && (
              <span className="badge bg-navy/10 text-navy text-[10px] capitalize">
                {product.category}
              </span>
            )}
            <h1 className="font-display text-4xl text-navy leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gold text-3xl font-body font-semibold">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.stock > 0 ? (
                <span className="text-green-600 text-sm font-body font-medium">
                  {product.stock} in stock
                </span>
              ) : (
                <span className="text-red-500 text-sm font-body font-medium">
                  Out of stock
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-gray-500 font-body leading-relaxed border-t border-gray-100 pt-4">
                {product.description}
              </p>
            )}

            {/* Sizes */}
            {product.size?.length > 0 && (
              <div>
                <label className="block text-xs uppercase tracking-widest text-navy/60 mb-3 font-body">
                  Size —{" "}
                  <span className="text-navy normal-case tracking-normal">
                    {selectedSize}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.size.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 border text-sm font-body font-medium transition-all ${
                        selectedSize === size
                          ? "bg-navy text-white border-navy"
                          : "border-gray-200 text-navy hover:border-navy"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.color?.length > 0 && (
              <div>
                <label className="block text-xs uppercase tracking-widest text-navy/60 mb-3 font-body">
                  Color —{" "}
                  <span className="text-navy normal-case tracking-normal">
                    {selectedColor}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.color.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border text-sm font-body transition-all ${
                        selectedColor === color
                          ? "bg-navy text-white border-navy"
                          : "border-gray-200 text-navy hover:border-navy"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-navy/60 mb-3 font-body">
                Quantity
              </label>
              <div className="flex items-center gap-0 w-fit border border-gray-200">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors text-xl font-light"
                >
                  −
                </button>
                <span className="w-12 h-12 flex items-center justify-center font-body font-medium border-x border-gray-200">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock || 99, q + 1))
                  }
                  className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors text-xl font-light"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className={`w-full py-4 text-sm uppercase tracking-widest font-body font-medium transition-all flex items-center justify-center gap-2 ${
                product.stock === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "btn-primary"
              }`}
            >
              {adding ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Adding...
                </>
              ) : product.stock === 0 ? (
                "Out of Stock"
              ) : (
                "Add to Cart"
              )}
            </button>

            {!isAuthenticated && (
              <p className="text-sm text-gray-400 font-body text-center">
                <Link to="/login" className="text-navy underline">
                  Sign in
                </Link>{" "}
                to add items to your cart
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
