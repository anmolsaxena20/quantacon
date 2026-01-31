import { createContext, useContext, useEffect, useState } from "react";
import {socket} from "@/socket/socket"
const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const[isLogin,setIsLogin] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setUser(null);
          return;
        }

        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        setUser(null);
        localStorage.removeItem("token");
      } finally {
        setAuthLoading(false);
      }
    };

    fetchMe();
  }, []);
  useEffect(() => {
  if (user) {
    socket.auth = {
      token: localStorage.getItem("token"),
    };
    socket.connect();
  }

  return () => {
    socket.disconnect();
  };
}, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, authLoading ,setIsLogin}}>
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  return useContext(AuthContext);
}
