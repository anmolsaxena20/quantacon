import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dumbbell, Clock, Flame, CheckCircle2, ChevronRight, ChevronLeft, Ruler, Weight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
    { title: "Welcome", description: "Let's get to know you." },
    { title: "Body Stats", description: "This helps us personalize your plan." },
    { title: "Your Goal", description: "What motivates you?" },
    { title: "Experience", description: "How fit are you?" },
    { title: "Availability", description: "How much time do you have?" },
    { title: "All Set", description: "Creating your plan..." },
];

export default function ProfileSetup() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        name: "",
        height: "",
        weight: "",
        goal: "",
        level: "",
        time: "",
    });

    const progress = ((step + 1) / STEPS.length) * 100;

    const calculateBMI = () => {
        const h = parseFloat(formData.height) / 100; 
        const w = parseFloat(formData.weight);
        if (!h || !w) return { bmi: 0, status: "Unknown", color: "text-muted-foreground" };

        const bmi = w / (h * h);
        let status = "Normal";
        let color = "text-green-500";

        if (bmi < 18.5) {
            status = "Underweight";
            color = "text-blue-500";
        } else if (bmi >= 25 && bmi < 29.9) {
            status = "Overweight";
            color = "text-yellow-500";
        } else if (bmi >= 30) {
            status = "Obese";
            color = "text-red-500";
        }

        return { bmi: bmi.toFixed(1), status, color };
    };

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            navigate("/dashboard");
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const updateField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const bmiData = calculateBMI();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
            <div className="w-full max-w-lg space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-heading font-bold text-primary">Setup Profile</h1>
                    <p className="text-muted-foreground">Step {step + 1} of {STEPS.length}</p>
                    <Progress value={progress} className="h-2" />
                </div>

                <Card className="border-border/50 shadow-md">
                    <CardHeader>
                        <CardTitle>{STEPS[step].title}</CardTitle>
                        <CardDescription>{STEPS[step].description}</CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[300px] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {step === 0 && (
                            <div className="space-y-4">
                                <label className="text-sm font-medium">What should we call you?</label>
                                <Input
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    className="text-lg p-6"
                                />
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Ruler className="h-4 w-4" /> Height (cm)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="175"
                                        value={formData.height}
                                        onChange={(e) => updateField("height", e.target.value)}
                                        className="text-lg p-6"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Weight className="h-4 w-4" /> Weight (kg)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="70"
                                        value={formData.weight}
                                        onChange={(e) => updateField("weight", e.target.value)}
                                        className="text-lg p-6"
                                    />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="grid gap-3">
                                {["Lose Fat", "Gain Strength", "Stay Active"].map((goal) => (
                                    <button
                                        key={goal}
                                        onClick={() => updateField("goal", goal)}
                                        className={cn(
                                            "flex items-center p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left",
                                            formData.goal === goal ? "border-primary bg-primary/10 ring-1 ring-primary" : "bg-card"
                                        )}
                                    >
                                        <div className="h-10 w-10 bg-background rounded-full flex items-center justify-center border mr-4">
                                            {goal === "Lose Fat" && <Flame className="h-5 w-5 text-orange-500" />}
                                            {goal === "Gain Strength" && <Dumbbell className="h-5 w-5 text-blue-500" />}
                                            {goal === "Stay Active" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                                        </div>
                                        <span className="font-medium text-lg">{goal}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {step === 3 && (
                            <div className="grid gap-3">
                                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => updateField("level", level)}
                                        className={cn(
                                            "p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center",
                                            formData.level === level ? "border-primary bg-primary/10 ring-1 ring-primary" : "bg-card"
                                        )}
                                    >
                                        <span className="font-medium text-lg block">{level}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {level === "Beginner" && "Just starting out"}
                                            {level === "Intermediate" && "Regular workouts"}
                                            {level === "Advanced" && "Pushing limits"}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {step === 4 && (
                            <div className="grid grid-cols-3 gap-3">
                                {["10", "20", "30"].map((time) => (
                                    <button
                                        key={time}
                                        onClick={() => updateField("time", time)}
                                        className={cn(
                                            "p-6 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2",
                                            formData.time === time ? "border-primary bg-primary/10 ring-1 ring-primary" : "bg-card"
                                        )}
                                    >
                                        <Clock className="h-6 w-6 text-primary" />
                                        <span className="font-bold text-xl">{time}</span>
                                        <span className="text-xs text-muted-foreground uppercase">Mins</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {step === 5 && (
                            <div className="text-center space-y-4">
                                <div className="h-20 w-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold">Profile Ready!</h3>
                                <p className="text-muted-foreground">Here is your health summary, <strong>{formData.name}</strong>.</p>

                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="p-4 bg-secondary/50 rounded-xl">
                                        <p className="text-xs text-muted-foreground uppercase">BMI</p>
                                        <p className={`text-2xl font-bold ${bmiData.color}`}>{bmiData.bmi}</p>
                                        <p className="text-sm font-medium">{bmiData.status}</p>
                                    </div>
                                    <div className="p-4 bg-secondary/50 rounded-xl">
                                        <p className="text-xs text-muted-foreground uppercase">Stats</p>
                                        <p className="text-2xl font-bold">{formData.weight}kg</p>
                                        <p className="text-sm font-medium">{formData.height}cm</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="ghost" onClick={handleBack} disabled={step === 0}>
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button onClick={handleNext} disabled={
                            (step === 0 && !formData.name) ||
                            (step === 1 && (!formData.height || !formData.weight)) ||
                            (step === 2 && !formData.goal) ||
                            (step === 3 && !formData.level) ||
                            (step === 4 && !formData.time)
                        }>
                            {step === 5 ? "Go to Dashboard" : "Continue"} <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
