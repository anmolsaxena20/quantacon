import Navbar from "../Navigation/Navbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-14">
        <Outlet />
      </main>
    </div>
  );
}
