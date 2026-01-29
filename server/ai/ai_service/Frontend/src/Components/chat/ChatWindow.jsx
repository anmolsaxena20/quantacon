import { socket } from "@/socket/socket";
import useChatStore from "@/Context/ChatStore";
import React,{useEffect} from "react"

export default function ChatWindow({ roomId =1}) {
  const { messages, addMessage } = useChatStore();
  useEffect(() => {
    socket.emit("join_room", roomId);

    socket.on("receive_message", (msg) => {
      addMessage(msg);
    });

    return () => socket.off("receive_message");
  }, []);

  const sendMessage = (text) => {
    socket.emit("send_message", { roomId, text });
    addMessage({ text, self: true });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={msg.self ? "text-right" : ""}>
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
}
