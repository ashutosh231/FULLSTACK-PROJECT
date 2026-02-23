import Chat from "../components/Chat";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { getUsers } from "../api/authApi";

const Dashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!user) return;
    getUsers()
      .then((data) => setUsers(data))
      .catch(() => setUsers([]));
  }, [user]);

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-2xl overflow-hidden shadow-xl border border-slate-200/60 bg-white">
      <aside className="w-72 border-r border-slate-200/60 bg-slate-50/50 flex flex-col">
        <div className="p-4 border-b border-slate-200/60">
          <h2 className="font-semibold text-slate-800">Messages</h2>
          <p className="text-xs text-slate-500 mt-0.5">Select a user to start chatting</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {users.length === 0 ? (
            <p className="text-sm text-slate-500 p-4 text-center">No other users yet</p>
          ) : (
            users.map((u) => (
              <button
                key={u._id}
                type="button"
                onClick={() => setSelectedUser(u)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                  selectedUser?._id === u._id
                    ? "bg-indigo-500 text-white shadow-md"
                    : "hover:bg-slate-200/60 text-slate-700"
                }`}
              >
                <span className="font-medium block truncate">{u.name}</span>
                <span className="text-xs opacity-80 truncate block">{u.email}</span>
              </button>
            ))
          )}
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        {selectedUser ? (
          <Chat selectedUser={selectedUser} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50/30">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="font-medium text-slate-500">Select a user to start chatting</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;