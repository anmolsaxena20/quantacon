import { useEffect } from "react";
import useAuth from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

function Logout() {
  const { setUser, setIsLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setTimeout(()=>{
            toast.error("Invalid session");
            navigate("/dashboard");
        },2000)
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/users/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Logout failed");
        }
        localStorage.removeItem("token");
        setUser(null);
        setIsLogin(false);

        toast.success("Logout successful");

        setTimeout(() => {
          navigate("/login");
        }, 2000);

      } catch (error) {
        console.error("Logout error:", error);

        toast.error("Logout failed. Please try again.");

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    };

    handleLogout();
  }, [navigate, setUser, setIsLogin]);

  return <Toaster />;
}

export default Logout;
