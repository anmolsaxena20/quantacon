import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../Context/AuthContext";
import toast, { Toaster } from 'react-hot-toast';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const[goal,setGoal] = useState(null);
  const[height,setHeight]=useState("");
  const[weight,setWeight] = useState("")
  const { setUser, setIsLogin } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("password didn't match")
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("height",height);
    formData.append("weight",weight);
    if (profileImage) {
      formData.append("picture", profileImage)
    }
    try {
      const res = await fetch("http://localhost:5000/auth/signup",
        {
          method: "POST",
          body: formData
        }
      )
      if (!res.ok) throw new Error(`Error ${res.status}:${res.statusText}`)
      const data = await res.json();
      setUser(data);
      setIsLogin(true);
      localStorage.setItem("token", data.accessToken);
      navigate("/profile");
    } catch (error) {
      toast.error("signup failed");
      console.log("error in signup", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-black/90 border-b border-white/10">
      <div className="w-full max-w-md bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl hover:border-purple-500/50">
        <Toaster />
        <div className="text-center">
          <div className="flex justify-center mb-3 text-3xl">💪</div>
          <h1 className="text-2xl font-bold text-white">
            Create Your Account
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Start your fitness journey today
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm mb-2 text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-xl bg-black/70 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

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
           <div>
            <label className="block text-sm mb-2 text-gray-300">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-black/70 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-300">
              Weight(in Kg)
            </label>
            <input
              type="text"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="weight in kg"
              className="w-full px-4 py-3 rounded-xl bg-black/70 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
                    <div>
            <label className="block text-sm mb-2 text-gray-300">
             Height(in cm)
            </label>
            <input
              type="text"
              required
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Height in cm"
              className="w-full px-4 py-3 rounded-xl bg-black/70 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-300">
              Select Profile Image
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-black/70 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 overflow-hidden"
              accept="image/*"
              type="file"
              alt=""
              onChange={() => setProfileImage(e.target.files[0])}
              value={profileImage}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 font-semibold text-white hover:opacity-90 transition hover:scale-90"
          >
            Create Account
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-400 hover:text-purple-300"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
