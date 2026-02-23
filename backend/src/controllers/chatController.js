const chatService = require("../services/chatService");

// 🔥 Send message (auto create conversation if not exist)
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, text } = req.body;

    const result = await chatService.sendMessage(
      senderId,
      receiverId,
      text
    );

    res.json(result);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📩 Get all messages of a conversation
exports.getMessages = async (req, res) => {
  try {
    const messages = await chatService.getMessages(
      req.params.conversationId
    );

    res.json(messages);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};