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
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import WorkoutCalendar from "@/Components/Workout/WorkoutCalendar";

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
    const[stats,setStats] = useState(null);

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

    const fetchDashboardData = async()=>{
        const token = localStorage.getItem("token");
        const now = new Date(Date.now());
        const month = now.getMonth()+1;
        const year = now.getFullYear();
        if(!token){
            toast.error("invalid session");
            return;
        }
        const res = await fetch(`http://localhost:5000/api/workout/stats?month=${month}&year=${year}`,
            {
                method:"GET",
                headers:{
                    "Authorization":`Bearer ${token}`
                }
            }
        )
        if(!res.ok){
            toast.error("Error in fetching dashboard stats");
            return;
        }
        const stats = await res.json();
        console.log("stats",stats);
        setStats(stats);
    }
    useEffect(()=>{
        fetchDashboardData();
    },[])
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
                        <Flame className="h-4 w-4 mr-1 text-orange-500" /> {stats?.streak} Day Streak
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
                                <WorkoutCalendar workoutDates={stats?.workoutDays}/>
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
                                        <p className="font-bold">Level {stats?.level}</p>
                                        <p className="text-xs text-muted-foreground">{stats?.xpToNextLevel} XP to Level 4</p>
                                    </div>
                                </div>
                                <Progress value={stats?.currentXp} className="mt-4 h-2" />
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
