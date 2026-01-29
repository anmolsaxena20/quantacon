import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AICoach() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: "1", role: "bot", text: "Hi! I'm your Pulse Fit coach. Need advice on your form or motivation?" }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now().toString(), role: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        
        setTimeout(() => {
            const botMsg = {
                id: (Date.now() + 1).toString(),
                role: "bot",
                text: "That's a great question! Based on your recent activity, I'd suggest focusing on consistency over intensity right now. Keep listening to your body!"
            };
            setMessages((prev) => [...prev, botMsg]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-transform hover:scale-110"
                >
                    <MessageCircle className="h-8 w-8 text-primary-foreground" />
                </Button>
            )}

            {isOpen && (
                <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl border-primary/20 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-primary/5 border-b">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/20 p-2 rounded-full">
                                <Bot className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold">Pulse Coach</CardTitle>
                                <p className="text-xs text-muted-foreground">Online</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                        <ScrollArea className="h-full p-4">
                            <div className="flex flex-col space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm break-words",
                                            msg.role === "user"
                                                ? "ml-auto bg-primary text-white"
                                                : "bg-muted"
                                        )}
                                    >
                                        {msg.text}
                                    </div>
                                ))}
                            </div>
                            <div ref={messagesEndRef} />
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="p-3 border-t">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex w-full items-center space-x-2"
                        >
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your workout..."
                                className="flex-1 text-sm h-10"
                            />
                            <Button type="submit" size="icon" disabled={!input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}