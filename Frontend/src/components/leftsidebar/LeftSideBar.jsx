import { useUserContext } from "../../context/Usercontext";
import { useMySocket } from "../../context/SocketContext";

import "./LeftSideBar.css";
import axios from "axios";
import toast from "react-hot-toast";

import { FaHome } from "react-icons/fa";
import { FaUserFriends } from "react-icons/fa";
import { IoMdArchive } from "react-icons/io";
import { IoNotifications } from "react-icons/io5";
import { MdGroups2 } from "react-icons/md";
import { FaMoon } from "react-icons/fa";
import { HiOutlineLogout } from "react-icons/hi";

const ReactIcons = [
  {
    name: "Home",
    icon: <FaHome />,
  },
  {
    name: "Friends",
    icon: <FaUserFriends />,
  },
  {
    name: "Groups",
    icon: <MdGroups2 />,
  },
  {
    name: "Archives",
    icon: <IoMdArchive />,
  },
  {
    name: "Notifications",
    icon: <IoNotifications />,
  },
];

export default function LeftSideBar() {
  const {
    user,
    setUser,
    isUserOnRight,
    setIsUserOnRight,
    conversationType,
    setCurrentView,
    currentView,
  } = useUserContext();

  const { socket, setSocket } = useMySocket();

  const handleClick = () => {
    if (conversationType) {
      setIsUserOnRight(!isUserOnRight);
    }
  };

  const logout = async () => {
    try {
      if (user) {
        const res = await axios.get(`/api/logout`);
        if (res.status === 200) {
          // Properly disconnect the socket
          if (socket) {
            socket.disconnect();
            setSocket(null);
          }
          setUser(null);
          toast.success(res.data.msg || "Logged out successfully");
        } else {
          toast.error(res.data.msg || "Failed to log out");
        }
      } else {
        ("User not found. Please login first.");
      }
    } catch (error) {
      error;
      toast.error("An error occurred during logout.");
    }
  };

  return (
    <div className="myProfile">
      <div className="myProfileWrapper">
        <div className="profileImg">
          <img
            className="myProfileImg"
            src={user?.profile}
            alt=""
            onClick={handleClick}
          />
          <span className="onlineBar"></span>
        </div>
        <div className="myProfileMenu">
          <ul className="menuItems">
            {ReactIcons.map((reactIcon) => (
              <button
                key={reactIcon.name}
                className={`icon-button ${
                  currentView === reactIcon.name ? "active" : ""
                }`}
                onClick={() => setCurrentView(reactIcon.name)}
              >
                <i className="icons">{reactIcon.icon}</i>
              </button>
            ))}
          </ul>
        </div>
        <div className="settingOption">
          <button className="icon-button">
            <i className="icons">
              <FaMoon />
            </i>
          </button>
          <button className="icon-button" onClick={logout}>
            <i className="icons">
              <HiOutlineLogout />
            </i>
          </button>
        </div>
      </div>
    </div>
  );
}
