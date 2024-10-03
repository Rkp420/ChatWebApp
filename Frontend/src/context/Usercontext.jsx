import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";

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
    ]
  );
  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
