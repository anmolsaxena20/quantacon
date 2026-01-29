import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Camera } from "lucide-react";
import { Toaster, toast } from "sonner";
import useAuth from "../Context/AuthContext";

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const { user, setUser } = useAuth();

  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    height: "",
    weight: "",
    image: "",
    gender: "",
  });

  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!user) return;

    setProfile({
      name: user.name,
      email: user.email,
      height: user.height || "175",
      weight: user.weight || "75",
      image: user.picture || "",
      gender: user.gender || "",
    });
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setProfile((prev) => ({
      ...prev,
      image: URL.createObjectURL(file),
    }));
  };

  const updateProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Invalid session");

    try {
      const res = await fetch("http://localhost:5000/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          height: profile.height,
          weight: profile.weight,
          gender: profile.gender,
        }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setUser(data.user);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setEditing(false);
    }
  };

 const updateProfilePicture = async () => {
  if (!imageFile) return toast.error("Select an image first");

  const token = localStorage.getItem("token");
  if (!token) return toast.error("Invalid session");

  const formData = new FormData();
  formData.append("media", imageFile); 

  try {
    const res = await fetch("http://localhost:5000/api/users/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error();

    setUser(data.user); 
    toast.success("Profile picture updated");
  } catch {
    toast.error("Failed to update picture");
  }
};


  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto text-white">
      <Toaster />

      <Card className="bg-card/80 backdrop-blur border-border/50">
        <CardHeader className="flex flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold">
                  {profile.name?.[0]}
                </span>
              )}
               <button
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center"
            >
              <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageSelect}
            />
              <Camera size={16} />
            </button>
            </div>
          </div>

          <div>
            <CardTitle className="text-xl">{profile.name}</CardTitle>
            <CardDescription>{profile.email}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input name="name" value={profile.name} onChange={handleChange} disabled={!editing} />
            <Input name="email" value={profile.email} disabled />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input name="height" value={profile.height} onChange={handleChange} disabled={!editing} />
            <Input name="weight" value={profile.weight} onChange={handleChange} disabled={!editing} />
          </div>

          <div className="flex justify-end gap-3">
            {imageFile && (
              <Button onClick={updateProfilePicture} variant="outline">
                Save Picture
              </Button>
            )}

            {editing ? (
              <>
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button className="bg-purple-600" onClick={updateProfile}>
                  Save Changes
                </Button>
              </>
            ) : (
              <Button className="bg-purple-600" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
