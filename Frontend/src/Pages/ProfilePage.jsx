import React, { useRef, useState,useEffect } from "react";
import useAuth from "../Context/AuthContext"
import toast, { Toaster } from "react-hot-toast";
import {Pencil} from "lucide-react"

export default function Profile() {
  const { user ,isLogin} = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    id:user?.id ? user.id : "",
    name: user?.name || "John Doe",
    email: user?.email || "john@sweat.com",
    height: "175 cm",
    weight: "72 kg",
    goal: "Build Muscle",
    picture:""
  });
  const fileRef = useRef(null);
  const handleIconClick = ()=>{
    fileRef.current.click();
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    const fetchProfile = () => {
      if (isLogin) {
        setForm(user);
      }
    };
    fetchProfile();
  }, [user]);

  const updateProfilePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("picture", file);
    formData.append("id", user._id ? user._id : user.id)
    console.log("formData", form)
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/auth/update",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        }
      )
      if (!res.ok) toast.error("unable to update profile picture");
      const data = await res.json();
      console.log("updated user after picture", data)
      setForm((prev) => ({ ...prev, picture: data.picture }))
    } catch (error) {
      console.log("Error in changing the profile picture", error)
    }
  }
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/auth/update",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      )
      if (!res.ok) toast.error("failed to update profile");
      const data = await res.json();
      setForm(data.user);
      setEditing(false);
      console.log("Updated profile:", form);
    } catch (error) {
      console.log("Error in updating profile", error)
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 text-white  bg-black/90 border-b border-white/10 ">
   
              <div className="relative w-36 h-36 mx-auto mb-4">
          <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-200 ">
            <img
              src={form.picture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <button onClick={handleIconClick}
              className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-full shadow hover:bg-indigo-700 transition cursor-pointer"

            >
              <Pencil size={16} />
            </button>
            <input type="file" ref={fileRef} accept="image/*" hidden onChange={updateProfilePicture} />
          </div>
        </div>

      <div className="mt-16 grid lg:grid-cols-3 gap-8">
        <Toaster />
        <Card title="Personal Information">
          <ProfileField
            label="Full Name"
            name="name"
            value={form.name}
            editing={editing}
            onChange={handleChange}
          />
          <ProfileField
            label="Email"
            name="email"
            value={form.email}
           
            onChange={handleChange}
          />
          <ProfileField
            label="Height"
            name="height"
            value={form.height}
            editing={editing}
            onChange={handleChange}
          />
          <ProfileField
            label="Weight"
            name="weight"
            value={form.weight}
            editing={editing}
            onChange={handleChange}
          />
        </Card>
      </div>
      <div className="mt-12 flex flex-wrap gap-4">
        {editing ? (
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-full bg-amber-500/20 font-semibold"
          >
            Save Changes
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/10"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/50">
      <h3 className="text-lg font-semibold mb-4 text-pink-400">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ProfileField({ label, name, value, editing, onChange }) {
  return (
    <div>
      <label className="block text-sm text-amber-400 mb-1">{label}</label>
      {editing ? (
        <input
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-xl bg-black/70 border border-white/10 text-white hover:border-purple-500/50"
        />
      ) : (
        <p className="text-gray-300">{value}</p>
      )}
    </div>
  );
}
