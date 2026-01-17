import React,{ useState } from "react";
import { Link } from "react-router-dom";
import logout from "../Pages/LogoutPage";
import useAuth from "../Context/AuthContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const {isLogin,user} = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-black/70 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            💪
          </div>
          <span className="text-white font-bold text-xl tracking-wide">
            Synopsis
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-300">
          <Link className="hover:text-white transition" to="/programs">Programs</Link>
          <Link className="hover:text-white transition" to="/articles">Articles</Link>
          <Link className="hover:text-white transition" to="/community">Community</Link>
          <Link className="hover:text-white transition" to="/support">Support</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {(!isLogin && 
          <>
          <Link
            to="/login"
            className="text-gray-300 hover:text-white transition"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-full bg-linear-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition"
          >
            Get Started
          </Link>
          </>
          )}
          {(isLogin && 
          <>
          <button 
          className="px-4 py-2 rounded-full bg-linear-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition"
          onClick={logout}
          >
            Logout
          </button>
            <Link
            to="/profile"
            className="px-4 py-2 rounded-full bg-linear-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition"
          >
            Profile
          </Link>
          </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-black/90 border-t border-white/10">
          <nav className="flex flex-col p-6 gap-4 text-gray-300">
            <Link to="/programs" onClick={() => setOpen(false)}>Programs</Link>
            <Link to="/articles" onClick={() => setOpen(false)}>Articles</Link>
            <Link to="/community" onClick={() => setOpen(false)}>Community</Link>
            <Link to="/support" onClick={() => setOpen(false)}>Support</Link>
            <Link
              to="/login"
              className="mt-2 text-white"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="mt-2 text-center px-4 py-2 rounded-full bg-linear-to-r from-purple-500 to-pink-500 text-white"
              onClick={() => setOpen(false)}
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
