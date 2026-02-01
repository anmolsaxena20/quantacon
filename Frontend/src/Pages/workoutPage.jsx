import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Pause, Play, RotateCcw, Trophy, AlignLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getExerciseVisuals } from "@/lib/exercise-api";

/* -------------------- helpers -------------------- */

const parseDuration = (str) => {
  if (!str) return 60;
  const [val, unit] = str.split(" ");
  return unit?.startsWith("min") ? Number(val) * 60 : Number(val);
};

const flattenWorkout = (data) => {
  const list = [];

  data.workout?.warmup?.forEach((w) =>
    list.push({ name: w.exercise, reps: w.duration, time: parseDuration(w.duration), type: "warmup" })
  );

  data.workout?.main?.forEach((m) => {
    const sets = m.sets || 1;
    for (let i = 1; i <= sets; i++) {
      list.push({
        name: m.exercise,
        reps: `${m.reps} reps`,
        time: m.rest_seconds || 60,
        type: "main",
        setIndex: i,
        totalSets: sets,
      });
    }
  });

  data.workout?.cooldown?.forEach((c) =>
    list.push({ name: c.exercise, reps: c.duration, time: parseDuration(c.duration), type: "cooldown" })
  );

  return list;
};



const triggerSmallConfetti = () =>
  confetti({ particleCount: 20, spread: 60, origin: { y: 0.8 } });

const triggerWinConfetti = () => {
  const end = Date.now() + 3000;
  const defaults = { spread: 360, ticks: 60, zIndex: 0 };

  const interval = setInterval(() => {
    if (Date.now() > end) return clearInterval(interval);
    confetti({ ...defaults, particleCount: 60, origin: { x: Math.random(), y: Math.random() - 0.2 } });
  }, 250);
};



export default function WorkoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const aiData = state?.aiData;

  useEffect(() => {
    if (!aiData) navigate("/dashboard");
  }, [aiData, navigate]);

  const workout = useMemo(() => flattenWorkout(aiData), [aiData]);

  const [active, setActive] = useState(0);
  const [timer, setTimer] = useState(workout[0]?.time || 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const [visuals, setVisuals] = useState([]);
  const [visualIndex, setVisualIndex] = useState(0);

  const current = workout[active];

 

  useEffect(() => {
    if (!running || timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [running, timer]);

  useEffect(() => {
    if (!current) return;
    setTimer(current.time);
    setRunning(false);
    setVisualIndex(0);
    getExerciseVisuals(current.name).then(setVisuals);
  }, [current]);

  useEffect(() => {
    if (visuals.length <= 1) return;
    const id = setInterval(() => setVisualIndex((i) => (i + 1) % visuals.length), 1200);
    return () => clearInterval(id);
  }, [visuals]);


  const nextExercise = async () => {
    if (active < workout.length - 1) {
      triggerSmallConfetti();
      setActive((i) => i + 1);
    } else {
      triggerWinConfetti();
      toast.success("Workout completed 🎉");
      setDone(true);
    }
  };



  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <Trophy className="h-24 w-24 text-yellow-500" />
        <h1 className="text-3xl font-bold">Workout Complete</h1>
        <p>Consistency Score: {aiData.ai_state.consistency_score * 100}%</p>
        <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

 

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Workout</h1>
          <div className="flex gap-2 mt-1">
            <Badge>{aiData.difficulty}</Badge>
            <Badge variant="secondary">{current.type}</Badge>
          </div>
        </div>
        <Badge>{active + 1} / {workout.length}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* PLAN */}
        <Card className="hidden lg:flex flex-col">
          <CardHeader>
            <CardTitle className="flex gap-2"><AlignLeft /> Plan</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1 px-4 pb-4">
            {workout.map((ex, i) => (
              <motion.div
                key={`${ex.name}-${i}`}
                animate={{ opacity: i === active ? 1 : 0.5 }}
                className={cn(
                  "p-3 rounded-xl mb-2 border",
                  i === active && "border-primary bg-primary/10"
                )}
              >
                <div className="font-medium">{ex.name}</div>
                <Badge variant="secondary">{ex.reps}</Badge>
              </motion.div>
            ))}
          </ScrollArea>
        </Card>

        {/* ACTIVE */}
        <Card className="lg:col-span-2 flex flex-col justify-center items-center">
          <CardContent className="space-y-6 text-center">
            <h2 className="text-4xl font-bold">{current.name}</h2>
            <Badge className="text-lg">{current.reps}</Badge>

            <div className="text-7xl font-mono">{timer}</div>

            <div className="flex gap-4 justify-center">
              <Button size="icon" variant="outline" onClick={() => setTimer(current.time)}>
                <RotateCcw />
              </Button>
              <Button size="icon" onClick={() => setRunning((v) => !v)}>
                {running ? <Pause /> : <Play />}
              </Button>
            </div>

            <div className="w-full max-w-lg aspect-video rounded-xl overflow-hidden bg-muted">
              {visuals.length > 0 && (
                <img
                  src={visuals[visualIndex]}
                  alt={current.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <Button size="lg" onClick={nextExercise}>
              {active < workout.length - 1 ? "Complete Exercise" : "Finish Workout"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
