import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ErrorMessage from "../components/ErrorMessage";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setErrors({ general: "Please fill in all fields" });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data);
      toast.success(`Welcome back, ${data.user?.name?.split(" ")[0]}!`);
      const redirectTo =
        data.user?.role === "admin" ? "/admin" : from === "/login" ? "/" : from;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid credentials";
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col justify-center items-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-white"
              style={{
                width: `${200 + i * 100}px`,
                height: `${200 + i * 100}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) rotate(45deg)",
              }}
            />
          ))}
        </div>
        <div className="relative text-center">
          <h1 className="font-display text-5xl text-white mb-4">STYLISH</h1>
          <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
          <p className="text-white/60 font-body text-lg leading-relaxed max-w-xs">
            Premium fashion for the discerning individual.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-10">
            <h2 className="font-display text-4xl text-navy mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500 font-body">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <ErrorMessage message={errors.general} />

            <div>
              <label className="block text-xs uppercase tracking-widest text-navy/60 mb-2 font-body">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-navy/60 mb-2 font-body">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                className="input-field"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500 font-body text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-navy font-medium hover:text-gold transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
