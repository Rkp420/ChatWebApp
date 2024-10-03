const GroupConversation = require("../Models/GroupConversation");
const Group = require("../Models/Group");
const User = require("../Models/User");

module.exports.createGroup = async (req, res) => {
  try {
    const { groupname, profile, members, userId, moto, bio } = req.body;

    if (req.user !== userId) {
      return res.status(404).json({ msg: "Unauthorized" });
    }

    if (!groupname || !userId) {
      return res
        .status(400)
        .json({ msg: "Group name and user ID are required" });
    }

    let updateMembers = members || [];
    const creatorExist = updateMembers.some((member) => {
      member.user.toString() === req.user;
    });

    if (!creatorExist) {
      updateMembers.push({ user: req.user, role: "admin" });
    }

    // Validate the roles for each member
    const validRoles = ["admin", "member"];
    for (let member of updateMembers) {
      if (!validRoles.includes(member.role)) {
        return res
          .status(400)
          .json({ msg: `Invalid role for member ${member.user}` });
      }
    }
    updateMembers.filter(
      (member, index, self) =>
        index ===
        self.findIndex((m) => m.user.toString() === member.user.toString)
    );

    const newGroup = await Group.create({
      groupname,
      profile,
      members: updateMembers,
      creator: req.user, // Set the creator as the user making the request
      bio,
      moto,
    });

    // Create a new GroupConversation for this group
    const newGroupConversation = await GroupConversation.create({
      group: newGroup._id,
      messageBatch: [], // Initialize with an empty message batch
    }); // Update each member's groupConversations field
    const memberIds = updateMembers.map((member) => member.user);

    await User.updateMany(
      { _id: { $in: memberIds } },
      { $push: { groupConversations: newGroupConversation._id } }
    );

    return res.status(201).json({
      group: newGroup,
      groupConversation: newGroupConversation,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server error" });
  }
};

module.exports.deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    // Ensure the user making the request is the same as the one passed in the request
    if (req.user !== userId) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    // Find the group by groupId
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }

    // Check if the user is the creator of the group
    if (group.creator.toString() !== req.user) {
      return res
        .status(403)
        .json({ msg: "Only the group creator can delete this group" });
    }

    // Delete the group
    await Group.findByIdAndDelete(groupId);

    // Find and delete the corresponding GroupConversation
    const groupConversation = await GroupConversation.findOneAndDelete({
      group: groupId,
    });

    if (!groupConversation) {
      return res.status(404).json({ msg: "Group conversation not found" });
    }

    // Remove the group conversation ID from all members' groupConversations fields
    const memberIds = group.members.map((member) => member.user);
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $pull: { groupConversations: groupConversation._id } }
    );

    return res
      .status(200)
      .json({ msg: "Group and associated conversation deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params; // Extract groupId from URL parameters
    const { groupname, profile, moto, bio } = req.body; // Destructure the request body

    // Check if required fields are present
    if (!groupname || !moto || !bio) {
      return res.status(400).json({ msg: "All fields are required." });
    }

    // Find the group by ID and check if it exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ msg: "Group not found." });
    }

    // Authorization check: Ensure the user is the creator or an admin
    if (
      group.creator.toString() !== req.user &&
      !group.members.some(
        (member) =>
          member.user.toString() === req.user && member.role === "admin"
      )
    ) {
      return res
        .status(403)
        .json({ msg: "Unauthorized to update this group." });
    }

    // Update group details using findByIdAndUpdate
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { groupname, profile, moto, bio },
      { new: true, runValidators: true } // Return the updated document and run validators
    );

    return res
      .status(200)
      .json({ msg: "Group updated successfully.", group: updatedGroup });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports.addGroupMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, role } = req.body;

    // Find the group by ID
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ msg: "Group not found." });
    }

    // Check if the requester is an admin in the group
    const isAdmin = group.members.some(
      (member) => member.user.toString() === req.user && member.role === "admin"
    );

    if (!isAdmin) {
      return res.status(403).json({ msg: "Only admins can add members." });
    }

    // Check if the user already exists in the group
    const memberExists = group.members.some(
      (member) => member.user.toString() === userId
    );
    if (memberExists) {
      return res.status(400).json({ msg: "User is already a member." });
    }

    // Add the new member with the specified role
    group.members.push({ user: userId, role: role || "member" });

    // Save the updated group
    await group.save();

    // Find the GroupConversation associated with this group
    const groupConversation = await GroupConversation.findOne({
      group: groupId,
    });
    if (!groupConversation) {
      return res.status(404).json({ msg: "Group conversation not found." });
    }

    // Update the newly added member's groupConversations
    await User.findByIdAndUpdate(
      userId,
      { $push: { groupConversations: groupConversation._id } },
      { new: true }
    );

    return res
      .status(200)
      .json({ msg: "Member added successfully.", members: group.members });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports.removeGroupMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body; // User to be removed

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ msg: "Group not found." });
    }

    // Check if the requester is the creator or an admin
    const isAdmin = group.members.some(
      (member) =>
        member.user.toString() === req.user &&
        (member.role === "admin" ||
          member.user.toString() === group.creator.toString())
    );

    if (!isAdmin) {
      return res.status(403).json({ msg: "Only admins can remove members." });
    }

    // Check if the user to be removed is the creator
    if (group.creator.toString() === userId) {
      return res
        .status(403)
        .json({ msg: "The creator cannot be removed from the group." });
    }

    // Remove the member
    group.members = group.members.filter(
      (member) => member.user.toString() !== userId
    );
    await group.save();

    // Optionally, remove the group conversation from the removed user's groupConversations (if applicable)
    await User.updateOne(
      { _id: userId },
      { $pull: { groupConversations: groupId } } // Ensure the user doesn't retain this group's conversation
    );

    return res
      .status(200)
      .json({ msg: "Member removed successfully.", members: group.members });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports.updateMemberRole = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, newRole } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ msg: "Group not found." });
    }

    // Check if the user making the request is the group creator or an admin
    const isAdmin = group.members.some(
      (member) =>
        member.user.toString() === req.user &&
        (member.role === "admin" ||
          member.user.toString() === group.creator.toString())
    );

    if (!isAdmin) {
      return res
        .status(403)
        .json({ msg: "Only admins can update member roles." });
    }

    const member = group.members.find(
      (member) => member.user.toString() === userId
    );
    if (!member) {
      return res.status(404).json({ msg: "Member not found." });
    }

    // Ensure the member being updated is not the group creator
    if (userId === group.creator.toString()) {
      return res
        .status(403)
        .json({ msg: "Cannot change the role of the group creator." });
    }

    member.role = newRole;
    await group.save();

    return res.status(200).json({
      msg: "Member role updated successfully.",
      members: group.members,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports.leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params; // Get the group ID from the URL parameters
    const userId = req.user; // Get the user ID from the authenticated request

    // Find the group by ID
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ msg: "Group not found." });
    }

    // Check if the user is the creator of the group
    if (group.creator.toString() === userId) {
      return res
        .status(400)
        .json({ msg: "The creator cannot leave the group." });
    }

    // Check if the user is a member of the group
    const memberIndex = group.members.findIndex(
      (member) => member.user.toString() === userId
    );
    if (memberIndex === -1) {
      return res
        .status(400)
        .json({ msg: "You are not a member of this group." });
    }

    // Remove the user from the group members
    group.members.splice(memberIndex, 1);

    // Save the updated group
    await group.save();

    // Update the user's groupConversations field (optional)
    await User.updateOne(
      { _id: userId },
      { $pull: { groupConversations: groupId } } // Remove the group's ID from the user's groupConversations
    );

    return res
      .status(200)
      .json({ msg: "You have left the group successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};
