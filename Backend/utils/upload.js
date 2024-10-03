const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2; // Use v2 for latest API
const User = require("../Models/User.js");
const Group = require("../Models/Group");
const fs = require("fs");
const path = require("path");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const SUPPORTED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg"];

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Define multer storage
const storage = multer.memoryStorage();

// Configure multer upload with file filter and size limit
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: (req, file, callback) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png"
    ) {
      callback(null, true); // Accept the file
    } else {
      callback(new Error("Only JPEG, JPG, and PNG files are allowed"));
    }
  },
}).single("file");

const handler = async (req, res) => {
  try {
    // Upload file
    upload(req, res, async (err) => {
      if (err) {
        console.error("Error uploading file:", err);
        return res.status(400).json({ error: err.message });
      }

      // Check if file exists
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Check file type
      if (!SUPPORTED_MIME_TYPES.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Unsupported file type" });
      }

      // Check file size
      if (req.file.size > MAX_FILE_SIZE) {
        return res.status(400).json({
          error: `File size exceeds the maximum limit of ${
            MAX_FILE_SIZE / (1024 * 1024)
          } MB`,
        });
      }

      // Validate user authentication and authorization
      const { type, userId, groupId } = req.body;
      if (req.user !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Create a temporary directory for file processing
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      // Create a temporary file path
      const tempFilePath = path.join(tempDir, `image_${Date.now()}.jpg`);

      try {
        // Resize the image using sharp
        await sharp(req.file.buffer)
          .resize({ width: 300, height: 300 })
          .toFile(tempFilePath);

        // Upload resized image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
          folder: "uploads",
        });

        // Remove the temporary file after upload
        fs.unlinkSync(tempFilePath);

        // Update user or group profile URL in the database
        if (type === "group" && groupId) {
          const group = await Group.findById(groupId);
          if (!group) {
            return res.status(404).json({ error: "Group not found" });
          }
          const isAdmin = group.members.some(
            (member) =>
              member.user.toString() === userId.toString() &&
              member.role === "admin"
          );

          if (!isAdmin) {
            return res
              .status(403)
              .json({ error: "Only admins can change group profiles" });
          }

          // If admin, update the group's profile picture
          group.profile = uploadResult.secure_url;
          await group.save();
        } else if (type === "user") {
          const user = await User.findById(userId);
          if (!user) {
            return res.status(404).json({ error: "User not found" });
          }
          user.profile = uploadResult.secure_url;
          await user.save();
        }

        // Return the Cloudinary secure URL to the client
        return res.status(200).json({ url: uploadResult.secure_url });
      } catch (imageProcessingError) {
        // Catch and log any errors during image processing or upload
        console.error(
          "Error processing or uploading image:",
          imageProcessingError
        );
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath); // Ensure temp file is deleted on error
        }
        return res
          .status(500)
          .json({ error: "Error processing or uploading image" });
      }
    });
  } catch (error) {
    console.error("Internal server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = handler;
