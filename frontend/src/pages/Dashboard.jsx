import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Chat from "../components/Chat";
import { fetchUsers, setSelectedUser } from "../store/slices/chatSlice";

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const { users, selectedUser } = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;
    dispatch(fetchUsers());
  }, [user, dispatch]);

  return (
    <div className="flex h-[calc(100vh-7rem)] rounded-3xl overflow-hidden glass-card border border-slate-700/50 shadow-2xl shadow-black/20 animate-fade-in-up">
      <aside className="w-72 sm:w-80 border-r border-slate-700/50 flex flex-col bg-slate-900/30">
        <div className="p-5 border-b border-slate-700/50">
          <h2 className="font-bold text-lg text-slate-100">Messages</h2>
          <p className="text-xs text-slate-400 mt-1">Select a user to start chatting</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-3">
                <svg
                  className="w-7 h-7 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-500">No other users yet</p>
            </div>
          ) : (
            <div className="space-y-1.5 stagger-children">
              {users.map((u) => (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => dispatch(setSelectedUser(u))}
                  className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 ${
                    selectedUser?._id === u._id
                      ? "bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/40 text-cyan-100 shadow-lg shadow-cyan-500/10"
                      : "hover:bg-slate-800/50 border border-transparent hover:border-slate-600/50 text-slate-300"
                  }`}
                >
                  <span className="font-medium block truncate">{u.name}</span>
                  <span className="text-xs opacity-80 truncate block text-slate-400">
                    {u.email}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 bg-slate-900/20">
        {selectedUser ? (
          <Chat selectedUser={selectedUser} />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center animate-fade-in">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-slate-800/50 flex items-center justify-center border border-slate-700/50 animate-float">
                <svg
                  className="w-12 h-12 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="font-medium text-slate-500 text-lg">Select a user to start chatting</p>
              <p className="text-sm text-slate-600 mt-1">Choose from the list on the left</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
