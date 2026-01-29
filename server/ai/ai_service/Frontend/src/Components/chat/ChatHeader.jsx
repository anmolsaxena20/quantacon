import { Phone, Video, Info } from "lucide-react";

export default function ChatHeader({ user }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <img
          src={user.image}
          alt={user.name}
          className="w-9 h-9 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold">{user.name}</p>
          <span className="text-xs text-muted-foreground">Active now</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-muted-foreground">
        <Phone className="w-5 h-5 cursor-pointer hover:text-primary" />
        <Video className="w-5 h-5 cursor-pointer hover:text-primary" />
        <Info className="w-5 h-5 cursor-pointer hover:text-primary" />
      </div>
    </div>
  );
}
