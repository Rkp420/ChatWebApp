import "./Friend.css";
import { useEffect, useState } from "react";
import { useUserContext } from "../../context/Usercontext";
import { BsThreeDotsVertical } from "react-icons/bs";
import OpenOptionModel from "../optionModel/OpenOptionModel";

export default function Friend({
  conversation,
  receiver,
  isOpenOptions,
  onOpenOptions,
}) {
  const {
    selectedConversation,
    setSelectedConversation,
    setConversationType,
    setMessagesBatch,
    setIsUserOnRight,
    conversationMap,
  } = useUserContext();

  const [isSelected, setIsSelected] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  // Provide fallback if conversationMap.get() returns undefined
  const valueAndMessage = conversationMap.get(conversation._id) || {
    value: 0,
    message: "",
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onOpenOptions(conversation._id);
  };

  const onSelect = () => {
    setIsUserOnRight(false);
    setSelectedConversation(conversation);
    setConversationType("IndividualConversation");
    setMessagesBatch(conversation.messageBatch);
  };

  useEffect(() => {
    if (conversation && conversation._id === selectedConversation?._id) {
      setIsSelected(true); // Mark this friend as selected if it matches the selected conversation
    } else {
      setIsSelected(false); // Deselect it if the conversation doesn't match
    }
  }, [selectedConversation, conversation]);

  return (
    <div
      onClick={onSelect}
      className={isSelected ? "selected-listBox" : "listBox"}
    >
      <div className="someStyle">
        <span className="style"></span>
        <div className="imageSection">
          <img src={receiver?.profile} alt="Image" className="image" />
        </div>
        <div className="infoSection">
          <div className="info">
            <h3>{receiver?.username}</h3>
            {isOnline ? <p>Online</p> : <p>Offline</p>}
          </div>
          {valueAndMessage.message && (
            <p className="incomming-message">{valueAndMessage.message}</p>
          )}
        </div>
      </div>
      <div className="optionsSection">
        <button
          className={`option-button ${isOpenOptions ? "active" : ""}`}
          onClick={handleClick}
        >
          <i className="threeDot">
            <BsThreeDotsVertical />
          </i>
        </button>
        {valueAndMessage.value > 0 && (
          <div className="value">{valueAndMessage.value}</div>
        )}
      </div>
      {isOpenOptions && <OpenOptionModel isArchive={conversation.isArchive} />}
    </div>
  );
}
