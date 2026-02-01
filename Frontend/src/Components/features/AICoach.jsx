import { useState, useRef, useLayoutEffect } from "react";
import {
  Input,
} from "@/Components/ui/input"
import{Button} from "@/Components/ui/button"
import { ScrollArea } from "@/Components/ui/scroll-area"
import {  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,} from "@/Components/ui/card"
  import { Badge } from "lucide-react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Plus,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";

const EXERCISES = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Abs",
  "Cardio",
];

export default function AICoach() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "bot",
      text: "Hi! I'm your Pulse Fit coach. Need advice on your form or motivation?",
    },
  ]);
  const [input, setInput] = useState("");
  const [showExercises, setShowExercises] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);

  const scrollRef = useRef(null);

  /* ---------- AUTO SCROLL (FIXED) ---------- */
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isOpen]);

  /* ---------- TOGGLE EXERCISES ---------- */
  const toggleExercise = (ex) => {
    setSelectedExercises((prev) =>
      prev.includes(ex)
        ? prev.filter((e) => e !== ex)
        : [...prev, ex]
    );
  };

  /* ---------- SEND MESSAGE ---------- */
  const handleSend = async () => {
    if (!input.trim() && selectedExercises.length === 0) return;

    const token = localStorage.getItem("token");
    if (!token) return toast.error("Invalid session");

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      text: input || selectedExercises.join(", "),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setShowExercises(false);

    try {
      const res = await fetch(
        "http://localhost:5000/api/ai/chat/guidance",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            additonal_context: input,
            exercise: selectedExercises.join(" ") ||"", 
          }),
        }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      console.log("data",data)

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "bot",
          coachData: data,
        },
      ]);
    } catch {
      toast.error("Unable to fetch coach response");
    }

    setSelectedExercises([]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Toaster />

      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-xl"
        >
          <MessageCircle className="h-8 w-8" />
        </Button>
      )}

      {isOpen && (
        <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl">
          {/* HEADER */}
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">Pulse Coach</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          {/* CHAT BODY */}
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div ref={scrollRef} className="p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      msg.role === "user"
                        ? "ml-auto bg-primary text-white"
                        : "bg-muted"
                    )}
                  >
                    {msg.text && <p>{msg.text}</p>}
                    {msg.coachData && (
                      <CoachResponseCard data={msg.coachData} />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>

         
          <CardFooter className="border-t p-3 flex flex-col gap-2">
            {showExercises && (
              <div className="flex flex-wrap gap-2">
                {EXERCISES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => toggleExercise(ex)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-full border",
                      selectedExercises.includes(ex)
                        ? "bg-primary text-white"
                        : "bg-muted"
                    )}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setShowExercises((p) => !p)}
              >
                <Plus className="h-4 w-4" />
              </Button>

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your workout..."
                className="flex-1"
              />

              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}


function CoachResponseCard({ data }) {
  return (
    <Card className="mt-2 bg-background/60">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="capitalize text-sm">
            {data.exercise}
          </CardTitle>
          <Badge className="capitalize">{data.difficulty_level}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm">{data.guidance}</p>

        <ul className="space-y-2">
          {data.tips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
              {tip}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
