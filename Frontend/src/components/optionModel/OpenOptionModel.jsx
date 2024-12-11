import { useMySocket } from "../../context/SocketContext";
import { useUserContext } from "../../context/Usercontext";
import "./OpenOptionModel.css";

export default function OpenOptionModel({
  conversationId,
  conversationType,
  isArchive,
}) {
  const { user } = useUserContext();
  const { socket } = useMySocket();
  const handleDelete = () => {
    console.log("Delete Button clicked");
  };
  const handleArchive = () => {
    const eventName = isArchive ? "makeUnArchive" : "makeArchive";
    socket.emit(eventName, {
      userId: user._id,
      conversationId,
      conversationType,
    });
  };

  return (
    <div className="openedOption">
      <div onClick={handleDelete}>Delete</div>
      <div onClick={handleArchive}>{isArchive ? "UnArchive" : "Archive"}</div>
    </div>
  );
}
