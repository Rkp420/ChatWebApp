import "./SentMessage.css";
export default function SentMessage({ message }) {
  return (
    <div className="messageContainer">
      <div className="sentMessage">{message}</div>
    </div>
  );
}
