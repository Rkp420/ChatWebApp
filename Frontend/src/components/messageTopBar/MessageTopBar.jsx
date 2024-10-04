import "./MessageTopBar.css";
import { MdWifiCalling } from "react-icons/md";
import { BiSolidUserVoice } from "react-icons/bi";
import { useModel } from "../../provider/ModelProvider";
import { useMySocket } from "../../context/SocketContext";
import { useEffect, useState } from "react";


export default function MessageTopBar({ receiver, typeOfReceiver }) {
  const { openModel } = useModel();
  const { onlineFriends } = useMySocket();
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setlastSeen] = useState("");

  useEffect(() => {
    if (onlineFriends) {
      setIsOnline();
    } else {
      setIsOnline(false);
    }
  }, [onlineFriends]);
  return (
    <div
      className="messageTopbar"
      onClick={() => openModel("ProfileViewModel")}
    >
      <div className="profileAndinfo">
        <div className="friendProfileImg">
          <img
            className="myProfileImg"
            src={
              typeOfReceiver === "IndividualConversation"
                ? receiver?.profile
                : receiver?.group?.profile
            }
            alt="gandu"
          />
          <span className="onlineBar"></span>
        </div>
        <div className="friendProfileInfo">
          {typeOfReceiver === "IndividualConversation" ? (
            <div>
              <h3>{receiver?.username}</h3>
              {isOnline ? <p>Online</p> : <p>Offline</p>}
            </div>
          ) : (
            <div>
              <h3>{receiver?.group?.groupname}</h3>
              <p>{receiver?.group?.bio}</p>
            </div>
          )}
        </div>
      </div>
      <div className="callingOptions">
        <button
          className="icon-button callingButton"
          onClick={(e) => {
            e.stopPropagation();
            console.log("video call");
          }}
        >
          <i className="icons callIcon">
            <MdWifiCalling />
          </i>
        </button>
        <button
          className="icon-button callingButton"
          onClick={(e) => {
            e.stopPropagation();
            console.log("voice call");
          }}
        >
          <i className="icons callIcon">
            <BiSolidUserVoice />
          </i>
        </button>
      </div>
    </div>
  );
}
