import Friend from "../friends/Friend";
import { useUserContext } from "../../context/Usercontext";
import AddNew from "../common/AddNew";
import "./FriendList.css";
import { useState } from "react";

export default function FriendsList() {
  const { individualConversations, user } = useUserContext();
  const [openOptionsConversationId, setOpenOptionsConversationId] =
    useState(null);

  const handleOpenOptions = (conversationId) => {
    // If the same conversation is clicked, close it; otherwise, open the new one
    setOpenOptionsConversationId((prevId) =>
      prevId === conversationId ? null : conversationId
    );
  };
  return (
    <>
      <ul className="someList">
        {individualConversations?.map((indConversation) => {
          const receiver =
            indConversation?.receiver._id === user._id
              ? indConversation.sender
              : indConversation.receiver;
          return (
            <li key={indConversation._id} className="listing">
              <Friend
                conversation={indConversation}
                receiver={receiver}
                isOpenOptions={
                  openOptionsConversationId === indConversation._id
                }
                onOpenOptions={handleOpenOptions}
              />
            </li>
          );
        })}
      </ul>
      <AddNew model={"AddFriend"} />
    </>
  );
}
