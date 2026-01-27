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
import Profile from "./Pages/Profile";
import Chat from "./Pages/Chat";
import { ChatStoreProvider } from "./Context/ChatStore";
import Chats from "./Pages/Chats";
import CommunityLayout from "./Components/layout/CommunityLayout"
import Logout from "./Pages/LogoutPage";
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
                    <Route path="community/profile-setup" element={<ProfileSetup />} />
                    <Route path = "logout" element={<Logout/>}/>
                </Route>
                <Route path='/community' element={<ChatStoreProvider><CommunityLayout /></ChatStoreProvider>}>
                    <Route path="social" element={<Community />} />
                    <Route path="chats" element={<Chats />} />
                    <Route path="chat/:id" element={<Chat />} />
                    <Route path="profile" element={<Profile />} />
                </Route>

                <Route path="/login" element={<AuthContextProvider><Login /></AuthContextProvider>} />
                <Route path="/signup" element={<AuthContextProvider><Signup /></AuthContextProvider>} />
                <Route path="/oauth-success" element={<Dashboard/>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
