import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ErrorMessage from "../components/ErrorMessage";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        ...form,
        role: "user",
      });
      if (data.accessToken) {
        login(data);
        toast.success("Welcome to Stylish!");
        navigate(data.user?.role === "admin" ? "/admin" : "/");
      } else {
        toast.success("Account created! Please log in.");
        navigate("/login");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "", general: "" }));
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
                opacity: 1 - i * 0.15,
              }}
            />
          ))}
        </div>
        <div className="relative text-center">
          <h1 className="font-display text-5xl text-white mb-4">STYLISH</h1>
          <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
          <p className="text-white/60 font-body text-lg leading-relaxed max-w-xs">
            Your destination for premium fashion. Curated collections,
            exceptional quality.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-10">
            <h2 className="font-display text-4xl text-navy mb-2">
              Create Account
            </h2>
            <p className="text-gray-500 font-body">
              Join us and start shopping
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <ErrorMessage message={errors.general} />

            <div>
              <label className="block text-xs uppercase tracking-widest text-navy/60 mb-2 font-body">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="input-field"
              />
              <ErrorMessage message={errors.name} />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-navy/60 mb-2 font-body">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="input-field"
              />
              <ErrorMessage message={errors.email} />
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
                placeholder="Min 6 characters"
                className="input-field"
              />
              <ErrorMessage message={errors.password} />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-navy/60 mb-2 font-body">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                className="input-field"
              />
              <ErrorMessage message={errors.confirmPassword} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500 font-body text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-navy font-medium hover:text-gold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
