import { useState } from "react";
import { useUserContext } from "../../context/Usercontext";
import Friend from "../friends/Friend";
import Group from "../groups/Group";

export default function Archives() {
  const { archivedConversations } = useUserContext();
  const [openOptionsConversationId, setOpenOptionsConversationId] =
    useState(null);

  const handleOpenOptions = (conversationId) => {
    setOpenOptionsConversationId((prevId) =>
      prevId === conversationId ? null : conversationId
    );
  };
  return (
    <ul className="someList">
      {archivedConversations?.map((archivedConversation) => (
        <li key={archivedConversation._id} className="listing">
          {archivedConversation.group ? (
            <Group
              conversation={archivedConversation}
              isOpenOptions={
                openOptionsConversationId === archivedConversation._id
              }
              onOpenOptions={handleOpenOptions}
            />
          ) : (
            <Friend
              conversation={archivedConversation}
              receiver={receiver}
              isOpenOptions={
                openOptionsConversationId === archivedConversation._id
              }
              onOpenOptions={handleOpenOptions}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
