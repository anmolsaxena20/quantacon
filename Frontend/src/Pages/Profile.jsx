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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Camera ,Check} from "lucide-react";
import { Toaster, toast } from "sonner";
import useAuth from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const { user, setUser } = useAuth();
  console.log("user in profile",user)

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    height: "",
    weight: "",
    image: "",
    gender: "",
    tier:""
  });

  const [imageFile, setImageFile] = useState(null);
  const [isOtp, setIsOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showList, setShowList] = useState(null);
  useEffect(() => {
    if (!user) return;

    setProfile({
      name: user.name,
      email: user.email,
      height: user.height || "175",
      weight: user.weight || "75",
      image: user.picture || "",
      gender: user.gender || "",
      tier:user.tier ||"free"
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


  const handleOtpVerify = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Invalid session");

    try {
      const res = await fetch("http://localhost:5000/api/users/request-otp", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      toast.success("OTP sent to your email");
      setIsOtp(true);
    } catch (error) {
      toast.error("Failed to send OTP");
    }
  };

  const updatePassword = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Invalid session");

    if (otp.length !== 6 || !newPassword) {
      toast.error("OTP & new password required");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/update-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp, newPassword: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error();

      toast.success(data.message);
      setIsOtp(false);
      setOtp("");
      setNewPassword("");
    } catch {
      toast.error("Password update failed");
      navigate("/commuity/profile-setup")
    } finally {
      setIsLoading(false);
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
                    {profile.name?.[0]}<span><Check color="#2321c0"/></span>
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
            <CardTitle className="text-xl flex">{profile.name}{profile.tier!="free" &&<Check color="#2321c0"/>}</CardTitle>
           
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
            <Input name="weight" value={profile.gender} onChange={handleChange} disabled={!editing} />
          </div>
          <div className="flex gap-6 justify-start text-sm">
            <button
              onClick={() => setShowList("followers")}
              className="hover:underline"
            >
              <span className="font-semibold">
                {user?.followers?.length || 0}
              </span>{" "}
              Followers
            </button>

            <button
              onClick={() => setShowList("following")}
              className="hover:underline"
            >
              <span className="font-semibold">
                {user?.following?.length || 0}
              </span>{" "}
              Following
            </button>
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
            <Button className="bg-purple-600" onClick={handleOtpVerify}>
              updatePassword
            </Button>
          </div>
          {isOtp && (
            <div className="space-y-4 text-center items-centre">
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit OTP sent to your email
              </p>
              <div className="flex justify-center items-center">
                <InputOTP
                  value={otp} onChange={setOtp} maxLength={6}>
                  <InputOTPGroup>
                    {[0, 1, 2].map((i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    {[3, 4, 5].map((i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Input name="newPassword" value={newPassword} required onChange={(e) => setNewPassword(e.target.value)} />
              <Button className="w-full" onClick={updatePassword} disabled={isLoading}>
                Verify OTP & Update Password
              </Button>
            </div>
          )}
        </CardContent>
        {showList && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <Card className="w-full max-w-md bg-card border-border">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-lg capitalize">
                  {showList}
                </CardTitle>
                <Button variant="ghost" onClick={() => setShowList(null)}>
                  ✕
                </Button>
              </CardHeader>

              <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
                {user?.[showList]?.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center">
                    No {showList} yet
                  </p>
                ) : (
                  user[showList].map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center gap-3"
                    >
                      <img
                        src={u.picture}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-medium">{u.name}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}

      </Card>
    </div>
  );
}
