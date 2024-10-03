import './ReceivedMessage.css'
export default function ReceivedMessage({message}) {
  return (
    <div className='receivedMessageContainer'>
      <div className="receivedMessage">{message}</div>
    </div>
  );
}
