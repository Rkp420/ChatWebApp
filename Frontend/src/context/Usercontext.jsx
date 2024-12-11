import React, { createContext, useContext, useState, useMemo } from "react";

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [individualConversations, setIndividualConversations] = useState([]);
  const [groupConversations, setGroupConversations] = useState([]);
  const [conversationType, setConversationType] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messagesBatch, setMessagesBatch] = useState([]);
  const [isUserOnRight, setIsUserOnRight] = useState(true);
  const [currentView, setCurrentView] = useState("Friends"); // Default to "archives"
  const [conversationMap, setConversationMap] = useState(new Map());
  const [archivedConversations, setArchivedConversation] = useState([]);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      conversationType,
      setConversationType,
      selectedConversation,
      setSelectedConversation,
      messagesBatch,
      setMessagesBatch,
      isUserOnRight,
      setIsUserOnRight,
      individualConversations, // add this here
      setIndividualConversations,
      groupConversations,
      setGroupConversations,
      currentView,
      setCurrentView,
      conversationMap,
      setConversationMap,
      archivedConversations,
      setArchivedConversation,
    }),
    [
      user,
      conversationType,
      selectedConversation,
      messagesBatch,
      isUserOnRight,
      individualConversations, // and this here
      groupConversations,
      currentView,
      conversationMap,
      archivedConversations,
    ]
  );
  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
