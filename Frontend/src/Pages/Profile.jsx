import { useEffect, useState } from "react";
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
  const { user, setUser } = useAuth()
  console.log("fetched user inprofile", user)
  const [profile, setProfile] = useState({
    name: "Guest User",
    email: "guest@pulsefit.com",
    height: "175",
    weight: "72",
    image: "",
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchProfile = async () => {

      setProfile({
        name: user.name,
        email: user.email,
        height: user.height || "175",
        weight: user.weight || "75",
        image: user.picture || "",
      });

    };
    fetchProfile();


  }, [user])

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto text-white">
      <Toaster />
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground text-sm">
          Manage your personal information
        </p>
      </div>

      <Card className="bg-card/80 backdrop-blur border-border/50">
        <CardHeader className="flex flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center text-3xl font-bold">
              {profile.name.charAt(0)}
            </div>

            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center">
              <Camera size={16} />
            </button>
          </div>

          <div>
            <CardTitle className="text-xl">{profile.name}</CardTitle>
            <CardDescription>{profile.email}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 mt-4">

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <Input
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!editing}
                className="bg-background/50"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <Input
                name="email"
                value={profile.email}
                disabled
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">
                Height (cm)
              </label>
              <Input
                name="height"
                value={profile.height}
                onChange={handleChange}
                disabled={!editing}
                className="bg-background/50"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">
                Weight (kg)
              </label>
              <Input
                name="weight"
                value={profile.weight}
                onChange={handleChange}
                disabled={!editing}
                className="bg-background/50"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            {editing ? (
              <>
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Save Changes
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = "/pricing"}
                >
                  Manage Subscription
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
