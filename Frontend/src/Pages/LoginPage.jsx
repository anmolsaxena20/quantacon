import React,{ useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../Context/AuthContext"
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
const {user,setUser,isLogin,setIsLogin}  = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/auth/login",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({email,password})
        } 
      )
      if(!res.ok) toast.error("login failed");
      const data = await res.json();
      localStorage.setItem("token",data.accessToken);
      setIsLogin(true);
      setUser(data);
      toast.success("Login successfull")
    } catch (error) {
      console.log("error in login user",error)
     toast.error("login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-black/90 border-b border-white/10">
      <div className="w-full max-w-md bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl hover:border-purple-500/50">
         <Toaster />
        <div className="text-center">
          <div className="flex justify-center mb-3 text-3xl">💪</div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-400">
            Log in to continue your fitness journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm mb-2 text-gray-300">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-black/70 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-300">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-black/70 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 font-semibold text-white hover:opacity-90 transition hover:scale-90"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-purple-400 hover:text-purple-300"
          >
            Sign up
          </Link>
        </div>

        <div className="mt-3 text-center text-sm">
          <Link
            to="/forgot-password"
            className="text-gray-500 hover:text-gray-300"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
