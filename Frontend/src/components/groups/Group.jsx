import "./Group.css";
import { useEffect, useState } from "react";
import { useUserContext } from "../../context/Usercontext";
import { BsThreeDotsVertical } from "react-icons/bs";

export default function Group({ conversation }) {
  const {
    selectedConversation,
    setSelectedConversation,
    setConversationType,
    setIsUserOnRight,
  } = useUserContext();

  const [isSelected, setIsSelected] = useState(false);
  const [value, setValue] = useState(null);

  const onSelect = () => {
    setIsUserOnRight(false);
    setSelectedConversation(conversation);
    setConversationType("GroupConversation");
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
          <p className="incomming-message">Aji Land Mera</p>
        </div>
      </div>
      <div className="optionsSection">
        <button className="option-button">
          <i className="threeDot">
            <BsThreeDotsVertical />
          </i>
        </button>
        {value && <div className="value">{value}</div>}
      </div>
    </div>
  );
}
