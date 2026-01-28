import React, { createContext, useState, useContext, useEffect } from 'react'
import toast from 'react-hot-toast';
const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState();
  useEffect(() => {
    const fetchUserDetail = async () => {

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("invalid user");
          return;
        }
        const res = await fetch("http://localhost:5000/api/users/me",
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        )
        if (!res.ok) throw new Error("error in fetching detail")
        const detail = await res.json();
        setUser(detail.user)
        setIsLogin(true);
      } catch (error) {
        console.log("error", error)
      }
    }
    fetchUserDetail();
  }, [])
  return (
    <AuthContext.Provider value={{ isLogin, setIsLogin, user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default function useAuth() {
  return useContext(AuthContext);
}
