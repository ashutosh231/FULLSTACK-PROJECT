import React, { useState, useEffect, useRef } from "react";
import { socket } from "../socket";
import { useAuth } from "../context/AuthContext";
import { getMessages } from "../api/authApi";
import { errorToast } from "../utils/toast";

const Chat = ({ selectedUser }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const userId = user?._id || user?.id;

  useEffect(() => {
    if (userId) socket.emit("registerUser", userId);
  }, [userId]);

  // Load chat history when selected user changes
  useEffect(() => {
    if (!selectedUser?._id || !userId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getMessages(selectedUser._id)
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [selectedUser?._id, userId]);

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on("send_error", (err) => {
      errorToast(err?.message || "Failed to send message");
    });
    return () => {
      socket.off("receive_message");
      socket.off("send_error");
    };
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const content = input.trim();
    const msg = {
      sender: userId,
      receiver: selectedUser._id,
      content,
    };
    socket.emit("send_message", msg);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-200/60 bg-white">
        <h3 className="font-semibold text-slate-800">Chat with {selectedUser?.name}</h3>
        <p className="text-xs text-slate-500">{selectedUser?.email}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-3 p-4">
          {loading ? (
            <p className="text-center text-slate-500 py-8">Loading messages...</p>
          ) : (
          <>
          {messages.map((msg, idx) => {
            const isMe = String(msg.sender) === String(userId);
            return (
            <div
              key={msg._id || idx}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMe
                    ? "bg-indigo-500 text-white rounded-br-md"
                    : "bg-slate-200/80 text-slate-800 rounded-bl-md"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? "text-indigo-100" : "text-slate-500"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
          })}
          <div ref={messagesEndRef} />
          </>
          )}
        </div>
      </div>
      <div className="p-4 border-t border-slate-200/60 bg-white flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
        />
        <button
          onClick={sendMessage}
          className="px-6 py-3 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
