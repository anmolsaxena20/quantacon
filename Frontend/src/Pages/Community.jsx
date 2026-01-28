import { useEffect, useState } from "react";
import { Heart, MessageCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function Community() {
  const [tab, setTab] = useState("feed");
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (tab === "feed") fetchFeed();
    if (tab === "reels") fetchReels();
  }, [tab]);

  const fetchFeed = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/social/feed", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("fetched feed", data)
      setPosts(data);
    } catch {
      toast.error("Failed to load feed");
    }
  };

  const fetchReels = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/social/reels", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("fetched reel", data)
      setReels(data);
    } catch {
      toast.error("Failed to load reels");
    }
  };


  const handleLike = async (postId) => {
    console.log("postId",postId)
    try {
      const res = await fetch(`http://localhost:5000/api/social/like/${postId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const info = await res.json();
      console.log("get info",info);
      fetchFeed();
    } catch {
      toast.error("Like failed");
    }
  };


  const handleComment = async (postId, text) => {
    if (!text) return;

    try {
      await fetch(`http://localhost:5000/api/social/comment/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      fetchFeed();
    } catch {
      toast.error("Comment failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">

      <div className="flex justify-around border-b">
        <button onClick={() => setTab("feed")} className={tab === "feed" ? "font-bold" : ""}>
          Feed
        </button>
        <button onClick={() => setTab("reels")} className={tab === "reels" ? "font-bold" : ""}>
          Reels
        </button>
      </div>


      {tab === "feed" &&
        posts.map((post) => (
          <Card key={post._id} className="p-3 space-y-2">
            <div className="font-semibold">
              {post.author.name}
              {post.author.isVerifiedUser && " ✔️"}
            </div>

            <img
              src={post.mediaUrl}
              alt="post"
              className="rounded-md w-full object-cover"
            />

            <p className="text-sm">{post.caption}</p>

            <div className="flex items-center gap-4">
              <button onClick={() => handleLike(post._id)}>
                <Heart />
              </button>
              <MessageCircle />
              <span>{post.likes.length} likes</span>
            </div>

            <CommentBox onSubmit={(text) => handleComment(post._id, text)} />
          </Card>
        ))}


      {tab === "reels" && (
        <div className="space-y-6">
          {reels.map((reel) => (
            <div key={reel._id} className="relative">
              <video
                src={reel.videoUrl}
                className="rounded-lg w-full"
                autoPlay
                loop
                muted
              />
              <div className="absolute bottom-3 left-3 text-white">
                <p className="font-semibold">{reel.author?.name}</p>
                <p className="text-sm">{reel.caption}</p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => handleLike(reel?._id)}>
                  <Heart />
                </button>
                <MessageCircle />
                <span>{reel.likes.length} likes</span>
              </div>

              <CommentBox onSubmit={(text) => handleComment(reel?._id, text)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function CommentBox({ onSubmit }) {
  const [text, setText] = useState("");

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Add a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button
        size="sm"
        onClick={() => {
          onSubmit(text);
          setText("");
        }}
      >
        Post
      </Button>
    </div>
  );
}
