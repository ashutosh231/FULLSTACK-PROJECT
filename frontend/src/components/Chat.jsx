import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../socket";
import { errorToast } from "../utils/toast";
import {
  fetchMessages,
  addMessage,
  setTypingUser,
  clearTypingUserFor,
} from "../store/slices/chatSlice";

const TYPING_STOP_DELAY_MS = 1500;
const TYPING_INDICATOR_TIMEOUT_MS = 3000;
const TYPING_THROTTLE_MS = 500;

const Chat = ({ selectedUser }) => {
  const user = useSelector((state) => state.auth.user);
  const {
    messagesByConversation,
    typingUser,
    messagesLoading,
  } = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const typingStopTimeoutRef = useRef(null);
  const typingIndicatorClearRef = useRef(null);
  const lastTypingEmitRef = useRef(0);

  const userId = user?._id || user?.id;
  const messages = selectedUser?._id
    ? messagesByConversation[String(selectedUser._id)] || []
    : [];
  const loading = messagesLoading;

  useEffect(() => {
    if (userId) socket.emit("registerUser", userId);
  }, [userId]);

  useEffect(() => {
    if (!selectedUser?._id || !userId) return;
    dispatch(setTypingUser(null));
    dispatch(fetchMessages(selectedUser._id));
  }, [selectedUser?._id, userId, dispatch]);

  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      const otherUserId =
        String(msg.sender) === String(userId) ? msg.receiver : msg.sender;
      if (otherUserId) dispatch(addMessage({ otherUserId, message: msg }));
    };
    const handleSendError = (err) => {
      errorToast(err?.message || "Failed to send message");
    };
    const handleUserTyping = ({ userId: typingUserId, userName }) => {
      dispatch(setTypingUser({ id: typingUserId, name: userName }));
      if (typingIndicatorClearRef.current) clearTimeout(typingIndicatorClearRef.current);
      typingIndicatorClearRef.current = setTimeout(() => {
        dispatch(clearTypingUserFor(typingUserId));
      }, TYPING_INDICATOR_TIMEOUT_MS);
    };
    const handleUserStoppedTyping = ({ userId: typingUserId }) => {
      dispatch(clearTypingUserFor(typingUserId));
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("send_error", handleSendError);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stopped_typing", handleUserStoppedTyping);
    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("send_error", handleSendError);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stopped_typing", handleUserStoppedTyping);
      if (typingIndicatorClearRef.current) clearTimeout(typingIndicatorClearRef.current);
    };
  }, [selectedUser?._id, userId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const emitTypingStop = useCallback(() => {
    if (selectedUser?._id && userId) {
      socket.emit("typing_stop", { userId, receiverId: selectedUser._id });
    }
  }, [selectedUser?._id, userId]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (!selectedUser?._id || !userId) return;

    if (typingIndicatorClearRef.current) clearTimeout(typingIndicatorClearRef.current);
    if (typingStopTimeoutRef.current) clearTimeout(typingStopTimeoutRef.current);

    if (value.trim()) {
      const now = Date.now();
      if (now - lastTypingEmitRef.current > TYPING_THROTTLE_MS) {
        lastTypingEmitRef.current = now;
        socket.emit("typing", {
          userId,
          userName: user?.name || "Someone",
          receiverId: selectedUser._id,
        });
      }
      typingStopTimeoutRef.current = setTimeout(emitTypingStop, TYPING_STOP_DELAY_MS);
    } else {
      emitTypingStop();
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    emitTypingStop();
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
      {typingUser && (
        <div className="px-4 py-2 border-t border-slate-200/60 bg-slate-50/50">
          <div className="flex justify-start">
            <div className="bg-slate-200/80 rounded-2xl rounded-bl-md px-4 py-2">
              <p className="text-sm text-slate-600 italic animate-pulse">
                {typingUser.name} is typing...
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="p-4 border-t border-slate-200/60 bg-white flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
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
