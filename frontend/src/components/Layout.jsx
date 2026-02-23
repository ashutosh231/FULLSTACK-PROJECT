import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-8">
        <div className="animate-fade-in-up">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
