import { Link, useNavigate } from "react-router-dom";
import { Search, MessageCircle, Clapperboard, User, House,Upload } from "lucide-react";
import { useState } from "react";
import UserSearch from "../search/UserSearch";

export default function Navbar() {
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full h-14 bg-card border-b border-border z-50">
      <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-4">


        <Link to="/dashboard" >
          <div className="font-heading text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent animate-in fade-in duration-300">
            Pulse Fit
          </div>
        </Link>


        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/dashboard")}>
            <House className="w-5 h-5" />
          </button>
           <button onClick={() => navigate("reel")}>
            <Upload className="w-5 h-5" />
          </button>
          <button onClick={() => setShowSearch(!showSearch)}>
            <Search className="w-5 h-5" />
          </button>

          <button onClick={() => navigate("social")}>
            <Clapperboard className="w-5 h-5" />
          </button>

          <button onClick={() => navigate("chats")}>
            <MessageCircle className="w-5 h-5" />
          </button>

          <button onClick={() => navigate("profile-setup")}>
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showSearch && <UserSearch />}
    </nav>
  );
}
