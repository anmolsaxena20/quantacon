import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Pause,
  Play,
  RotateCcw,
  Trophy,
  AlignLeft
} from "lucide-react";
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
];

export default function Workout() {
  const location = useLocation();
  const navigate = useNavigate();

  /* ---------- 🔥 DATA FIX (ONLY IMPORTANT CHANGE) ---------- */
  const rawWorkout = location.state?.workout;

  const workoutTitle = rawWorkout?.title || "Upper Body Power";

  const normalizedWorkout = rawWorkout?.exercises
    ? rawWorkout.exercises.map((ex) => ({
        name: ex.name,
        reps: ex.reps || "-",
        time: ex.duration || 45,
        xp: ex.xp || 0,
      }))
    : DEFAULT_WORKOUT;

  const [workout] = useState(normalizedWorkout);
 

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
      setVisuals(images || []);
    };
    loadVisuals();
  }, [current.name]);

  useEffect(() => {
    if (visuals.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentVisualIndex((prev) => (prev + 1) % visuals.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [visuals]);

  const toggleTimer = () => setIsActive(!isActive);

  const triggerSmallConfetti = () => {
    confetti({ particleCount: 30, spread: 360, startVelocity: 20 });
  };

  const triggerWinConfetti = () => {
    const end = Date.now() + 3000;
    const interval = setInterval(() => {
      if (Date.now() > end) return clearInterval(interval);
      confetti({ particleCount: 40, spread: 360 });
    }, 250);
  };

  const nextExercise = () => {
    if (activeExercise < workout.length - 1) {
      triggerSmallConfetti();
      setActiveExercise((p) => p + 1);
      setTimer(workout[activeExercise + 1].time);
      setIsActive(false);
    } else {
      setIsComplete(true);
      triggerWinConfetti();
    }
  };

 
  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] space-y-6"
      >
        <Trophy className="h-24 w-24 text-yellow-500" />
        <h1 className="text-4xl font-heading font-bold">Workout Complete!</h1>
        <Button size="lg" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </motion.div>
    );
  }

 
  return (
    <div className="max-w-6xl mx-auto space-y-8 h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">
            {workoutTitle}
          </h1>
          <p className="text-muted-foreground">Focus on form and control.</p>
        </div>
        <Badge variant="outline">
          {activeExercise + 1} / {workout.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">

        {/* LEFT PLAN */}
        <Card className="hidden lg:flex lg:col-span-1 flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlignLeft className="h-5 w-5" /> Workout Plan
            </CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1 px-6 pb-6">
            {workout.map((ex, i) => (
              <div
                key={i}
                className={cn(
                  "p-4 rounded-xl mb-3 border",
                  i === activeExercise
                    ? "border-primary bg-primary/10"
                    : "border-border"
                )}
              >
                <div className="font-medium">{ex.name}</div>
                <Badge variant="secondary" className="mt-1">
                  {ex.reps}
                </Badge>
              </div>
            ))}
          </ScrollArea>
        </Card>

       
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-8 text-center space-y-6">
              <h2 className="text-5xl font-heading font-bold">
                {current.name}
              </h2>
              <Badge className="text-lg">{current.reps}</Badge>

             
              <div className="text-7xl font-mono">{timer}</div>

              <div className="flex justify-center gap-4">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setTimer(current.time)}
                >
                  <RotateCcw />
                </Button>
                <Button size="lg" onClick={toggleTimer}>
                  {isActive ? <Pause /> : <Play />}
                </Button>
              </div>
            </CardContent>

            <div className="p-6 border-t flex justify-end">
              <Button size="lg" onClick={nextExercise}>
                {activeExercise < workout.length - 1
                  ? "Complete Exercise"
                  : "Finish Workout"}
                <CheckCircle className="ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
