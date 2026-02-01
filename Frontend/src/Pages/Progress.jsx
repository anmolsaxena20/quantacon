import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Flame, Trophy, Calendar, Activity, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

const VAL = [
    { day: 'Mon', minutes: 1 },
    { day: 'Tue', minutes: 1 },
    { day: 'Wed', minutes: 1 },
    { day: 'Thu', minutes: 1 },
    { day: 'Fri', minutes: 1 },
    { day: 'Sat', minutes: 1 },
    { day: 'Sun', minutes: 1},
];
export default function ProgressPage() {
    const[summary,setSummary] = useState(null);
    const[weeklyChart,setWeeklyChart] = useState(null);
    const[timeMetrics,setTimeMatrics] = useState(null);
    const[weeklyReport,setWeeklyReport] = useState(null);
    const[DATA,setDATA] = useState(null);
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const fetchProgress = async()=>{
      try {
        const token = localStorage.getItem("token");
          const res= await fetch("http://localhost:5000/api/progress/stats",
              {
                  method:"GET",
                  headers:{
                      "Authorization":`Bearer ${token}`
                  }
              }
          )
          if(!res.ok){
            toast.error("unable to fetch progress report");
            return;
          }
          const progress = await res.json();
          console.log("progress Report",progress);
         
          setSummary(progress.summary);
          setTimeMatrics(progress.timeMetrics);
          setWeeklyChart(progress.weeklyChart);
          setWeeklyReport( progress.weeklyReport)
         setDATA(progress.weeklyChart.map((d=>({...d,minutes:d.minutes+1}))));
         
      } catch (error) {
        toast.error("unable to fetch progress",error);
        console.log("Error",error);
      }
    }
    useEffect(()=>{
        fetchProgress();
    },[])

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            <div className="flex justify-between items-center">
                <motion.h1 variants={item} className="text-3xl font-heading font-bold">Your Progress</motion.h1>
                <motion.div variants={item}>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                        <Activity className="h-4 w-4" /> Last {summary?.streakChange} Days
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div variants={item} whileHover={{ y: -5 }} className="md:col-span-1">
                    <Card className="border-orange-500/20 bg-orange-500/5 h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                            <Flame className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{summary?.currentStreak} Days</div>
                            <p className="text-xs text-muted-foreground mt-1"></p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item} whileHover={{ y: -5 }} className="md:col-span-1">
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
                            <Trophy className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{summary?.totalWorkouts}</div>
                            <p className="text-xs text-muted-foreground mt-1">Keep it up!</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item} whileHover={{ y: -5 }} className="md:col-span-1">
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Calories Burnt Today</CardTitle>
                            <Flame className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{summary?.caloriesToday}kcal</div>
                            <p className="text-xs text-muted-foreground mt-1">Daily Goal: 2000</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item} whileHover={{ y: -5 }} className="md:col-span-1">
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
                            <Calendar className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{summary?.monthlyGoal?.completed}/{summary?.monthlyGoal?.target}</div>
                            <ProgressBar value={60} className="mt-2 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <motion.div variants={item} whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 200 }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Consistency Report</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={DATA?DATA:VAL}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#d946ef" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                                <XAxis
                                    dataKey="day"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}m`}
                                    dx={-10}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted)/0.2)', radius: 4 }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--popover))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        color: 'hsl(var(--popover-foreground))'
                                    }}
                                    itemStyle={{ color: 'hsl(var(--primary))' }}
                                />
                                <Bar
                                    dataKey="minutes"
                                    fill="url(#barGradient)"
                                    radius={[8, 8, 4, 4]}
                                    barSize={50}
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                    <div className="p-6 border-t bg-muted/20 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" /> Total Time Today
                            </h4>
                            <p className="text-2xl font-bold">{timeMetrics?.todayMinutes}</p>
                            <p className="text-xs text-muted-foreground">Top 10% of users</p>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground">Weekly Average</h4>
                            <p className="text-2xl font-bold">{timeMetrics?.weeklyAverage}m</p>
                            <p className="text-xs text-green-500 font-medium">change {timeMetrics?.weeklyChange}% vs last week</p>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground">Monthly Average</h4>
                            <p className="text-2xl font-bold">{timeMetrics?.monthlyAverage}m</p>
                            <p className="text-xs text-muted-foreground">Consistent effort!</p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            <motion.div variants={item} whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 200 }}>
                <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" /> Weekly Fitness Report
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                            <div className="space-y-2 flex-1">
                                <h3 className="text-xl font-bold">You're crushing it!</h3>
                                <p className="text-muted-foreground">
                                    You've burned a total of <span className="text-foreground font-bold">{weeklyReport?.totalCalories} kcal</span> this week,
                                    which is <span className="text-green-500 font-bold">{weeklyReport?.percentAboveAverage}% higher</span> than your weekly average.
                                    Your consistency is paying keep up the momentum!
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                                <div className="bg-background/50 p-4 rounded-xl border text-center">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Cals</p>
                                    <p className="text-2xl font-bold text-primary">{weeklyReport?.totalCalories}</p>
                                </div>
                                <div className="bg-background/50 p-4 rounded-xl border text-center">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Workouts</p>
                                    <p className="text-2xl font-bold text-purple-500">{weeklyReport?.workouts}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
