const IndividualConversation = require("../models/IndividualConversation");
const GroupConversation = require("../Models/GroupConversation");
const MessageBatch = require("../Models/MessageBatch");
const MessageContent = require("../Models/Message");
const User = require("../Models/User");

module.exports.createMessage = async (req, res) => {
  try {
    const {
      conversationId,
      conversationType,
      senderId,
      content,
      messageType,
      fileUrl,
    } = req.body;

    if (!conversationId || !conversationType || !senderId || !messageType) {
      return res.status(400).json({ msg: "Missing required fields." });
    }

    // Validate conversationType
    if (
      !["IndividualConversation", "GroupConversation"].includes(
        conversationType
      )
    ) {
      return res.status(400).json({ msg: "Invalid conversation type." });
    }

    // Find the conversation based on the type
    let conversation;
    if (conversationType === "IndividualConversation") {
      conversation = await IndividualConversation.findById(conversationId);
    } else if (conversationType === "GroupConversation") {
      conversation = await GroupConversation.findById(conversationId);
    }

    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found." });
    }

    // Prepare the new message object
    const newMessage = await MessageContent.create({
      sender: senderId,
      content: messageType === "text" ? content : undefined,
      fileUrl: messageType === "file" ? fileUrl : undefined,
      messageType,
    });

    // Find or create the MessageBatch for this conversation
    const messageBatch = await MessageBatch.findOne({
      conversation: conversationId,
      conversationModel: conversationType,
    });

    if (!messageBatch) {
      return res.status(404).json({ msg: "MessageBatch not found" });
    } else {
      messageBatch.messages.push(newMessage);
      await messageBatch.save();
    }

    return res
      .status(201)
      .json({ msg: "Message created successfully.", messageBatch });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { senderId, conversationId, conversationType } = req.body;

    // Ensure all required fields are provided
    if (!messageId || !conversationId || !conversationType || !senderId) {
      return res.status(400).json({ msg: "Missing required fields." });
    }

    // Validate conversationType
    if (
      !["IndividualConversation", "GroupConversation"].includes(
        conversationType
      )
    ) {
      return res.status(400).json({ msg: "Invalid conversation type." });
    }

    const conversationModel =
      conversationType === "IndividualConversation"
        ? IndividualConversation
        : GroupConversation;

    const conversation = await conversationModel.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found." });
    }

    // Find the MessageBatch associated with the conversation
    const messageBatch = await MessageBatch.findOne({
      conversation: conversationId,
      conversationModel: conversationType,
    });

    if (!messageBatch) {
      return res.status(404).json({ msg: "Message batch not found." });
    }
    if (!messageBatch) {
      throw new Error("Message batch not found");
    }

    // Check if the message exists in the batch
    const message = messageBatch.messages.find(
      (msg) => msg.toString() === messageId
    );

    if (!message) {
      throw new Error("Message not found in batch");
    }

    // Find the message content document and mark it as deleted
    const messageContent = await MessageContent.findById(message);

    if (!messageContent) {
      return res.status(404).json({ msg: "Message content not found." });
    }

    messageContent.isDeleted = true; // Soft delete the message
    await messageContent.save();

    // Optionally, update the updatedAt timestamp of the batch
    messageBatch.updatedAt = Date.now();
    await messageBatch.save();

    return res
      .status(200)
      .json({ msg: "Message deleted successfully.", messageBatch });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};
