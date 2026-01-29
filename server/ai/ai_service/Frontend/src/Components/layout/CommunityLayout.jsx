import Navbar from "../Navigation/Navbar";
import { Outlet } from "react-router-dom";
import { AuthContextProvider } from "@/Context/AuthContext";
export default function Layout() {
  return (
    <AuthContextProvider>
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-14">
        <Outlet />
      </main>
    </div>
    </AuthContextProvider>
  );
}
