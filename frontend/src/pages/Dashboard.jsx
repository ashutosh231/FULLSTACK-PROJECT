import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome to CreatorConnect. Choose where to go.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/chat"
          className="group glass-card rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/40 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition-colors">
            <svg
              className="w-7 h-7 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-100">Chat</h2>
          <p className="text-sm text-slate-400 mt-1">Message other users and share images.</p>
        </Link>

        <Link
          to="/assets"
          className="group glass-card rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/40 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-xl bg-teal-500/20 flex items-center justify-center mb-4 group-hover:bg-teal-500/30 transition-colors">
            <svg
              className="w-7 h-7 text-teal-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-100">Assets</h2>
          <p className="text-sm text-slate-400 mt-1">Browse images and content cards.</p>
        </Link>

        <Link
          to="/plans"
          className="group glass-card rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/40 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4 group-hover:bg-amber-500/30 transition-colors">
            <svg
              className="w-7 h-7 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-100">Plans</h2>
          <p className="text-sm text-slate-400 mt-1">Get more tokens with Basic, Pro, or Platinum.</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
