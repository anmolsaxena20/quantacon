import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, MessageCircle, MoreHorizontal, Send, Share2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function PostCard({ post, currentUserId, onLike, onComment }) {
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [commentText, setCommentText] = useState("");

    const isLiked = post.likes.includes(currentUserId);
    const likeCount = post.likes.length;
    const commentCount = post.comments.length;

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        onComment(post.id, commentText);
        setCommentText("");
    };

    const timeAgo = (timestamp) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border-0 bg-card/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between p-4 pb-0">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-primary/20">
                            <AvatarImage src={post.userAvatar} alt={post.userName} />
                            <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-sm leading-none">{post.userName}</p>
                            <p className="text-xs text-muted-foreground mt-1">{timeAgo(post.timestamp)}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    {post.image && (
                        <div className="mt-3 rounded-xl overflow-hidden">
                            <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-96" />
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col p-0 bg-black/5 dark:bg-white/5">
                    <div className="flex items-center justify-between w-full px-4 py-2 border-t border-b border-border/50">
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onLike(post.id)}
                                className={cn(
                                    "gap-2 h-9 px-3 hover:bg-red-500/10 hover:text-red-500 transition-colors",
                                    isLiked && "text-red-500"
                                )}
                            >
                                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                                <span className="text-xs font-medium">{likeCount > 0 ? likeCount : 'Like'}</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                                className={cn("gap-2 h-9 px-3", isCommentsOpen && "bg-accent text-accent-foreground")}
                            >
                                <MessageCircle className="h-4 w-4" />
                                <span className="text-xs font-medium">{commentCount > 0 ? commentCount : 'Comment'}</span>
                            </Button>
                        </div>

                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>

                    <AnimatePresence>
                        {isCommentsOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="w-full overflow-hidden"
                            >
                                <div className="p-4 space-y-4">
                                    <form onSubmit={handleCommentSubmit} className="flex gap-2">
                                        <Avatar className="h-8 w-8 hidden sm:block">
                                            <AvatarImage src={`https://github.com/shadcn.png`} />
                                            <AvatarFallback>Me</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                type="text"
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                placeholder="Write a comment..."
                                                className="flex-1 bg-background/50 rounded-full px-4 text-sm border focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                            <Button
                                                type="submit"
                                                size="icon"
                                                disabled={!commentText.trim()}
                                                className="h-9 w-9 rounded-full shrink-0"
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </form>

                                    {post.comments.length > 0 && (
                                        <ScrollArea className="max-h-60 pr-2">
                                            <div className="space-y-4">
                                                {post.comments.map((comment) => (
                                                    <div key={comment.id} className="flex gap-3 text-sm">
                                                        <Avatar className="h-8 w-8 shrink-0">
                                                            <AvatarImage src={comment.userAvatar} />
                                                            <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 bg-background/40 p-3 rounded-2xl rounded-tl-none">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-semibold text-xs">{comment.userName}</span>
                                                                <span className="text-[10px] text-muted-foreground">{timeAgo(comment.timestamp)}</span>
                                                            </div>
                                                            <p className="text-muted-foreground text-xs leading-relaxed">{comment.content}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
