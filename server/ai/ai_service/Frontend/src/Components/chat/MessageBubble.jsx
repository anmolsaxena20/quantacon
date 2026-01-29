export default function MessageBubble({ message }) {
  const isMe = message.createdBy;

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} px-4`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm
          ${isMe
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"}
        `}
      >
        {message.text}
      </div>
    </div>
  );
}
