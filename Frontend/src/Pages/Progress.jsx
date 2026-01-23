import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Flame, Trophy, Calendar, Activity, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from "framer-motion";

const DATA = [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 30 },
    { day: 'Wed', minutes: 60 },
    { day: 'Thu', minutes: 45 },
    { day: 'Fri', minutes: 50 },
    { day: 'Sat', minutes: 75 },
    { day: 'Sun', minutes: 20 },
];

export default function ProgressPage() {
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
                        <Activity className="h-4 w-4" /> Last 7 Days
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
                            <div className="text-3xl font-bold">5 Days</div>
                            <p className="text-xs text-muted-foreground mt-1">+2 from last week</p>
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
                            <div className="text-3xl font-bold">12</div>
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
                            <div className="text-3xl font-bold">850 kcal</div>
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
                            <div className="text-3xl font-bold">12/20</div>
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
                            <BarChart data={DATA}>
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
                            <p className="text-2xl font-bold">45m</p>
                            <p className="text-xs text-muted-foreground">Top 10% of users</p>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground">Weekly Average</h4>
                            <p className="text-2xl font-bold">52m</p>
                            <p className="text-xs text-green-500 font-medium">â†‘ 12% vs last week</p>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-muted-foreground">Monthly Average</h4>
                            <p className="text-2xl font-bold">48m</p>
                            <p className="text-xs text-muted-foreground">Consistent effort! ðŸ‘</p>
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
                                <h3 className="text-xl font-bold">You're crushing it! ðŸš€</h3>
                                <p className="text-muted-foreground">
                                    You've burned a total of <span className="text-foreground font-bold">3,450 kcal</span> this week,
                                    which is <span className="text-green-500 font-bold">15% higher</span> than your weekly average.
                                    Your consistency is paying offâ€”keep up the momentum!
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                                <div className="bg-background/50 p-4 rounded-xl border text-center">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Cals</p>
                                    <p className="text-2xl font-bold text-primary">3,450</p>
                                </div>
                                <div className="bg-background/50 p-4 rounded-xl border text-center">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Workouts</p>
                                    <p className="text-2xl font-bold text-purple-500">5</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
