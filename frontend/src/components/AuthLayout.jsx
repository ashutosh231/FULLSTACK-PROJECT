import { Link } from "react-router-dom";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-mesh">
      <header className="fixed top-0 left-0 right-0 z-40 glass py-4 px-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent hover:from-cyan-300 hover:to-teal-300 transition-all duration-300"
        >
          CreatorConnect
        </Link>
      </header>
      <main className="pt-24 pb-12 px-4">{children}</main>
    </div>
  );
};

export default AuthLayout;
