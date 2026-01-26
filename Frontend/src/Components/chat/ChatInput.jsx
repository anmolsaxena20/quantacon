import { Smile, Send } from "lucide-react";
import { useState } from "react";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="flex items-center gap-2 p-3 border-t border-border bg-card">
      <Smile className="text-muted-foreground cursor-pointer" />

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Message..."
        className="flex-1 bg-muted rounded-full px-4 py-2 outline-none"
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />

      <button
        onClick={handleSend}
        className="bg-primary text-primary-foreground p-2 rounded-full"
      >
        <Send size={16} />
      </button>
    </div>
  );
}
