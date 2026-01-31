import { useEffect, useState, useRef } from "react";
import { Heart, MessageCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import useAuth from "@/Context/AuthContext";


export default function Community() {
  const [tab, setTab] = useState("feed");
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const token = localStorage.getItem("token");
  const videoRefs = useRef({});
  const { user } = useAuth();
  const [openComments, setOpenComments] = useState(null);
  const [openPost, setOpenPost] = useState(null);
const [commentsMap, setCommentsMap] = useState({});
const [limitMap, setLimitMap] = useState({});
const[replyComment,setreplyComment] = useState({});

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
    console.log("postId", postId)
    try {
      const res = await fetch(`http://localhost:5000/api/social/like/post/${postId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const info = await res.json();
      console.log("get info", info);
      fetchFeed();
    } catch {
      toast.error("Like failed");
    }
  };

  const handleLikeReel = async (reelId) => {
    // abhi kam karana hai ispe
    console.log("reelID", reelId);
    try {
      const res = await fetch(`http://localhost:5000/api/social/like/reel/${reelId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const info = await res.json();
      console.log("get info", info);
      fetchReels();
    } catch {
      toast.error("Like failed");
    }
  }


  const handleComment = async (postId, text) => {
    if (!text) return;

    try {
      await fetch(`http://localhost:5000/api/social/comment/post/${postId}`, {
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
  const handleReelComment = async (reelId, text) => {
    // abhi integrate nhi hua hai
    if (!text) return;

    try {
      await fetch(`http://localhost:5000/api/social/comment/reel/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      fetchReels();
    } catch {
      toast.error("Comment failed");
    }
  };
  const togglePlay = (id) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const fetchComments = async (postId, limit = 20) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/social/comments/post/${postId}?limit=${limit}`,
      {
        method:"GET",
        headers:{
          "Authorization":`Bearer ${token}`,
        },
        
      }
    );

    const data = await res.json();
    console.log("data",data);

    setCommentsMap(prev => ({
      ...prev,
      [postId]: data.reverse(), 
    }));

    setLimitMap(prev => ({
      ...prev,
      [postId]: limit,
    }));
  } catch (err) {
    console.error("Failed to fetch comments");
  }
};
 const fetchPostReplyComments = async (postId, limit = 20,parentComment) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/social/comments/post/${postId}?limit=${limit}&parentComment=${parentComment}`,
      {
        method:"GET",
        headers:{
          "Authorization":`Bearer ${token}`,
         
        },
        
        
      }
    );

    const data = await res.json();
    console.log("data",data);

    setreplyComment(prev => ({
      ...prev,
      [postId]: data.reverse(), 
    }));

    setLimitMap(prev => ({
      ...prev,
      [postId]: limit,
    }));
  } catch (err) {
    console.error("Failed to fetch comments",err);
  }
};
const handleReply = async (postId, commentId, text) => {
  if (!text.trim()) return;

  await fetch(`http://localhost:5000/api/social/comment/post/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json","Authorization":`Bearer ${token}` },
    body: JSON.stringify({ text ,parentComment:commentId}),
  });
console.log("posts",posts)
 
  console.log("posts",posts)
};
function CommentSection({ postId, comments, onLoadMore }) {
  const [replyTo, setReplyTo] = useState(null);
const[seeReply,setSeeReply] = useState(false);

  return (
    <div className="mt-2 space-y-3">
      {comments.map(comment => (
        <div key={comment._id}>
          <p className="text-sm">
            <span className="font-semibold">
              {comment.author.name}
            </span>{" "}
            {comment.text}
          </p>
          <div>
          <button
            onClick={() => setReplyTo(comment._id)}
            className="text-xs text-muted-foreground"
          >
            Reply
          </button>
          </div>
           <button
            onClick={() => fetchPostReplyComments(postId,20,comment._id)}
            className="text-xs text-muted-foreground "
          >
           <span className="ml-4"> view Replies</span>
          </button>
        
        

          {/* Replies */}
          <Replies parentId={comment._id} />

          {replyTo === comment._id && (
            <input
              className="ml-4 mt-1 w-full border rounded px-2 py-1 text-sm"
              placeholder="Write a reply..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleReply(postId, comment._id, e.target.value);
                  e.target.value = "";
                  setReplyTo(null);
                }
              }}
            />
          )}
        </div>
      ))}

      {comments.length >= 20&& (
        <button
          onClick={onLoadMore}
          className="text-sm text-muted-foreground"
        >
          View more comments
        </button>
      )}
    </div>
  );
}

 


  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">

      <div className="flex justify-around border-b">
        <button onClick={() => setTab("feed")} className={tab === "feed" ? "font-bold text-blue-500" : ""}>
          Feed
        </button>
        <button onClick={() => setTab("reels")} className={tab === "reels" ? "font-bold text-blue-500" : ""}>
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
         <Heart
                    className={`transition ${post.likes.includes(user?._id)
                      ? "text-red-500 fill-red-500"
                      : "text-gray-500"
                      }`}
                  />
      </button>

    
      <button
        onClick={() => {
          if (openPost === post._id) {
            setOpenPost(null);
          } else {
            setOpenPost(post._id);
            fetchComments(post._id, 20);
          }
        }}
      >
        <MessageCircle />
      </button>

      <span>{post.likes.length} likes</span>
    </div>
 <div className="px-3 pb-3 bg-background">
                <CommentBox
                  onSubmit={(text) => handleComment(post._id, text)}
                />
              </div>
  
    {openPost === post._id && (
      <CommentSection
        postId={post._id}
        comments={commentsMap[post._id] || []}
        onLoadMore={() =>
          fetchComments(
            post._id,
            (limitMap[post._id] || 20) + 20
          )
        }
      />
    )}

  </Card>
)) }


      {tab === "reels" && (
        <div className="space-y-6">
          {reels.map((reel) => (
            <div key={reel._id} className="rounded-lg overflow-hidden bg-black">

              {/* VIDEO */}
              <video
                ref={(el) => (videoRefs.current[reel._id] = el)}
                src={reel.videoUrl}
                className="w-full max-h-[500px] object-cover cursor-pointer"
                loop
                muted
                onClick={() => togglePlay(reel._id)}
              />
              <div className="p-3 text-white bg-black/70">
                <p className="font-semibold">{reel.author?.name}</p>
                <p className="text-sm">{reel.caption}</p>
              </div>
              <div className="flex items-center gap-4 px-3 py-2 bg-background">
                <button onClick={() => handleLikeReel(reel._id)}>
                  <Heart
                    className={`transition ${reel.likes.includes(user?._id)
                      ? "text-red-500 fill-red-500"
                      : "text-gray-500"
                      }`}
                  />
                </button>
                <MessageCircle />
                <span>{reel.likes.length} likes</span>
              </div>
              <div className="px-3 pb-3 bg-background">
                <CommentBox
                  onSubmit={(text) => handleReelComment(reel._id, text)}
                />
              </div>

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


 function Replies({ parentId }) {
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    const fetchReplies = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/social/comments/post/${parentId}`,
        {
          method:"GET",
          headers:{
            "Authorization":`Bearer ${token}`
          }
        }
      );
      const data = await res.json();
      console.log("comments",data)
      setReplies(data.reverse());
    };

    fetchReplies();
  }, [parentId]);

  return (
    <div className="ml-4 space-y-1">
      {replies.map(reply => (
        <p key={reply._id} className="text-sm">
          <span className="font-semibold">
            {reply.author.name}
          </span>{" "}
          {reply.text}
        </p>
      ))}
    </div>
  );
}

