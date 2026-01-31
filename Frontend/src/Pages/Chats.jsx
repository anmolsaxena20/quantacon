import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import useAuth from "@/Context/AuthContext";


export default function Chats() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Invalid session");

      try {
        const res = await fetch("http://localhost:5000/api/social/chat", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        const formattedChats = data.map(chat => {
          const otherUser = chat.members.find(m => m._id !== user._id);
          console.log("other user",otherUser)
          console.log("chat",chat)
          return {
            chatId: chat._id,
            name: otherUser.name,
            picture: otherUser.picture || "",
            lastMessage: chat.lastMessage?.text || "",
          };
        });

        setChats(formattedChats);
      } catch (err) {
        toast.error("Failed to fetch chats");
      }
    };

     fetchChats();
     console.log("chats ",chats);
    
    
    
  }, []);


  return (
    <div className="max-w-md mx-auto">
      <Toaster />

      {chats.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center">
          No chats found
        </p>
      ) : (
        chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() =>
              navigate(`/community/chat/${chat.chatId}`, {
                state: {
                  user: {
                    name: chat.name,
                    picture: chat.picture,
                  },
                },
              })
            }
            className="flex items-center gap-3 px-4 py-3 border-b border-border cursor-pointer hover:bg-muted"
          >
           
            <img
              src={chat?.picture}
              alt={chat?.name}
              className="w-10 h-10 rounded-full object-cover bg-muted"
            />

            
            <div className="flex-1">
              <p className="font-medium">
                {chat?.name}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {chat?chat.messageType=="text"?chat.lastMessage:"Media sent" : "No messages yet"}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
