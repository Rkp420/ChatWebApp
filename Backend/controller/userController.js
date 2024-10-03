const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const path = require("path");
const IndividualConversation = require("../models/IndividualConversation");
const GroupConversation = require("../Models/GroupConversation");
const MessageBatch = require("../Models/MessageBatch");
const User = require("../Models/User");

module.exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ msg: "Username, email, and password are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }

    // Validate password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters long" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash the password
    const hashPass = await bcrypt.hash(password.trim(), 10);

    // Create the user
    const user = await User.create({
      email,
      username,
      password: hashPass,
    });

    // Generate JWT token
    const { password: userPassword, ...userWithoutPass } = user.toObject();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Send response
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .status(201)
      .json(userWithoutPass);
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

//For login a user
module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Email:", email);
    console.log("Password (received):", password); // Log for debugging

    // Verify email and password
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    console.log("Stored password hash:", user.password); // Log for debugging (consider security implications)

    const isPassCorrect = await bcrypt.compare(password.trim(), user.password);
    console.log("Password match (with rehash):", isPassCorrect);

    // If password is incorrect, return early
    if (!isPassCorrect) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    // Generate JWT token
    const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Fetch individual conversations for the user
    const individualConversations = await IndividualConversation.find({
      $or: [{ sender: user._id }, { receiver: user._id }],
    })
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

    // Fetch group conversations for the user
    const groupConversations = await GroupConversation.find({
      _id: { $in: user.groupConversations },
    })
      .populate({
        path: "group",
        select: "_id groupname profile moto bio creator members",
        populate: {
          path: "members.user",
          select: "id username profile",
        },
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

    // Send response with user details and conversations
    return res.cookie("token", newToken, { httpOnly: false }).status(200).json({
      user,
      individualConversations,
      groupConversations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Log out a user
module.exports.logoutUser = (req, res) => {
  try {
    res.cookie("token", "", { expires: new Date(0), httpOnly: true });
    return res.status(200).json({ msg: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error: ", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

//updating User
module.exports.updateUser = async (req, res) => {
  console.log("Update User");
};

// Get user by token
module.exports.getUserByToken = async (req, res) => {
  const { clientToken } = req.params;

  try {
    if (!clientToken) {
      return res
        .status(400)
        .json({ msg: "Please login or sign up to continue" });
    }

    // Verify token and extract user ID
    const { userId } = jwt.verify(clientToken, process.env.JWT_SECRET);

    if (userId.toString() !== req.user) {
      return res.status(400).json({ msg: "User ID does not match" });
    }

    // Fetch user details
    const user = await User.findById(userId);

    // Fetching individual conversations for the user
    // Fetching individual conversations for the user
    const individualConversations = await IndividualConversation.find({
      $or: [{ sender: user._id }, { receiver: user._id }],
    })
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

    // Fetching group conversations for the user
    const groupConversations = await GroupConversation.find({
      _id: { $in: user.groupConversations },
    })
      .populate({
        path: "group",
        select: "_id groupname profile moto bio creator members",
        populate: {
          path: "members.user",
          select: "id username profile",
        },
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

    if (user) {
      return res.status(200).json({
        user,
        individualConversations, // Return all individual conversations for the user
        groupConversations,
      });
    }

    return res.status(404).json({ msg: "User not found" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports.getAllUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user) {
      const users = await User.find({}, "username profile");
      return res.status(200).json(users);
    } else {
      return res.status(403).json({ msg: "User does not Match" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
