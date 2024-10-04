import { useUserContext } from "../../context/Usercontext";
import MessageBottomBar from "../messageBottomBar/MessageBottomBar";
import MessageMiddleBar from "../messageMiddleBar/MessageMiddleBar";
import MessageTopBar from "../messageTopBar/MessageTopBar";
import "./MessageBox.css";

export default function MessageBox() {
  const { selectedConversation, messagesBatch, conversationType, user } =
    useUserContext();
  const receiver =
    conversationType === "IndividualConversation"
      ? selectedConversation.receiver._id === user._id
        ? selectedConversation.sender
        : selectedConversation.receiver
      : selectedConversation;
  return (
    <>
      <div className="messageBox">
        {!selectedConversation ? (
          <div className="noUser">Please Select Someone to Start The Chat</div>
        ) : (
          <div className="messageBoxWrapper">
            <MessageTopBar
              receiver={receiver}
              typeOfReceiver={conversationType}
            />
            <MessageMiddleBar messagesBatch={messagesBatch} />
            <MessageBottomBar />
          </div>
        )}
      </div>
    </>
  );
}
