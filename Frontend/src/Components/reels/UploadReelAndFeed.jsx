import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function CreatePostReel() {
  const token = localStorage.getItem("token");

  const [postCaption, setPostCaption] = useState("");
  const [postFile, setPostFile] = useState(null);

  const [reelCaption, setReelCaption] = useState("");
  const [reelFile, setReelFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const createPost = async (e) => {
    e.preventDefault();
    if (!postFile) return toast.error("Select an image");

    setLoading(true);
    const formData = new FormData();
    formData.append("caption", postCaption);
    formData.append("file", postFile);

    try {
      const res = await fetch(`http://localhost:5000/api/social/post`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error();
      toast.success("Post created");

      setPostCaption("");
      setPostFile(null);
    } catch {
      toast.error("Post failed");
    } finally {
      setLoading(false);
    }
  };

  const createReel = async (e) => {
    e.preventDefault();
    if (!reelFile) return toast.error("Select a video");

    setLoading(true);
    const formData = new FormData();
    formData.append("caption", reelCaption);
    formData.append("file", reelFile);

    try {
      const res = await fetch(`http://localhost:5000/api/social/reel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error();
      toast.success("Reel uploaded");

      setReelCaption("");
      setReelFile(null);
    } catch {
      toast.error("Reel upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-8 p-4">
      {/* CREATE POST */}
      <Card className="bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Create Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createPost} className="space-y-4">
            <Input
              placeholder="Write a caption..."
              value={postCaption}
              onChange={(e) => setPostCaption(e.target.value)}
            />
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setPostFile(e.target.files[0])}
            />
            <Button className="w-full" disabled={loading}>
              {loading ? "Posting..." : "Post"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* CREATE REEL */}
      <Card className="bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Create Reel</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createReel} className="space-y-4">
            <Input
              placeholder="Write a caption..."
              value={reelCaption}
              onChange={(e) => setReelCaption(e.target.value)}
            />
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => setReelFile(e.target.files[0])}
            />
            <Button className="w-full" disabled={loading}>
              {loading ? "Uploading..." : "Upload Reel"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
