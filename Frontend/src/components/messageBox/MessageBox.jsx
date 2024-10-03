import { useUserContext } from "../../context/Usercontext";
import MessageBottomBar from "../messageBottomBar/MessageBottomBar";
import MessageMiddleBar from "../messageMiddleBar/MessageMiddleBar";
import MessageTopBar from "../messageTopBar/MessageTopBar";
import "./MessageBox.css";

export default function MessageBox() {
  const { selectedConversation, messagesBatch } = useUserContext();

  return (
    <>
      <div className="messageBox">
        {!selectedConversation ? (
          <div className="noUser">Please Select Someone to Start The Chat</div>
        ) : (
          <div className="messageBoxWrapper">
            <MessageTopBar />
            <MessageMiddleBar messagesBatch={messagesBatch} />
            <MessageBottomBar />
          </div>
        )}
      </div>
    </>
  );
}
