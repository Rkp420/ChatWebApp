import "./Group.css";
import { useEffect, useState } from "react";
import { useUserContext } from "../../context/Usercontext";
import { BsThreeDotsVertical } from "react-icons/bs";

export default function Group({ conversation, isOpenOptions, onOpenOptions }) {
  const {
    selectedConversation,
    setSelectedConversation,
    setConversationType,
    setIsUserOnRight,
    conversationMap,
  } = useUserContext();

  const [isSelected, setIsSelected] = useState(false);
  const valueAndMessage = conversationMap.get(conversation._id) || {
    value: 0,
    message: "",
  };

  const onSelect = () => {
    setIsUserOnRight(false);
    setSelectedConversation(conversation);
    setConversationType("GroupConversation");
    setMessagesBatch(conversation.messageBatch);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onOpenOptions(conversation._id);
  };

  useEffect(() => {
    if (conversation && conversation._id === selectedConversation?._id) {
      setIsSelected(true);
    } else {
      setIsSelected(false);
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
          <img
            src={conversation?.group?.profile}
            alt="Image"
            className="image"
          />
        </div>
        <div className="infoSection">
          <div className="info">
            <h3>{conversation?.group?.groupname}</h3>
            <p>Moto : {conversation?.group?.moto}</p>
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
      {isOpenOptions && <OpenOptionModel />}
    </div>
  );
}
