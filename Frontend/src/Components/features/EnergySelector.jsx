import { useState } from "react";
import { Clock, Trophy, Flame, PlayCircle, Moon, Battery, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "react-hot-toast";
import { toast } from "sonner";
export default function EnergySelector() {
    const [level, setLevel] = useState(null);
    const [hidden, setHidden] = useState(false);
    const[workout,setWorkout] = useState([]);

    const options = [
        { value: "low", label: "Low", icon: Moon, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400" },
        { value: "medium", label: "Medium", icon: Battery, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400" },
        { value: "high", label: "High", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400" },
    ];
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const Easyworkout = [
        { name: "Push-ups", sets: "3 sets x 12 reps" },
        { name: "Dumbbell Press", sets: "3 sets x 10 reps" },
        { name: "Lateral Raises", sets: "3 sets x 15 reps" }
    ]
    const Mediumworkout = [
        { name: "Push-ups", sets: "5 sets x 12 reps" },
        { name: "Dumbbell Press", sets: "5 sets x 10 reps" },
        { name: "Lateral Raises", sets: "5 sets x 15 reps" }
    ]
    const Hardworkout = [
        { name: "Push-ups", sets: "9 sets x 12 reps" },
        { name: "Dumbbell Press", sets: "9 sets x 10 reps" },
        { name: "Lateral Raises", sets: "9 sets x 15 reps" }
    ]

    const fetchWorkout = async(e)=>{
        setLevel(e.target.value);
        console.log("",e.target.value)
        try {
            const token = localStorage.getItem("token");
            if(!token) return;
            const res = fetch("http://localhost:5000/api/workout/generate",{
                method:"POST",
                headers:{
                    "Authorization":`Bearer ${token}`,
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({energyLevel:e.target.value})
            })
            if(!res.ok){
                toast.error("Error in fetching workout based on energy level");
                console.log(res)
                return;
            }
            const data = await res.json();
            console.log("wokout received",data);
            setWorkout(data);
        } catch (error) {
            console.log("Erro in fetching workout");
        }
    }

    return (
        <Card className="border-border/50">
            <Toaster/>
            <CardHeader>
                <CardTitle className="text-lg">How is your energy today?</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        value={opt.value}
                        onClick={fetchWorkout}
                        className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all hover:scale-105",
                            level === opt.value
                                ? `${opt.border} ${opt.bg}`
                                : "border-transparent bg-secondary/50 hover:bg-secondary"
                        )}
                    >
                        <opt.icon className={cn("h-6 w-6 mb-2", opt.color)} />
                        <span className="font-medium text-sm">{opt.label}</span>
                    </button>
                ))}
            </CardContent>
            {(level == 'low' || level == "medium" || level == "high") &&
                <motion.div variants={item} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="border-primary/20 shadow-lg bg-gradient-to-br from-card to-primary/5 cursor-pointer">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge className="mb-2 bg-primary/20 text-primary hover:bg-primary/30">Strength Focus</Badge>
                                    <CardTitle className="text-2xl">{workout?.title}</CardTitle>
                                    <CardDescription>Estimated time: {workout?.estimatedTime} mins <span className="text-red-400">Difficulty:</span><span className="text-pink-400"> {workout?.difficulty}</span></CardDescription>
                                </div>
                                <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-glow animate-pulse">
                                    <Clock className="h-6 w-6" />
                                </div>
                            </div>

                        </CardHeader>
                        <CardContent>

                            {level  &&
                                <div className="space-y-2">
                                    {workout?.exercises?.map((ex, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-background/50 rounded-lg hover:bg-background/80 transition-colors">
                                            <span className="font-medium">{i + 1}. {ex?.name}</span>
                                            <span className="text-muted-foreground">{ex?.sets}</span>
                                            <span className="text-muted-foreground">{ex?.reps}</span>
                                            <span className="text-muted-foreground">{ex?.duration}</span>
                                            <span className="text-muted-foreground">{ex?.xp}</span>
                                        </div>
                                    ))}
                                </div>
                            }
                        </CardContent>
                        <CardFooter>
                            <Button size="lg" className="w-full text-lg shadow-lg shadow-primary/20 group" onClick={() => window.location.href = '/workout'}>
                                <PlayCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> Start Workout
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            }
        </Card>
    );
}
