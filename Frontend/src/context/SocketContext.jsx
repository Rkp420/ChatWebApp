import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useUserContext } from "./Usercontext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const {
    user,
    setMessagesBatch,
    conversationType,
    selectedConversation,
    individualConversations,
    setIndividualConversations,
    groupConversations,
    setGroupConversations,
    setConversationMap,
    setArchivedConversations,
  } = useUserContext();
  const [socket, setSocket] = useState(null);
  const [onlineFriends, setOnlineFriends] = useState([]);

  const handleReceiveMessage = ({
    newlyCreatedMessage,
    conversationId,
    conversationType,
  }) => {
    console.log("Received message:", newlyCreatedMessage);

    if (selectedConversation?._id === conversationId) {
      setMessagesBatch((prevBatch) => {
        const updatedMessages = prevBatch?.messages
          ? [...prevBatch.messages, newlyCreatedMessage]
          : [newlyCreatedMessage];

        return {
          ...prevBatch,
          messages: updatedMessages,
        };
      });
    } else {
      // Updating Individual Conversations
      if (conversationType === "IndividualConversation") {
        setIndividualConversations((prevConversations) => {
          return prevConversations.map((conv) =>
            conv._id === conversationId
              ? {
                  ...conv,
                  messageBatch: {
                    ...conv.messageBatch,
                    messages: [
                      ...(conv.messageBatch?.messages ?? []),
                      newlyCreatedMessage,
                    ],
                  },
                }
              : conv
          );
        });
      }

      // Updating Group Conversations
      else if (conversationType === "GroupConversation") {
        setGroupConversations((prevConversations) => {
          return prevConversations.map((conv) =>
            conv._id === conversationId
              ? {
                  ...conv,
                  messageBatch: {
                    ...conv.messageBatch,
                    messages: [
                      ...(conv.messageBatch?.messages ?? []),
                      newlyCreatedMessage,
                    ],
                  },
                }
              : conv
          );
        });
        setConversationMap((prevMap) => {
          const newMap = new Map(prevMap); // Clone the previous state

          const prevData = newMap.get(conversationId);
          const newValue = prevData ? prevData.value + 1 : 1; // Increment value if exists, otherwise start at 1

          newMap.set(conversationId, {
            value: newValue,
            message: newlyCreatedMessage.content,
          }); // Set the updated value and message
          return newMap;
        });
      } else {
        console.log("Conversation Type is missing");
      }
    }
  };

 const handleArchiveConversation = ({ conversationId, conversationType }) => {
   let conversation;
   if (conversationType === "IndividualConversations") {
     // Find and archive the individual conversation
     conversation = individualConversations.find(
       (individualConversation) => individualConversation._id === conversationId
     );
     // Remove the archived conversation from the list
     setIndividualConversations((prev) =>
       prev.filter(
         (individualConversation) =>
           individualConversation._id !== conversationId
       )
     );
   } else if (conversationType === "GroupConversations") {
     // Find and archive the group conversation
     conversation = groupConversations.find(
       (groupConversation) => groupConversation._id === conversationId
     );
     // Remove the archived conversation from the list
     setGroupConversations((prev) =>
       prev.filter(
         (groupConversation) => groupConversation._id !== conversationId
       )
     );
   }

   // Add the archived conversation to the archived conversations array
   if (conversation) {
     setArchivedConversations((prev) => [...prev, conversation]);
   }
 };

  useEffect(() => {
    let newSocket;
    if (user) {
      newSocket = io("http://localhost:5050", {
        query: { userId: user?._id },
      });

      newSocket.on("connect", () => {
        setSocket(newSocket);
      });

      newSocket.on("receiveMessage", handleReceiveMessage);
      newSocket.on("messageNotSent", () => {
        console.log("There is an error during Message Sent");
      });
      newSocket.on("archive-made", handleArchiveConversation);

      newSocket.on("onlineFriends", (friends) => {
        console.log(friends);
        setOnlineFriends(friends);
      });

      newSocket.on("friendOnline", (friend) => {
        setOnlineFriends((prevFriends) => [
          ...prevFriends,
          { _id: friend._id, username: friend.username }, // Fetch and update username accordingly
        ]);
      });

      newSocket.on("friendOffline", (friend) => {
        setOnlineFriends((prevFriends) =>
          prevFriends.filter((prevfriend) => prevfriend._id !== friend._id)
        );
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });

      newSocket.on("disconnect", () => {
        ("Socket disconnected");
      });
    }

    return () => {
      if (newSocket) {
        newSocket.off("receiveMessage", handleReceiveMessage);
        newSocket.off("onlineFriends");
        newSocket.off("connect_error");
        newSocket.off("disconnect");
        newSocket.disconnect();
        ("Socket cleaned up");
      }
    };
  }, [user, conversationType, selectedConversation, setMessagesBatch]);

  return (
    <SocketContext.Provider value={{ socket, setSocket, onlineFriends }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useMySocket = () => useContext(SocketContext);
