const chatService = require("../services/chatService");

let onlineUsers = {};

const socketHandler = (io) => {
  io.on("connection", (socket) => {

    socket.on("registerUser", (userId) => {
      onlineUsers[userId] = socket.id;
    });

    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("sendMessage", async (data) => {
      const { conversationId, sender, text } = data;

      const message = await chatService.sendMessage(
        conversationId,
        sender,
        text
      );

      io.to(conversationId).emit("receiveMessage", message);
    });

    socket.on("messageSeen", async ({ messageId, userId }) => {
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: { seenBy: userId },
      });

      io.emit("messageSeenUpdate", { messageId, userId });
    });

    socket.on("disconnect", () => {
      for (let userId in onlineUsers) {
        if (onlineUsers[userId] === socket.id) {
          delete onlineUsers[userId];
        }
      }
    });
  });
};

module.exports = socketHandler;