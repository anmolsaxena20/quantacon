import { useState, useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import AICoach from "@/components/features/AICoach";
import { Toaster } from "@/components/ui/sonner";
import {
    LayoutDashboard,
    Dumbbell,
    TrendingUp,
    UserCircle,
    ChevronLeft,
    ChevronRight,
    Users,
    Menu,
    Sun,
    Moon,
    LogOut,
    PenTool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import NotificationBell from "@/components/features/NotificationBell";
import { useNotificationStore } from "@/lib/store";
import useAuth, { AuthContextProvider } from "../../Context/AuthContext";
import logout from "@/Pages/LogoutPage";
export default function AppLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { setTheme, theme } = useTheme();

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: Dumbbell, label: "Workout", path: "/workout" },
        { icon: PenTool, label: "Create Plan", path: "/create-workout" },
        { icon: Users, label: "Community", path: "/community/social" },
        { icon: TrendingUp, label: "Progress", path: "/progress" },
        { icon: UserCircle, label: "Profile", path: "community/profile-setup" },
    ];

    const { addNotification } = useNotificationStore();


    useEffect(() => {

        const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
            setTimeout(() => {
                addNotification({
                    title: "Welcome to Pulse Fit!",
                    message: "Ready to crush your goals? Check out the new AI Workout generator on your dashboard.",
                    type: "info"
                });
                sessionStorage.setItem('hasSeenWelcome', 'true');
            }, 1000);
        }
    }, []);

    return (
        <AuthContextProvider>
            <div className="min-h-screen bg-background text-foreground flex overflow-hidden font-sans">

                <aside
                    className={cn(
                        "relative hidden md:flex flex-col border-r bg-card/50 backdrop-blur-xl transition-all duration-300 ease-in-out z-20",
                        isCollapsed ? "w-24" : "w-80"
                    )}
                >
                    <div className="p-6 flex items-center justify-between h-20">
                        {!isCollapsed && (
                            <div className="font-heading text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent animate-in fade-in duration-300">
                                Pulse Fit
                            </div>
                        )}
                        {isCollapsed && <div className="mx-auto font-heading font-bold text-2xl text-primary">PF</div>}

                        <div className="absolute -right-4 top-8 z-50 flex flex-col gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="h-8 w-8 rounded-full border bg-background shadow-md hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
                            >
                                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 space-y-3 mt-8">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-x-1"
                                            : "hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:translate-x-1"
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            "h-6 w-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                                            isActive && "animate-pulse"
                                        )}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    {!isCollapsed && (
                                        <span className="font-medium text-lg tracking-wide animate-in fade-in slide-in-from-left-2 duration-200">
                                            {item.label}
                                        </span>
                                    )}
                                    {isActive && !isCollapsed && (
                                        <div className="absolute right-3 h-2 w-2 rounded-full bg-white animate-ping" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>


                    <div className="p-4 border-t bg-black/5 mt-auto mb-4 mx-4 rounded-xl">
                        <div className={cn("flex items-center gap-4", isCollapsed ? "justify-center flex-col" : "px-1")}>
                            <Avatar className="h-12 w-12 border-2 border-primary cursor-pointer hover:scale-105 transition-transform shadow-sm">
                                <AvatarImage
                                    onClick={() => { navigate('/community/profile-setup') }}
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=guest" />
                                <AvatarFallback>G</AvatarFallback>
                            </Avatar>
                            {!isCollapsed && (
                                <div className="flex-1 overflow-hidden animate-in fade-in duration-300">
                                    <p className="text-base font-bold truncate">Guest User</p>
                                    <p className="text-xs text-muted-foreground truncate">Free Plan</p>
                                </div>
                            )}

                            <div className={cn("flex items-center gap-1", isCollapsed && "flex-col")}>

                                <NotificationBell />

                                {!isCollapsed && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 hover:bg-background/50 hover:text-primary"
                                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                    >
                                        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                                    </Button>
                                )}

                                {!isCollapsed && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 hover:bg-background/50 hover:text-red-500"
                                        onClick={() => navigate("/logout")}
                                        title="Log out"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>


                <main className="flex-1 relative overflow-y-auto h-screen w-full bg-secondary/10">
                    <header className="h-16 border-b bg-card/80 backdrop-blur-md flex items-center justify-between px-6 md:hidden sticky top-0 z-30 shadow-sm">
                        <div className="flex items-center">
                            <Button variant="ghost" size="icon" className="mr-4">
                                <Menu className="h-6 w-6" />
                            </Button>
                            <div className="font-heading text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Pulse Fit</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <NotificationBell />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            >
                                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>
                        </div>
                    </header>

                    <div className="container mx-auto p-6 max-w-7xl">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </div>
                    <AICoach />
                    <Toaster />
                </main>
            </div>
        </AuthContextProvider>
    );
}