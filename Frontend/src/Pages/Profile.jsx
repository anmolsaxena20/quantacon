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
import { Camera, Check, BadgeCheck } from "lucide-react";
import { Toaster, toast } from "sonner";
import useAuth from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const { user, setUser } = useAuth();
  console.log("user in profile", user)

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    height: "",
    weight: "",
    image: "",
    gender: "",
    tier: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [isOtp, setIsOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showList, setShowList] = useState(null);
  const [bmi, setBmi] = useState(null);

  useEffect(() => {
    if (profile.height && profile.weight) {
      const h = parseFloat(profile.height) / 100; // cm to m
      const w = parseFloat(profile.weight);
      if (h > 0 && w > 0) {
        const bmiValue = (w / (h * h)).toFixed(1);
        setBmi(bmiValue);
      } else {
        setBmi(null);
      }
    }
  }, [profile.height, profile.weight]);

  const getBmiCategory = (bmi) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-400" };
    if (bmi < 24.9) return { label: "Normal Weight", color: "text-green-400" };
    if (bmi < 29.9) return { label: "Overweight", color: "text-yellow-400" };
    return { label: "Obese", color: "text-red-400" };
  };
  useEffect(() => {
    if (!user) return;

    setProfile({
      name: user.name,
      email: user.email,
      height: user.height || "175",
      weight: user.weight || "75",
      image: user.picture || "",
      gender: user.gender || "",
      tier: user.tier || "free"
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
      if (!res.ok) {
        toast.error("error in updating profile picture");

        return;
      }
      console.log("data", data);


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
            <div className={`w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center p-1 ${profile.tier === 'gold' ? 'bg-gradient-to-tr from-yellow-300 via-yellow-500 to-yellow-600 shadow-[0_0_20px_rgba(234,179,8,0.5)]' : profile.tier === 'silver' ? 'bg-gradient-to-tr from-slate-300 via-slate-400 to-slate-500 shadow-[0_0_20px_rgba(148,163,184,0.5)]' : 'border-transparent'}`}>
              {profile.image ? (
                <img
                  src={profile.image}
                  alt="profile"
                  className="w-full h-full object-cover"
                />

              ) : (
                <span className="text-3xl font-bold">
                  {profile.name?.[0]}<span><Check color="#2321c0" /></span>
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
            <CardTitle className="text-xl flex items-center gap-2">
              {profile.name}
              {profile.tier === 'gold' && <BadgeCheck className="text-yellow-500 fill-yellow-500 text-white w-6 h-6 drop-shadow-md" />}
              {profile.tier === 'silver' && <BadgeCheck className="text-slate-400 fill-slate-400 text-white w-6 h-6 drop-shadow-md" />}
            </CardTitle>

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

          {bmi && (
            <div className="mt-2 p-4 bg-muted/10 rounded-lg flex items-center justify-between border border-border/50">
              <div>
                <p className="text-sm text-gray-400">Your BMI</p>
                <p className="text-2xl font-bold">{bmi}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Category</p>
                <p className={`text-lg font-semibold ${getBmiCategory(bmi).color}`}>
                  {getBmiCategory(bmi).label}
                </p>
              </div>
            </div>
          )}
          <div className="flex gap-4 w-full">
            <button
              onClick={() => setShowList("followers")}
              className="flex-1 bg-muted/10 hover:bg-muted/20 border border-border/50 rounded-xl p-4 transition-all hover:scale-[1.02] active:scale-[0.98] group text-left"
            >
              <p className="text-sm text-gray-400 font-medium group-hover:text-primary/80 transition-colors">Followers</p>
              <p className="text-3xl font-heading font-bold mt-1 group-hover:text-primary transition-colors">
                {user?.followers?.length || 0}
              </p>
            </button>

            <button
              onClick={() => setShowList("following")}
              className="flex-1 bg-muted/10 hover:bg-muted/20 border border-border/50 rounded-xl p-4 transition-all hover:scale-[1.02] active:scale-[0.98] group text-left"
            >
              <p className="text-sm text-gray-400 font-medium group-hover:text-primary/80 transition-colors">Following</p>
              <p className="text-3xl font-heading font-bold mt-1 group-hover:text-primary transition-colors">
                {user?.following?.length || 0}
              </p>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md bg-card/95 border-border shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
              <CardHeader className="flex flex-row justify-between items-center border-b border-border/50 pb-4">
                <CardTitle className="text-xl capitalize font-heading flex items-center gap-2">
                  <span className="bg-primary/10 text-primary p-2 rounded-full">
                    {showList === "followers" ? "👥" : "👣"}
                  </span>
                  {showList}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={() => setShowList(null)}
                >
                  ✕
                </Button>
              </CardHeader>

              <CardContent className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
                {user?.[showList]?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-3">
                    <span className="text-4xl">📭</span>
                    <p className="text-sm">No {showList} found</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {user[showList].map((u) => (
                      <div
                        key={u._id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-all group border border-transparent hover:border-border/50 cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img
                              src={u.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                              alt={u.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-background shadow-sm group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{u.name}</p>
                            <p className="text-xs text-muted-foreground">User</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

      </Card>
    </div>
  );
}
