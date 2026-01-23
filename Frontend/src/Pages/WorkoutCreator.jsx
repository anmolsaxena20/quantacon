import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { EXERCISE_LIBRARY } from "@/data/exercises";
import { Dumbbell, Clock, Flame, ChevronRight, Play, RefreshCw, Layers, X, Plus, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function WorkoutCreator() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const [selectedIntensity, setSelectedIntensity] = useState("Medium");
    const [selectedBodyParts, setSelectedBodyParts] = useState(["Full Body"]);
    const [duration, setDuration] = useState([30]);

    const [generatedWorkout, setGeneratedWorkout] = useState([]);

    const intensities = ["Low", "Medium", "High"];
    const bodyParts = [
        "Full Body", "Chest", "Back", "Shoulders", "Biceps", "Triceps", "Legs", "Core", "Cardio"
    ];

    const toggleBodyPart = (part) => {
        if (part === "Full Body") {
            setSelectedBodyParts(["Full Body"]);
            return;
        }

        let updated = [...selectedBodyParts];
        if (updated.includes("Full Body")) {
            updated = [];
        }

        if (updated.includes(part)) {
            updated = updated.filter(p => p !== part);
        } else {
            updated.push(part);
        }

        if (updated.length === 0) {
            updated = ["Full Body"];
        }

        setSelectedBodyParts(updated);
    };

    const generateWorkout = () => {
        let pool = EXERCISE_LIBRARY.filter(ex => {
            const intensityMatch =
                selectedIntensity === 'Medium' ? true :
                    ex.intensity === selectedIntensity || ex.intensity === 'Medium';

            const bodyPartMatch = selectedBodyParts.includes("Full Body")
                ? true
                : selectedBodyParts.includes(ex.bodyPart) || ex.bodyPart === "Full Body" || ex.bodyPart === "Cardio";

            return intensityMatch && bodyPartMatch;
        });

        if (pool.length < 3) {
            pool = EXERCISE_LIBRARY.filter(ex =>
                selectedBodyParts.includes("Full Body") ? true : selectedBodyParts.includes(ex.bodyPart)
            );
        }

        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 6);

        setGeneratedWorkout(selected);
        setStep(2);
        toast.success("Workout generated! Customize any details below.");
    };

    const updateExercise = (index, field, value) => {
        const updated = [...generatedWorkout];
        updated[index] = { ...updated[index], [field]: value };
        setGeneratedWorkout(updated);
    };

    const swapExercise = (index, newExercise) => {
        const updated = [...generatedWorkout];
        updated[index] = newExercise;
        setGeneratedWorkout(updated);
        toast.success(`Swapped to ${newExercise.name}`);
    };

    const startWorkout = () => {
        navigate("/workout", { state: { workout: generatedWorkout } });
    };

    const getAlternatives = (currentExercise) => {
        return EXERCISE_LIBRARY.filter(ex =>
            ex.bodyPart === currentExercise.bodyPart &&
            ex.name !== currentExercise.name
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="text-center space-y-4">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
                >
                    Custom Workout Builder
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-muted-foreground"
                >
                    Design your perfect session by muscle group.
                </motion.p>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-xl shadow-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-2xl">
                                    <Layers className="h-6 w-6 text-primary" /> Workout Parameters
                                </CardTitle>
                                <CardDescription>Select target muscles and intensity.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-lg font-medium flex items-center gap-2">
                                        <Flame className="h-5 w-5 text-orange-500" /> Intensity Level
                                    </Label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {intensities.map((level) => (
                                            <div
                                                key={level}
                                                onClick={() => setSelectedIntensity(level)}
                                                className={cn(
                                                    "cursor-pointer rounded-xl border-2 p-4 text-center transition-all hover:scale-105 active:scale-95",
                                                    selectedIntensity === level
                                                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                                                        : "border-muted bg-card hover:border-primary/50"
                                                )}
                                            >
                                                <div className="font-bold text-lg">{level}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-lg font-medium flex items-center gap-2">
                                        <Dumbbell className="h-5 w-5 text-blue-500" /> Target Areas
                                    </Label>
                                    <div className="flex flex-wrap gap-3">
                                        {bodyParts.map((part) => {
                                            const isSelected = selectedBodyParts.includes(part);
                                            return (
                                                <div
                                                    key={part}
                                                    onClick={() => toggleBodyPart(part)}
                                                    className={cn(
                                                        "cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-all hover:scale-105 active:scale-95",
                                                        isSelected
                                                            ? "border-primary bg-primary text-primary-foreground shadow-md"
                                                            : "border-muted bg-card hover:border-primary/50"
                                                    )}
                                                >
                                                    {part}
                                                    {isSelected && <Plus className="ml-2 h-3 w-3 inline-block" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Select multiple areas to create a split routine (e.g., Chest + Triceps).</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-lg font-medium flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-green-500" /> Duration
                                        </Label>
                                        <span className="text-xl font-bold font-mono text-primary">{duration} min</span>
                                    </div>
                                    <Slider
                                        value={duration}
                                        onValueChange={setDuration}
                                        min={10}
                                        max={60}
                                        step={5}
                                        className="py-4"
                                    />
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full text-lg h-14 rounded-xl shadow-xl shadow-primary/25 mt-4 group"
                                    onClick={generateWorkout}
                                >
                                    Generate Workout <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold font-heading">Your Custom Plan</h2>
                            <Button variant="outline" onClick={() => setStep(1)}>
                                <RefreshCw className="mr-2 h-4 w-4" /> Adjust Parameters
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            {generatedWorkout.map((exercise, index) => (
                                <motion.div
                                    key={index + exercise.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="border border-border/50 hover:border-primary/50 transition-colors group relative">
                                        <div className="absolute top-2 right-2 flex gap-1 z-10">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-secondary/50 hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-colors" title="Swap exercise">
                                                        <Shuffle className="h-3.5 w-3.5" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80 p-0" align="end">
                                                    <div className="p-3 border-b font-semibold bg-muted/50">
                                                        Swap {exercise.name}
                                                    </div>
                                                    <ScrollArea className="h-64 p-2">
                                                        <div className="space-y-1">
                                                            {getAlternatives(exercise).map(alt => (
                                                                <div
                                                                    key={alt.name}
                                                                    className="flex flex-col p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                                                                    onClick={() => swapExercise(index, alt)}
                                                                >
                                                                    <span className="font-medium text-sm">{alt.name}</span>
                                                                    <span className="text-xs text-muted-foreground">{alt.description}</span>
                                                                </div>
                                                            ))}
                                                            {getAlternatives(exercise).length === 0 && (
                                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                                    No other exercises found for {exercise.bodyPart}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </ScrollArea>
                                                </PopoverContent>
                                            </Popover>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    const updated = generatedWorkout.filter((_, i) => i !== index);
                                                    setGeneratedWorkout(updated);
                                                    toast("Exercise removed from plan");
                                                }}
                                                className="h-8 w-8 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors"
                                                title="Remove exercise"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-16">
                                                <div className="font-bold text-lg truncate">{exercise.name}</div>
                                                <div className="text-sm text-muted-foreground truncate">{exercise.description}</div>
                                                <div className="flex gap-2 mt-2">
                                                    <Badge variant="secondary" className="text-xs">{exercise.intensity}</Badge>
                                                    <Badge variant="outline" className="text-xs">{exercise.bodyPart}</Badge>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 shrink-0 w-24">
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Reps</Label>
                                                    <Input
                                                        className="h-8 text-xs bg-muted/50"
                                                        value={exercise.reps}
                                                        onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Secs</Label>
                                                    <Input
                                                        className="h-8 text-xs bg-muted/50"
                                                        type="number"
                                                        value={exercise.time}
                                                        onChange={(e) => updateExercise(index, 'time', parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        <Button
                            size="lg"
                            className="w-full text-lg h-16 rounded-xl shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                            onClick={startWorkout}
                        >
                            <Play className="mr-2 h-6 w-6 fill-current" /> Start Workout
                        </Button>
                    </motion.div>
                )}
            </ AnimatePresence>
        </div>
    );
}
