import "./User.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useUserContext } from "../../context/Usercontext";

export default function User({ userData }) {
  const {
    user,
    setUser,
    setIndividualConversations,
    individualConversations,
    selectedConversation,
    setSelectedConversation,
  } = useUserContext();
  const [isAlreadyExit, setIsAlreadyExist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if a conversation exists between the logged-in user and userData
    console.log(individualConversations);
    const exists = individualConversations.some(
      (conv) =>
        (conv.sender._id === user._id && conv.receiver._id === userData._id) ||
        (conv.sender._id === userData._id && conv.receiver._id === user._id)
    );

    setIsAlreadyExist(exists);
  }, [individualConversations, user._id, userData._id]);

  const handleClick = async () => {
    setLoading(true);

    const data = {
      senderId: user._id,
      receiverId: userData._id,
    };

    try {
      const conversationRes = isAlreadyExit
        ? await axios.delete(
            `/api/delete/conversation/${user?._id}/${userData._id}`
          )
        : await axios.post("/api/new/conversation", data);
      console.log(conversationRes);
      if (conversationRes.status === 200) {
        const newConversations = !isAlreadyExit
          ? [...individualConversations, conversationRes.data.conversation]
          : individualConversations.filter(
              (conv) => conv._id !== conversationRes.data.conversation._id
            );

        setIndividualConversations(newConversations);

        // Update user individualConversations only once
        setUser((prev) => ({
          ...prev,
          individualConversations: !isAlreadyExit
            ? [
                ...prev.individualConversations,
                conversationRes.data.conversation._id,
              ]
            : prev.individualConversations.filter(
                (conv) => conv !== conversationRes.data.conversation._id
              ),
        }));

        if (
          selectedConversation?._id === conversationRes?.data?.conversation?._id
        ) {
          setSelectedConversation(null);
        }

        toast.success(conversationRes.data.msg);
        setIsAlreadyExist(!isAlreadyExit);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update friend status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="user">
        <img
          className="userImage"
          src={userData.profile}
          alt={`${userData.username}'s profile`}
        />
        <h4 className="name">{userData.username}</h4>
      </div>
      <button
        onClick={handleClick}
        className={isAlreadyExit ? "isFriend" : "isFriendNot"}
        disabled={loading}
      >
        {loading ? "Processing..." : isAlreadyExit ? "Remove" : "Add"}
      </button>
    </>
  );
}
