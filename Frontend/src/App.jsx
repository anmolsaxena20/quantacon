import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import ProfileSetup from "@/pages/ProfileSetup";
import Workout from "@/pages/Workout";
import WorkoutCreator from "@/pages/WorkoutCreator";
import ProgressPage from "@/pages/Progress";
import Community from "@/pages/Community";
import Signup from "./Pages/SignupPage";
import { AuthContextProvider } from "./Context/AuthContext";
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<Navigate to="/login" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="workout" element={<Workout />} />
                    <Route path="create-workout" element={<WorkoutCreator />} />
                    <Route path="progress" element={<ProgressPage />} />
                    <Route path="community" element={<Community />} />
                    <Route path="profile-setup" element={<ProfileSetup />} />
                </Route>
               
                <Route path="/login" element={<AuthContextProvider><Login /></AuthContextProvider>} />
                 <Route path="/signup" element={<AuthContextProvider><Signup /></AuthContextProvider>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
