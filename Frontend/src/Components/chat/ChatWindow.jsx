import { useEffect, useRef, useState } from "react";
import { useParams ,useLocation} from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useAuth from "@/Context/AuthContext";
import { socket } from "@/socket/socket";
import { Plus } from "lucide-react";


export default function ChatWindow() {
 
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
const fileInputRef = useRef(null);


  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const { chatId } = useParams();
const { state } = useLocation();

const userInfo = state?.user;
console.log("user info",userInfo)


  const fetchChatInfo = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/social/chat/${chatId}/info`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setChatInfo(data);
    } catch (err) {
      console.error("Failed to load chat info");
    }
  };

 const fetchMessages = async (pageNo = 1) => {
  if (!chatId || loading || !hasMore) return;

  try {
    setLoading(true);

    const res = await fetch(
      `http://localhost:5000/api/social/chat/${chatId}?limit=20&page=${pageNo}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();

    if (data.length < 20) setHasMore(false);

    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m._id));

      const uniqueNew = data.filter(
        (m) => !existingIds.has(m._id)
      );

      return [...uniqueNew, ...prev];
    });
  } catch (err) {
    console.error("Failed to fetch messages", err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (!chatId) return;

    setMessages([]);
    setPage(1);
    setHasMore(true);

    fetchChatInfo();
    fetchMessages(1);

    socket.emit("join_chat", { chatId });

    const handleReceive = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    socket.off("receiveMessage");
    socket.on("receiveMessage", handleReceive);

    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);


  const uploadMedia = async () => {
    const formData = new FormData();
    formData.append("media", file);

    const res = await fetch(
      "http://localhost:5000/api/social/chat/media",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    const data = await res.json();
    return data.url;
  };

  const handleFileSelect = (e) => {
  const selected = e.target.files[0];
  if (!selected) return;

  setFile(selected);

  const previewUrl = URL.createObjectURL(selected);
  setPreview(previewUrl);
   fileInputRef.current.value = "";
};
useEffect(() => {
  return () => {
    if (preview) URL.revokeObjectURL(preview);
  };
}, [preview]);


const sendMessage = async () => {
  if (!text.trim() && !file) return;

  let content = text;
  let messageType = "text";

  if (file) {
    const mediaUrl = await uploadMedia();
    content = mediaUrl;
    messageType = file.type.startsWith("video") ? "video" : "image";
  }

  socket.emit("send_message", {
    chatId,
    content,
    messageType,
  });

  setText("");
  setFile(null);
  setPreview(null);
};



  const renderMessage = (msg, isMe) => {
    if (msg.messageType === "image")
      return <img src={msg.content} className="max-w-[240px] rounded-lg mb-2" />;

    if (msg.messageType === "video")
      return <video src={msg.content} controls className="max-w-[260px]" />;

    return <p >{msg.content}</p>;
  };

  const otherUser =
    chatInfo?.members?.find((m) => m._id !== user._id);

  return (
    <div className="flex flex-col h-full bg-background">
      
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <img
          src={userInfo?.picture || "/default-avatar.png"}
          className="w-10 h-10 rounded-full object-cover"
        />
        <p className="font-medium">{userInfo?.name}</p>
      </div>

      <div
        ref={containerRef}
        onScroll={() => {
          if (
            containerRef.current.scrollTop === 0 &&
            hasMore &&
            !loading
          ) {
            const next = page + 1;
            setPage(next);
            fetchMessages(next);
          }
        }}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 overscroll-behavior: contain"
      >
        {messages.map((msg) => {
          const isMe =
            msg.sender === user._id ||
            msg.sender?._id === user._id;

          return (
            <div
              key={msg._id}
              className={`flex ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-2xl max-w-[70%] text-sm mb-8 ${
                  isMe
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-muted rounded-bl-none"
                }`}
              >
                {renderMessage(msg, isMe)}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {preview && (
  <div className="relative p-2 border-t bg-muted">
    <button
      onClick={() => {
        setFile(null);
        setPreview(null);
      }}
      className="absolute top-1 right-1 bg-black/60 text-white rounded-full px-2"
    >
      ✕
    </button>

    {file.type.startsWith("image") ? (
      <img
        src={preview}
        className="max-h-64 rounded-lg mx-auto"
        alt="preview"
      />
    ) : (
      <video
        src={preview}
        controls
        className="max-h-64 rounded-lg mx-auto"
      />
    )}
  </div>
)}


     
       <div className="border-t p-3  flex items-center gap-2 w-full fixed bottom-0  bg-black">
        <input
          type="file"
          accept="image/*,video/*"
          ref={fileInputRef}
          hidden
          id="media"
          onChange={ handleFileSelect}
        />
        <label htmlFor="media" className="cursor-pointer text-xl">
          <Plus/>
        </label>

        <Input
          value={text}
          placeholder="Message..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}

