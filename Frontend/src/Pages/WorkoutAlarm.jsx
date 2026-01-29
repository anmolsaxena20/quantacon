import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CreateWorkoutAlarm() {
  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [loading, setLoading] = useState(false);

const handleCreateAlarm = async () => {
  if (!title || !dateTime) {
    toast.error("Please fill all fields");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) return toast.error("Invalid session");

  setLoading(true);

  try {
    const res = await fetch(
      "http://localhost:5000/api/workout/calendar/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, dateTime }),
      }
    );

    // 🔐 OAuth must redirect here
    if (res.status === 401) {
      window.location.href = "http://localhost:5000/api/calendar/google";
      return;
    }

    if (!res.ok) throw new Error();

    toast.success("Workout alarm created ⏰💪");
    setTitle("");
    setDateTime("");
  } catch (err) {
    toast.error("Failed to create workout alarm");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-xl mx-auto p-6">
      <Card className="bg-card/80 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-xl text-purple-400">
            Create Workout Reminder
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Workout Title</Label>
            <Input
              placeholder="Enter workout details"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Date & Time</Label>
            <Input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>

          <Button
            onClick={handleCreateAlarm}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? "Creating..." : "Create Alarm"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
