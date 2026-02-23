import { sendMessage } from "../services/chatService.js";

const onlineUsers = {}; // userId -> socket.id

export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("registerUser", (userId) => {
      onlineUsers[userId] = socket.id;
    });

    socket.on("typing", ({ userId, userName, receiverId }) => {
      const receiverSocketId = onlineUsers[String(receiverId)];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user_typing", { userId, userName });
      }
    });

    socket.on("typing_stop", ({ userId, receiverId }) => {
      const receiverSocketId = onlineUsers[String(receiverId)];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user_stopped_typing", { userId });
      }
    });

    socket.on("send_message", async (msg) => {
      const { sender, receiver, content } = msg;

      if (!sender || !receiver || !content) {
        socket.emit("send_error", { message: "Missing sender, receiver, or content" });
        return;
      }

      try {
        const { message } = await sendMessage(sender, receiver, content);
        const payload = {
          _id: message._id,
          sender: message.sender.toString(),
          receiver: String(receiver),
          content: message.text,
          timestamp: message.createdAt,
        };

        // Emit to sender (confirms save) and receiver
        socket.emit("receive_message", payload);
        const receiverSocketId = onlineUsers[String(receiver)];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", payload);
        }
      } catch (err) {
        console.error("[Socket] send_message error:", err.message);
        socket.emit("send_error", { message: err.message || "Failed to save message" });
      }
    });

    socket.on("disconnect", () => {
      for (const userId in onlineUsers) {
        if (onlineUsers[userId] === socket.id) {
          delete onlineUsers[userId];
          break;
        }
      }
    });
  });
};
