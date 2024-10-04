const socketIo = require("socket.io");
const User = require("./Models/User");
const MessageBatch = require("./Models/MessageBatch");
const MessageContent = require("./Models/Message");
const GroupConversation = require("./Models/GroupConversation");
const IndividualConversation = require("./models/IndividualConversation");

module.exports = function setUpSocket(server) {
  const io = new socketIo.Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  const activeSocketUsers = new Map();

  const addSocketForUser = (userId, socketId) => {
    if (!activeSocketUsers.has(userId)) {
      activeSocketUsers.set(userId, []);
    }
    const sockets = activeSocketUsers.get(userId);
    if (Array.isArray(sockets)) {
      if (!sockets.includes(socketId)) {
        sockets.push(socketId);
      }
    } else {
      console.error(`Failed to add socket: ${socketId} for user: ${userId}`);
    }
  };

  const handleDisconnection = (userId, socketId) => {
    const sockets = activeSocketUsers.get(userId) || [];

    if (Array.isArray(sockets)) {
      const index = sockets.indexOf(socketId);

      if (index > -1) {
        sockets.splice(index, 1);
      }

      if (sockets.length === 0) {
        notifyFriendsUserIsOffline(userId);
        activeSocketUsers.delete(userId);
      } else {
        activeSocketUsers.set(userId, sockets);
      }
    } else {
      console.error(
        `Unexpected data type for sockets associated with user: ${userId}`
      );
    }
  };

  const notifyFriendsUserIsOffline = async (userId) => {
    try {
      const user = await User.findById(userId).populate({
        path: "individualConversations",
        populate: {
          path: "sender receiver",
          select: "_id username profile",
        },
      });

      if (user && user.individualConversations) {
        const friendsSet = new Set(); // Ensure unique friends

        // Extract unique friends based on sender and receiver
        user.individualConversations.forEach((conversation) => {
          const friend =
            conversation.sender._id.toString() === userId
              ? conversation.receiver
              : conversation.sender;
          friendsSet.add(friend._id.toString());
        });

        const uniqueFriends = Array.from(friendsSet);

        // Filter for friends that are currently online
        const onlineFriends = uniqueFriends.filter((friendId) =>
          activeSocketUsers.has(friendId)
        );

        // Notify online friends that the user is offline
        onlineFriends.forEach((friendId) => {
          const friendSocketIds = activeSocketUsers.get(friendId);
          if (friendSocketIds && friendSocketIds.length > 0) {
            friendSocketIds.forEach((socketId) => {
              io.to(socketId).emit("friendOffline", {
                _id: userId,
                username: user.username,
              });
            });
          }
        });
      }
    } catch (error) {
      console.error("Error notifying friends about offline status:", error);
    }
  };

  const notifyOnlineFriends = async (userId) => {
    try {
      // Assuming you have the userId and activeSocketUsers available in your context
      const user = await User.findById(userId).populate({
        path: "individualConversations",
        populate: {
          path: "sender receiver",
          select: "_id username profile",
        },
      });

      if (user && user.individualConversations) {
        // Extract friends based on sender and receiver
        const friends = user.individualConversations.flatMap((conversation) => {
          return [
            conversation.sender._id.toString() === userId
              ? conversation.receiver
              : conversation.sender,
          ];
        });

        // Remove duplicates from the friends list
        const uniqueFriends = [
          ...new Map(friends.map((friend) => [friend._id, friend])).values(),
        ];

        // Filter out online friends
        const onlineFriends = uniqueFriends.filter((friend) =>
          activeSocketUsers.has(friend._id.toString())
        );

        const socketIds = activeSocketUsers.get(userId);
        if (socketIds && socketIds.length > 0) {
          socketIds.forEach((socketId) => {
            io.to(socketId).emit("onlineFriends", onlineFriends);
          });
        }

        onlineFriends.forEach((friend) => {
          const friendSocketIds = activeSocketUsers.get(friend._id.toString());
          if (friendSocketIds && friendSocketIds.length > 0) {
            friendSocketIds.forEach((socketId) => {
              io.to(socketId).emit("friendOnline", {
                _id: userId,
                username: user.username,
              });
            });
          }
        });
      }
    } catch (error) {
      console.error("Error notifying online friends:", error);
    }
  };

  const handleSendMessage = async (information) => {
    try {
      const {
        conversation,
        conversationType,
        senderId,
        content,
        type,
        fileUrl,
      } = information;
      console.log(conversation);
      if (!conversation || !conversationType || !senderId || !type) {
        throw new Error("Something Not Good");
      }

      // Validate conversationType
      if (
        !["IndividualConversation", "GroupConversation"].includes(
          conversationType
        )
      ) {
        throw new Error("Something Not Good");
      }

      // Prepare the new message object
      const newMessage = await MessageContent.create({
        sender: senderId,
        content: type === "text" ? content : undefined,
        fileUrl: type === "file" ? fileUrl : undefined,
        messageType: type,
      });

      const newlyCreatedMessage = await MessageContent.findById(
        newMessage._id
      ).populate({
        path: "sender",
        select: "_id username profile",
      });

      if (!newlyCreatedMessage) {
        io.to(senderSocketId).emit("messageNotSent");
        return;
      }

      // Find or create the MessageBatch for this conversation
      const messageBatch = await MessageBatch.findOne({
        conversation: conversation._id,
        conversationModel: conversationType,
      });
      
      if (!messageBatch) {
        throw new Error("MessageBatch is not available");
      }
      messageBatch.messages.push(newMessage);
      await messageBatch.save();

      const senderSocketId = activeSocketUsers.get(senderId);

      // Handling Individual Conversations
      if (conversationType === "IndividualConversation") {
        // Use sender/receiver logic correctly to identify the recipient
        const receiverId =
          conversation.receiver._id.toString() === senderId
            ? conversation.sender._id.toString()
            : conversation.receiver._id.toString();

        const receiverSocketId = activeSocketUsers.get(receiverId);

        // Emit the message to all receiver's socket IDs if they are online and not the sender
        if (receiverSocketId && Array.isArray(receiverSocketId)) {
          receiverSocketId
            .filter((socketId) => socketId !== senderSocketId) // Ensure not sending to the sender's socket ID
            .forEach((socketId) => {
              io.to(socketId).emit("receiveMessage", {
                newlyCreatedMessage,
                conversationId: conversation._id,
                conversationType,
              });
            });
        }

        // Emit the message back to all sender's socket IDs to reflect it in their chat
        if (senderSocketId && Array.isArray(senderSocketId)) {
          senderSocketId.forEach((socketId) => {
            io.to(socketId).emit("receiveMessage", {
              newlyCreatedMessage,
              conversationId: conversation._id,
              conversationType,
            });
          });
        }
      }

      // Handling Group Conversations
      if (
        conversationType === "GroupConversation" &&
        conversation.group &&
        conversation.group.members.length
      ) {
        const groupMemberSocketIds = conversation.group.members.flatMap(
          (member) => {
            const socketIds = activeSocketUsers.get(member.user._id.toString());

            return Array.isArray(socketIds)
              ? socketIds.filter((socketId) => socketId !== senderSocketId)
              : [];
          }
        );

        // Emit the message to all online members of the group except the sender
        groupMemberSocketIds.forEach((socketId) => {
          io.to(socketId).emit("receiveMessage", {
            newlyCreatedMessage,
            conversationId: conversation._id,
            conversationType,
          });
        });

        // Send the message to the sender as well
        if (senderSocketId) {
          io.to(senderSocketId).emit("receiveMessage", {
            newlyCreatedMessage,
            conversationId: conversation._id,
            conversationType,
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      addSocketForUser(userId, socket.id);
      console.log(
        `User connected -> userId: ${userId} and socketId: ${socket.id}`
      );
      notifyOnlineFriends(userId);
    } else {
      console.log("user id not providng through backend");
    }
    socket.on("sendMessage", handleSendMessage);
    socket.on("disconnect", () => {
      console.log("disconnected userId : ", userId, " socketId : ", socket.id);
      handleDisconnection(userId, socket.id);
    });
  });
};
