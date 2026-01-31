import { Button } from "@/components/ui/button";
import EnergySelector from "@/components/features/EnergySelector";
import { Clock, Trophy, Flame, PlayCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion } from "framer-motion";
import useAuth from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const handleStreakClick = () => {
        toast("Streak maintained!", {
            description: "You're on fire! Keep it up for 2 more days to level up.",
            action: {
                label: "View Rewards",
                onClick: () => console.log("Undo"),
            },
        });
    };
    const navigate = useNavigate();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const { user } = useAuth();
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <motion.div variants={item}>
                    <h1 className="text-3xl font-heading font-bold">Good Morning, {user ? user.name : "Guest"}</h1>
                    <p className="text-muted-foreground">Ready to keep your streak alive?</p>
                </motion.div>
                <motion.div
                    variants={item}
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={handleStreakClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Badge variant="secondary" className="text-sm px-3 py-1 hover:bg-secondary/80 transition-colors">
                        <Flame className="h-4 w-4 mr-1 text-orange-500" /> 5 Day Streak
                    </Badge>
                </motion.div>
                <div className="flex gap-2">
                    <Button onClick={() => navigate("/pricing")}>Upgrade Plan</Button>
                </div>
                 <div className="flex gap-2">
                    <Button onClick={() => navigate("/workout-alarm")}>Set Alarm</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="md:col-span-2 space-y-6">

                    <motion.div variants={item}>
                        <EnergySelector />
                    </motion.div>
                </div>
                <div className="space-y-6">
                    <motion.div variants={item}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Monthly Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-end h-[100px] mb-2">
                                    {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1 group">
                                            <div
                                                className={`w-8 rounded-t-sm transition-all duration-500 ${i < 5 ? "bg-primary group-hover:bg-primary/80" : "bg-muted"}`}
                                                style={{ height: `${i < 5 ? Math.random() * 80 + 20 : 10}%` }}
                                            />
                                            <span className="text-xs text-muted-foreground">{day}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-center text-sm font-medium">You're consistent!</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={item}>
                        <Card className="bg-gradient-to-br from-accent/50 to-background border-none relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Level 3</p>
                                        <p className="text-xs text-muted-foreground">500 XP to Level 4</p>
                                    </div>
                                </div>
                                <Progress value={66} className="mt-4 h-2" />
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
