import "./MiddlePart.css";

import { useUserContext } from "../../context/Usercontext";
import FriendsList from "../friendList/FriendsList";
import GroupsList from "../groupList/GroupsList";
import Archives from "../archives/Archives";
import TopSearchBar from "../common/TopSearchBar";
import NotificationsList from "../notificationsList/NotificationList";

export default function MiddlePart() {
  const { currentView } = useUserContext();
  return (
    <div className="middlePart">
      <div className="middlePartWrapper">
        <TopSearchBar />
        <div className="list">
          {currentView === "Archives" && <Archives />}
          {currentView === "Friends" && <FriendsList />}
          {currentView === "Groups" && <GroupsList />}
          {currentView === "Notifications" && <NotificationsList />}
        </div>
      </div>
    </div>
  );
}
