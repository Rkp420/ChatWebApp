const IndividualConversation = require("../models/IndividualConversation");
const MessageBatch = require("../Models/MessageBatch");
const MessageContent = require("../Models/Message");
const User = require("../Models/User");
const mongoose = require("mongoose");

module.exports.createConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // Check if a conversation already exists between the two users
    let conversation;
    const existingConversation = await IndividualConversation.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingConversation) {
      conversation = existingConversation;
    } else {
      // Create the new conversation
      conversation = await IndividualConversation.create({
        sender: senderId,
        receiver: receiverId,
      });

      // Ensure the conversation has been created and has an ID
      if (!conversation || !conversation._id) {
        return res.status(500).json({ msg: "Failed to create conversation." });
      }

      // Update both users' conversation lists
      await Promise.all([
        User.updateOne(
          { _id: senderId },
          { $push: { individualConversations: conversation._id } }
        ),
        User.updateOne(
          { _id: receiverId },
          { $push: { individualConversations: conversation._id } }
        ),
      ]);

      // Create the MessageBatch after the conversation is confirmed to exist
      const messageBatch = await MessageBatch.create({
        conversation: conversation._id,
        conversationModel: "IndividualConversation",
      });

      // Assign the messageBatch to the conversation and save
      conversation.messageBatch = messageBatch._id;
      await conversation.save();
    }

    // Populate and return the conversation details
    const populatedConversation = await IndividualConversation.findById(
      conversation._id
    )
      .populate({
        path: "sender",
        select: "_id username bio location email phone profile dob",
      })
      .populate({
        path: "receiver",
        select: "_id username bio location email phone profile dob",
      })
      .populate({
        path: "messageBatch",
        populate: {
          path: "messages",
          populate: {
            path: "sender",
            select: "_id username profile",
          },
          select: "_id sender content fileUrl messageType",
        },
      })
      .exec();

    return res.status(200).json({
      msg: "Conversation created successfully",
      conversation: populatedConversation,
    });
  } catch (error) {
    console.error("Error creating conversation: ", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports.deleteConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    // Find the conversation by sender and receiver
    const conversation = await IndividualConversation.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found." });
    }

    // Start a transaction for atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Populate the conversation details before deletion
      const populatedConversation = await IndividualConversation.findById(
        conversation._id
      )
        .populate({
          path: "sender",
          select: "_id username bio location email phone profile dob",
        })
        .populate({
          path: "receiver",
          select: "_id username bio location email phone profile dob",
        })
        .populate({
          path: "messageBatch",
          populate: {
            path: "messages",
            populate: {
              path: "sender",
              select: "_id username profile",
            },
            select: "_id sender content fileUrl messageType",
          },
        })
        .exec();

      // Delete the message batch and all messages related to this conversation
      if (conversation.messageBatch) {
        await MessageBatch.findByIdAndDelete(conversation.messageBatch, {
          session,
        });
        await MessageContent.deleteMany(
          {
            $or: [{ sender: senderId }, { sender: receiverId }],
          },
          { session }
        );
      }

      // Hard delete the conversation
      await IndividualConversation.findByIdAndDelete(conversation._id, {
        session,
      });

      // Remove the conversation ID from both users' individualConversations
      await Promise.all([
        User.updateOne(
          { _id: senderId },
          { $pull: { individualConversations: conversation._id } },
          { session }
        ),
        User.updateOne(
          { _id: receiverId },
          { $pull: { individualConversations: conversation._id } },
          { session }
        ),
      ]);

      // Commit the transaction if everything succeeds
      await session.commitTransaction();

      return res.status(200).json({
        msg: "Conversation and related messages deleted successfully.",
        conversation: populatedConversation, // Return the populated conversation details before deletion
      });
    } catch (error) {
      // Abort the transaction in case of error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error deleting conversation: ", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
