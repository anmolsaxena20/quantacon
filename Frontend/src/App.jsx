import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import ProfileSetup from "@/Pages/Profile";
import Workout from "@/pages/Workout";
import WorkoutCreator from "@/pages/WorkoutCreator";
import ProgressPage from "@/pages/Progress";
import Community from "@/pages/Community";
import PricingSync from "@/Pages/Pricing";
import Signup from "./Pages/SignupPage";
import { AuthContextProvider } from "./Context/AuthContext";
import Chat from "./Pages/Chat";
import { ChatStoreProvider } from "./Context/ChatStore";
import Chats from "./Pages/Chats";
import CommunityLayout from "./Components/layout/CommunityLayout"
import Logout from "./Pages/LogoutPage";
import OAuthSuccessPage from "./Pages/Oauth";
import CreatePostReel from "./Components/reels/UploadReelAndFeed";
import UserSearch from "./Components/search/UserSearch";
import CreateWorkoutAlarm from "@/Pages/WorkoutAlarm"
import NotFound from "./Pages/NotFoundPage";
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
                    <Route path="progress" element={<ProgressPage />} />
                    <Route path="community/profile-setup" element={<ProfileSetup />} />
                    <Route path="pricing" element={<PricingSync />} />
                    <Route path="logout" element={<Logout />} />
                    <Route path="workout-alarm" element={<CreateWorkoutAlarm/>}/>
                </Route>
                <Route path='/community' element={<ChatStoreProvider><CommunityLayout /></ChatStoreProvider>}>
                    <Route path="social" element={<Community />} />
                    <Route path="chats" element={<Chats />} />
                    <Route path="chat/:id" element={<Chat />} />
                    <Route path="/community/profile-setup" element={<ProfileSetup />} />
                    <Route path="reel" element={<CreatePostReel />} />
                    <Route path="search" element={<UserSearch />} />
                </Route>

                <Route path="/login" element={<AuthContextProvider><Login /></AuthContextProvider>} />
                <Route path="/signup" element={<AuthContextProvider><Signup /></AuthContextProvider>} />
                <Route path="/oauth-success" element={<OAuthSuccessPage />} />
                <Route path ="*" element={<NotFound/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
