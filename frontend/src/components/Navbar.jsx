import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../api/authApi";
import { logout } from "../store/slices/authSlice";

const Navbar = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center gap-2 group"
        >
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent transition-all duration-300 group-hover:from-cyan-300 group-hover:to-teal-300">
            CreatorConnect
          </span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse opacity-80" />
        </Link>

        {user ? (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-slate-200">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 animate-fade-in">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-400 hover:to-teal-400 shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40"
            >
              Signup
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
