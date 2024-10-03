import { useUserContext } from "../../context/Usercontext";
import Group from "../groups/Group";
import AddNew from "../common/AddNew";

export default function GroupsList() {
  const { groupConversations } = useUserContext();
  return (
    <>
      <ul className="someList">
        {groupConversations?.map((groupConversation) => (
          <li key={groupConversation._id} className="listing">
            <Group conversation={groupConversation} />
          </li>
        ))}
      </ul>
      <AddNew model={"CreateGroup"} />
    </>
  );
}
