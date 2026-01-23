import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Image, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function CreatePost({ onPost }) {
    const [content, setContent] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const maxLength = 500;

    const handleSubmit = () => {
        if (!content.trim()) return;
        onPost(content);
        setContent("");
        setIsFocused(false);
    };

    return (
        <Card className="border-0 bg-gradient-to-br from-card/80 to-background/40 backdrop-blur-md shadow-sm overflow-hidden mb-6">
            <CardContent className="p-4 sm:p-6">
                <div className="flex gap-4">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary/20 cursor-pointer hover:scale-105 transition-transform">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=guest" />
                        <AvatarFallback>Me</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4" >
                        <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}>
                            <Textarea
                                placeholder="What's on your mind? Share your workout progress..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => !content && setIsFocused(false)}
                                maxLength={maxLength}
                                className="min-h-[100px] resize-none border-0 focus-visible:ring-0 bg-secondary/20 rounded-2xl p-4 text-base placeholder:text-muted-foreground/70"
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-full backdrop-blur-sm">
                                {content.length}/{maxLength}
                            </div>

                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full gap-2 transition-colors">
                                    <Image className="h-4 w-4" />
                                    <span className="hidden sm:inline text-xs">Photo</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-purple-500 hover:bg-purple-500/10 rounded-full gap-2 transition-colors">
                                    <Sparkles className="h-4 w-4" />
                                    <span className="hidden sm:inline text-xs">AI Improve</span>
                                </Button>
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!content.trim()}
                                    className="rounded-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-all px-6 shadow-lg shadow-primary/25"
                                >
                                    <span>Post</span>
                                    <Send className="h-4 w-4 ml-2" />
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}