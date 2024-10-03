import Friend from "../friends/Friend";
import { useUserContext } from "../../context/Usercontext";
import AddNew from "../common/AddNew";
import "./FriendList.css";

export default function FriendsList() {
  const { individualConversations } = useUserContext();
  return (
    <>
      <ul className="someList">
        {individualConversations?.map((indConversation) => (
          <li key={indConversation._id} className="listing">
            <Friend conversation={indConversation} />
          </li>
        ))}
      </ul>
      <AddNew model={"AddFriend"} />
    </>
  );
}
