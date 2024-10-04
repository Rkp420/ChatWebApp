import Friend from "../friends/Friend";
import { useUserContext } from "../../context/Usercontext";
import AddNew from "../common/AddNew";
import "./FriendList.css";

export default function FriendsList() {
  const { individualConversations, user } = useUserContext();
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
              <Friend conversation={indConversation} receiver={receiver} />
            </li>
          );
        })}
      </ul>
      <AddNew model={"AddFriend"} />
    </>
  );
}
