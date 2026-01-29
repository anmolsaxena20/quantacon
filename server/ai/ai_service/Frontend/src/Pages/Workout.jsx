import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Pause, Play, RotateCcw, Trophy, AlignLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getExerciseVisuals } from "@/lib/exercise-api";

const DEFAULT_WORKOUT = [
    { name: "Push-ups", reps: "12 reps", time: 45 },
    { name: "Dumbbell Press", reps: "10 reps", time: 60 },
    { name: "Lateral Raises", reps: "15 reps", time: 45 },
    { name: "Tricep Dips", reps: "12 reps", time: 45 },
    { name: "Bicep Curls", reps: "12 reps", time: 45 },
    { name: "Shoulder Press", reps: "10 reps", time: 60 },
];

export default function Workout() {
    const location = useLocation();
    const navigate = useNavigate();
    const initialWorkout = location.state?.workout || DEFAULT_WORKOUT;


    const [workout] = useState(initialWorkout);
    const [activeExercise, setActiveExercise] = useState(0);
    const [timer, setTimer] = useState(workout[0].time);
    const [isActive, setIsActive] = useState(false);
    const [isComplete, setIsComplete] = useState(false);


    const [visuals, setVisuals] = useState([]);
    const [currentVisualIndex, setCurrentVisualIndex] = useState(0);

    const current = workout[activeExercise];


    useEffect(() => {
        let interval;
        if (isActive && timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        } else if (timer === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timer]);


    useEffect(() => {
        const loadVisuals = async () => {
            setVisuals([]);
            setCurrentVisualIndex(0);
            const images = await getExerciseVisuals(current.name);
            setVisuals(images);
        };
        loadVisuals();
    }, [current.name]);


    useEffect(() => {
        if (visuals.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentVisualIndex(prev => (prev + 1) % visuals.length);
        }, 1000);
        return () => clearInterval(interval);
    }, [visuals]);

    const toggleTimer = () => setIsActive(!isActive);

    const triggerSmallConfetti = () => {
        const defaults = { startVelocity: 20, spread: 360, ticks: 50, zIndex: 0 };
        const random = (min, max) => Math.random() * (max - min) + min;
        confetti({ ...defaults, particleCount: 30, origin: { x: random(0.5, 0.7), y: Math.random() - 0.2 } });
    };

    const nextExercise = () => {
        if (activeExercise < workout.length - 1) {
            triggerSmallConfetti();
            setActiveExercise((prev) => prev + 1);
            setTimer(workout[activeExercise + 1].time);
            setIsActive(false);
        } else {
            setIsComplete(true);
            triggerWinConfetti();
        }
    };

    const triggerWinConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const random = (min, max) => Math.random() * (max - min) + min;

        const interval = window.setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    if (isComplete) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8"
            >
                <div className="relative">
                    <motion.div
                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                        className="h-32 w-32 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center shadow-xl relative z-10"
                    >
                        <Trophy className="h-16 w-16 text-yellow-600 dark:text-yellow-400" />
                    </motion.div>
                    <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-xl animate-pulse" />
                </div>

                <div className="space-y-2">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl font-heading font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent"
                    >
                        Workout Crushed!
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-xl text-muted-foreground"
                    >
                        You finished strong. Energy adjusted perfectly.
                    </motion.p>
                </div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg shadow-primary/25" onClick={() => navigate("/dashboard")}>
                        Back to Dashboard
                    </Button>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 h-[calc(100vh-140px)]">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-heading font-bold">Upper Body Power</h1>
                    <p className="text-muted-foreground">Focus on form and control.</p>
                </div>
                <Badge variant="outline" className="px-4 py-2 text-base">{activeExercise + 1} / {workout.length}</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">

                <Card className="hidden lg:flex lg:col-span-1 flex-col h-full border-2 border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <AlignLeft className="h-5 w-5" /> Workout Plan
                        </CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex-1 px-6 pb-6">
                        <div className="space-y-3">
                            {workout.map((ex, i) => (
                                <motion.div
                                    key={i}
                                    layout
                                    initial={false}
                                    animate={{
                                        opacity: i === activeExercise ? 1 : i < activeExercise ? 0.5 : 0.8,
                                        scale: i === activeExercise ? 1.02 : 1,
                                        x: i === activeExercise ? 4 : 0,
                                    }}
                                    className={cn(
                                        "flex items-center p-4 rounded-xl border transition-all cursor-default mb-3 relative overflow-hidden",
                                        i === activeExercise
                                            ? "border-primary/50 shadow-md bg-gradient-to-r from-primary/10 to-transparent"
                                            : "border-transparent hover:bg-muted/50 hover:border-border/50"
                                    )}
                                >

                                    {i === activeExercise && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                    )}

                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center mr-4 text-base font-bold shadow-sm transition-all relative z-10",
                                        i < activeExercise
                                            ? "bg-green-500/10 text-green-600 border border-green-500/20"
                                            : i === activeExercise
                                                ? "bg-primary text-primary-foreground shadow-primary/30 shadow-lg"
                                                : "bg-muted text-muted-foreground border border-border"
                                    )}>
                                        {i < activeExercise ? <CheckCircle className="h-5 w-5" /> : i + 1}
                                    </div>

                                    <div className="flex-1 relative z-10">
                                        <div className={cn(
                                            "font-heading text-lg tracking-tight transition-colors",
                                            i === activeExercise ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                                        )}>
                                            {ex.name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge variant={i === activeExercise ? "default" : "secondary"} className={cn("text-[10px] px-1.5 h-5", i !== activeExercise && "opacity-70")}>
                                                {ex.reps}
                                            </Badge>
                                            {i === activeExercise && (
                                                <span className="text-xs text-primary font-medium animate-pulse">In Progress</span>
                                            )}
                                        </div>
                                    </div>

                                    {i === activeExercise && (
                                        <div className="relative z-10">
                                            <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </ScrollArea>
                </Card>


                <div className="lg:col-span-2 flex flex-col h-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeExercise}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            <Card className="h-full border-2 border-primary/20 shadow-2xl overflow-hidden relative flex flex-col">

                                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                                <CardContent className="p-8 flex flex-col flex-1 justify-center items-center space-y-8 relative z-10 w-full">
                                    <div className="text-center space-y-2">
                                        <h2 className="text-5xl font-heading font-bold">{current.name}</h2>
                                        <Badge variant="secondary" className="text-lg px-4 py-1">{current.reps}</Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl items-center mt-8">

                                        <div className="flex flex-col items-center justify-center">
                                            <div className="relative h-64 w-64 flex items-center justify-center group">
                                                <div className="absolute inset-0 rounded-full border-8 border-muted" />
                                                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                                                    <circle
                                                        cx="50" cy="50" r="45" fill="none" stroke="currentColor"
                                                        className="text-primary transition-all duration-1000 ease-linear drop-shadow-lg"
                                                        strokeWidth="8"
                                                        strokeDasharray="283"
                                                        strokeDashoffset={283 - (283 * timer) / current.time}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div className="flex flex-col items-center">
                                                    <div className="text-7xl font-mono font-bold tracking-tighter">{timer}</div>
                                                    <span className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Seconds</span>
                                                </div>


                                                <div className="absolute -bottom-8 flex gap-4">
                                                    <Button size="icon" variant="outline" className="h-12 w-12 rounded-full border-2" onClick={() => setTimer(current.time)}>
                                                        <RotateCcw className="h-5 w-5" />
                                                    </Button>
                                                    <Button size="lg" className="h-16 w-16 rounded-full shadow-xl shadow-primary/30 active:scale-95 transition-transform" onClick={toggleTimer}>
                                                        {isActive ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>


                                        <div className="flex flex-col items-center space-y-4">
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className="w-full aspect-video bg-black/5 rounded-2xl flex items-center justify-center relative overflow-hidden group border-2 border-border/50 shadow-inner cursor-pointer"
                                            >
                                                {visuals.length > 0 ? (
                                                    <div className="relative w-full h-full">
                                                        <AnimatePresence mode="wait">
                                                            <motion.img
                                                                key={visuals[currentVisualIndex]}
                                                                src={visuals[currentVisualIndex]}
                                                                alt={current.name}
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                transition={{ duration: 0.5 }}
                                                                className="absolute inset-0 w-full h-full object-cover"
                                                            />
                                                        </AnimatePresence>
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                                                        <Badge className="absolute bottom-4 right-4 bg-black/60 z-20 backdrop-blur-md">
                                                            Visual Guide
                                                        </Badge>
                                                    </div>
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                        <div className="text-muted-foreground font-medium border-2 border-dashed border-muted-foreground/30 rounded-xl px-6 py-4">
                                                            Video Placeholder
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                            <p className="text-sm text-muted-foreground text-center">
                                                {visuals.length > 0 ? "Follow the visual guide for proper form." : "Proper form is key. Watch the demo before starting."}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-6 border-t bg-black/5 flex justify-end">
                                    <Button size="lg" className="px-8 text-lg" onClick={nextExercise}>
                                        {activeExercise < workout.length - 1 ? "Complete Exercise" : "Finish Workout"} <CheckCircle className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
