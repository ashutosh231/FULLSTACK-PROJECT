import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export const sendMessage = async (senderId, receiverId, text) => {
  if (!senderId || !receiverId || !text) {
    throw new Error("Missing required fields");
  }

  const senderObjId = new mongoose.Types.ObjectId(senderId);
  const receiverObjId = new mongoose.Types.ObjectId(receiverId);

  let conversation = await Conversation.findOne({
    participants: { $all: [senderObjId, receiverObjId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderObjId, receiverObjId],
    });
  }

  const message = await Message.create({
    conversationId: conversation._id,
    sender: senderObjId,
    text: String(text).trim(),
    seenBy: [senderObjId],
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  return {
    conversationId: conversation._id,
    message,
  };
};

export const getMessagesBetween = async (userId, otherUserId) => {
  const userObjId = new mongoose.Types.ObjectId(userId);
  const otherObjId = new mongoose.Types.ObjectId(otherUserId);

  const conversation = await Conversation.findOne({
    participants: { $all: [userObjId, otherObjId] },
  });
  if (!conversation) return [];

  const messages = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .lean();

  return messages.map((m) => ({
    _id: m._id,
    sender: m.sender.toString(),
    content: m.text,
    timestamp: m.createdAt,
  }));
};
