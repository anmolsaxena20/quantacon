import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import ProfileSetup from "@/Pages/Profile";
import Workout from "@/pages/Workout";
import WorkoutCreator from "@/pages/WorkoutCreator";
import ProgressPage from "@/pages/Progress";
import PricingSync from "@/Pages/Pricing";
import Signup from "./Pages/SignupPage";
import { AuthContextProvider } from "./Context/AuthContext";
import Logout from "./Pages/LogoutPage";
import OAuthSuccessPage from "./Pages/Oauth";
import CreateWorkoutAlarm from "@/Pages/WorkoutAlarm"
import NotFound from "./Pages/NotFoundPage";
import ProtectedRoute from "./Components/layout/ProtectedLayout";
import WorkoutPage from "./Pages/workoutPage";
function App() {
    return (
        <BrowserRouter>
        <AuthContextProvider>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<Navigate to="/login" replace />} />
                    <Route element={<ProtectedRoute/>}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="workout" element={<WorkoutPage />} />
                    <Route path="create-workout" element={<WorkoutCreator />} />
                    <Route path="progress" element={<ProgressPage />} />
                    <Route path="community/profile-setup" element={<ProfileSetup />} />
                    <Route path="pricing" element={<PricingSync />} />
                    <Route path="logout" element={<Logout />} />
                    <Route path="workout-alarm" element={<CreateWorkoutAlarm/>}/>
                    </Route>
                </Route>
                <Route path="/login" element={<AuthContextProvider><Login /></AuthContextProvider>} />
                <Route path="/signup" element={<AuthContextProvider><Signup /></AuthContextProvider>} />
                <Route path="/oauth-success" element={<OAuthSuccessPage />} />
                <Route path ="*" element={<NotFound/>}/>
            </Routes>
            </AuthContextProvider>
        </BrowserRouter>
    );
}

export default App;
