import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState } from "react";

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    setAdding(true);
    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
        size: product.size?.[0],
        color: product.color?.[0],
      });
    } finally {
      setAdding(false);
    }
  };

  const image =
    product.imageUrl ||
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80";

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block card animate-fade-in"
    >
      <div className="relative overflow-hidden aspect-[3/4] bg-gray-50">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80";
          }}
        />
        {product.category && (
          <span className="absolute top-3 left-3 badge bg-navy text-white text-[10px]">
            {product.category}
          </span>
        )}
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className="absolute bottom-0 left-0 right-0 bg-navy text-white text-sm font-medium py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hover:bg-gold hover:text-navy"
        >
          {adding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-display text-navy font-semibold text-base leading-tight line-clamp-2 mb-1">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-gold font-body font-semibold text-lg">
            ${Number(product.price).toFixed(2)}
          </span>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-xs text-red-500 font-medium">
              Only {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
            <span className="text-xs text-gray-400 font-medium">
              Out of stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
