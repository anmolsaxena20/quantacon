import { useState, useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
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
  PenTool,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import NotificationBell from "@/components/features/NotificationBell";
import { useNotificationStore } from "@/lib/store";
import useAuth, { AuthContextProvider } from "../../Context/AuthContext";

export default function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();
  const { user } = useAuth();
  const { addNotification } = useNotificationStore();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Dumbbell, label: "Workout", path: "/workout" },
    { icon: PenTool, label: "Create Plan", path: "/create-workout" },
    { icon: Users, label: "Community", path: "/community/social" },
    { icon: TrendingUp, label: "Progress", path: "/progress" },
    { icon: UserCircle, label: "Profile", path: "/community/profile-setup" },
  ];

  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setTimeout(() => {
        addNotification({
          title: "Welcome to Pulse Fit!",
          message:
            "Ready to crush your goals? Try the AI workout generator ",
          type: "info",
        });
        sessionStorage.setItem("hasSeenWelcome", "true");
      }, 1000);
    }
  }, []);

  return (
    <AuthContextProvider>
       
        
      <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      
        <aside
          className={cn(
            "relative hidden md:flex flex-col border-r bg-card/50 backdrop-blur-xl transition-all duration-300 z-20",
            isCollapsed ? "w-24" : "w-80"
          )}
        >
       
          <div className="p-6 flex items-center justify-between h-20">
            {!isCollapsed ? (
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Pulse Fit
              </div>
            ) : (
              <div className="mx-auto font-bold text-2xl text-primary">PF</div>
            )}

            <div className="absolute -right-4 top-8 z-50">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 rounded-full border bg-background shadow-md"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
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
                    "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  {!isCollapsed && (
                    <span className="font-medium text-lg">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

         
          <div className="p-4 border-t bg-black/5 mt-auto mb-4 mx-4 rounded-xl">
            <div
              className={cn(
                "flex items-center",
                isCollapsed ? "flex-col gap-3" : "gap-3"
              )}
            >
             
              <Avatar
                className="h-12 w-12 border-2 border-primary cursor-pointer hover:scale-105"
                onClick={() => navigate("/community/profile-setup")}
              >
                <AvatarImage src={user?.picture} />
                <AvatarFallback>
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              
              {!isCollapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <div className="overflow-hidden">
                    <p className="text-base font-bold truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.tier}
                    </p>
                  </div>
                  <div className="mr-10">
                  <NotificationBell />
                    </div>
                </div>
              )}

              {/* Collapsed Bell */}
              {isCollapsed && <NotificationBell />}

              {/* Actions */}
              {!isCollapsed && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  >
                    {theme === "dark" ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:text-red-500"
                    onClick={() => navigate("/logout")}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 relative overflow-y-auto h-screen bg-secondary/10">
          {/* Mobile Header */}
          <header className="h-16 border-b bg-card/80 backdrop-blur-md flex items-center justify-between px-6 md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>

            <div className="flex items-center gap-2">
              <NotificationBell />
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setTheme(theme === "dark" ? "light" : "dark")
                }
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </header>

          <div className="container mx-auto p-6 max-w-7xl">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
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
