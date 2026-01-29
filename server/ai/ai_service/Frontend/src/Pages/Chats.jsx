import { useNavigate } from "react-router-dom";

export default function Chats() {
  const navigate = useNavigate();

  const chats = [
    { id: 1, name: "Alex", last: "See you at gym " },
    { id: 2, name: "Sarah", last: "Workout done!" },
  ];

  return (
    <div className="max-w-md mx-auto">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => navigate(`/chat/${chat.id}`)}
          className="flex items-center gap-3 px-4 py-3 border-b border-border cursor-pointer hover:bg-muted"
        >
          <div className="w-10 h-10 bg-primary/20 rounded-full" />
          <div>
            <p className="font-medium">{chat.name}</p>
            <span className="text-sm text-muted-foreground">
              {chat.last}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
