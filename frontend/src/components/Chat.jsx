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
const MAX_IMAGE_SIZE = 800;
const MAX_IMAGE_QUALITY = 0.85;
const MAX_IMAGE_BYTES = 500 * 1024;

const compressImage = (file) =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please select an image file"));
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
        if (width > height) {
          height = (height / width) * MAX_IMAGE_SIZE;
          width = MAX_IMAGE_SIZE;
        } else {
          width = (width / height) * MAX_IMAGE_SIZE;
          height = MAX_IMAGE_SIZE;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      let quality = MAX_IMAGE_QUALITY;
      const tryEncode = () => {
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        if (dataUrl.length > MAX_IMAGE_BYTES && quality > 0.3) {
          quality -= 0.1;
          tryEncode();
        } else {
          resolve(dataUrl);
        }
      };
      tryEncode();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });

const Chat = ({ selectedUser }) => {
  const user = useSelector((state) => state.auth.user);
  const {
    messagesByConversation,
    typingUser,
    messagesLoading,
  } = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  const [input, setInput] = useState("");
  const [sendingImage, setSendingImage] = useState(false);
  const fileInputRef = useRef(null);
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

  const sendTextMessage = () => {
    if (!input.trim()) return;
    sendMessage(input.trim(), null);
  };

  const sendMessage = (textContent = null, imageData = null) => {
    const content = (textContent ?? input).trim();
    if (!content && !imageData) return;
    emitTypingStop();
    const msg = {
      sender: userId,
      receiver: selectedUser._id,
      content: content || "",
      ...(imageData && { image: imageData }),
    };
    socket.emit("send_message", msg);
    if (textContent !== undefined) setInput("");
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setSendingImage(true);
    try {
      const dataUrl = await compressImage(file);
      sendMessage(input.trim(), dataUrl);
    } catch (err) {
      errorToast(err.message || "Failed to send image");
    } finally {
      setSendingImage(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/30">
        <h3 className="font-semibold text-slate-100">{selectedUser?.name}</h3>
        <p className="text-xs text-slate-400">{selectedUser?.email}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center mb-3">
                <div className="w-5 h-5 border-2 border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-slate-500">Loading messages...</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const isMe = String(msg.sender) === String(userId);
                return (
                  <div
                    key={msg._id || idx}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} animate-slide-in-right`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 transition-all duration-300 overflow-hidden ${
                        isMe
                          ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-br-md shadow-lg shadow-cyan-500/20"
                          : "bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-bl-md"
                      }`}
                    >
                      {msg.image && (
                        <a
                          href={msg.image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-lg overflow-hidden mb-2 max-w-full"
                        >
                          <img
                            src={msg.image}
                            alt="Shared"
                            className="max-w-full max-h-72 object-contain rounded-lg"
                          />
                        </a>
                      )}
                      {msg.content ? (
                        <p className="text-sm">{msg.content}</p>
                      ) : null}
                      <p
                        className={`text-xs mt-1 ${
                          isMe ? "text-cyan-100/80" : "text-slate-500"
                        }`}
                      >
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
        <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-900/20">
          <div className="flex justify-start">
            <div className="bg-slate-800/80 rounded-2xl rounded-bl-md px-4 py-2 border border-slate-700/50">
              <p className="text-sm text-slate-400 flex items-center gap-1">
                <span className="italic">{typingUser.name} is typing</span>
                <span className="flex gap-0.5">
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-500 inline-block" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-500 inline-block" />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-500 inline-block" />
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/30 flex gap-2 items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sendingImage}
          className="p-3 rounded-xl bg-slate-800/50 border border-slate-600/50 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center min-w-[44px] min-h-[44px]"
          title="Send image"
        >
          {sendingImage ? (
            <div className="w-5 h-5 border-2 border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </button>
        <input
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendTextMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
        />
        <button
          onClick={sendTextMessage}
          className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-400 hover:to-teal-400 shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 active:scale-[0.98]"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
