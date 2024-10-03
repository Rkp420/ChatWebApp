import "./MessageBottomBar.css";
import { useRef } from "react";
import { FaLink } from "react-icons/fa";
import { BsFillSendFill } from "react-icons/bs";
import { useUserContext } from "../../context/Usercontext";
import { useMySocket } from "../../context/SocketContext";

export default function MessageBottomBar() {
  const { selectedConversation, conversationType, user } = useUserContext();
  const { socket } = useMySocket();
  console.log(selectedConversation);
  console.log(conversationType);
  const inputRef = useRef();
  const handleInput = () => {
    if (inputRef.current.value) {
      const message = {
        content: inputRef.current.value,
        type: "text",
        conversation: selectedConversation,
        conversationType,
        senderId: user._id,
      };
      socket.emit("sendMessage", message);
      inputRef.current.value = "";
    }
  };
  return (
    <>
      <div className="messageBottomBar">
        <button
          className={`file-button`}
          onClick={() => console.log("File type button clicked")}
        >
          <i className="icons">
            <FaLink />
          </i>
        </button>
        <div className="inputSection">
          <input
            type="text"
            ref={inputRef}
            className="inputMessage"
            placeholder="Type Your Message"
          />
        </div>
        <button type="submit" className={`send-button`} onClick={handleInput}>
          <i className="icons">
            <BsFillSendFill />
          </i>
        </button>
      </div>
    </>
  );
}
