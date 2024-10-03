import { useEffect, useRef } from "react";
import { useUserContext } from "../../context/Usercontext";
import ReceivedMessage from "../receiverMessage/ReceivedMessage";
import SentMessage from "../senderMessage/SentMessage";
import "./MessageMiddleBar.css";
export default function MessageMiddleBar() {
  const { messagesBatch } = useUserContext();
  const { user } = useUserContext();
  const messageListRef = useRef(null); // Reference for the message list

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom(); // Scroll to bottom whenever messagesBatch updates
  }, [messagesBatch]);
  
  return (
    <div className="messageMiddleBar">
      <ul className="messageList" ref={messageListRef}>
        {messagesBatch?.messages?.map((message) => (
          <li key={message._id} className="messageListing">
            {message.sender._id === user._id ? (
              <SentMessage message={message.content} />
            ) : (
              <ReceivedMessage message={message.content} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
