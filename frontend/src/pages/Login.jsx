import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../api/authApi";
import { setUser } from "../store/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { successToast, errorToast } from "../utils/toast";
import Button from "../components/Button";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(formData);
      dispatch(setUser(data));
      successToast("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      errorToast(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-6rem)]">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 sm:p-10 gradient-border animate-scale-in shadow-2xl shadow-cyan-500/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2">
              Welcome back
            </h1>
            <p className="text-slate-400 text-sm">Sign in to continue to CreatorConnect</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 animate-fade-in-up animate-delay-100">
              <label className="block text-sm font-medium text-slate-300">Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
              />
            </div>
            <div className="space-y-2 animate-fade-in-up animate-delay-200">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
              />
            </div>
            <div className="pt-2 animate-fade-in-up animate-delay-300">
              <Button type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>

          <p className="text-center mt-6 text-sm text-slate-400 animate-fade-in-up animate-delay-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
