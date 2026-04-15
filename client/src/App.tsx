import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import { AudioCuesProvider } from "@/components/AudioCuesProvider";
import NotFound from "@/pages/not-found";
import { isAuthenticated } from "@/utils/auth";

import Splash from "@/pages/Splash";
import Auth from "@/pages/Auth";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import GoalsSetup from "@/pages/GoalsSetup";
import BodyTypeSetup from "@/pages/BodyTypeSetup";
import Dashboard from "@/pages/Dashboard";
import Workouts from "@/pages/Workouts";
import WorkoutDetail from "@/pages/WorkoutDetail";
import AskKevin from "@/pages/AskKevin";
import Progress from "@/pages/Progress";
import Settings from "@/pages/Settings";
import Merch from "@/pages/Merch";
import WorkoutWithKevin from "@/pages/WorkoutWithKevin";
import Challenges from "@/pages/Challenges";
import WorkoutHistory from "@/pages/WorkoutHistory";
import WorkoutCalendar from "@/pages/WorkoutCalendar";
import ProfileSettings from "@/pages/ProfileSettings";
import UntamedStudio from "@/pages/UntamedStudio";
import KGPlaylists from "./pages/KGPlaylists";
import MusicPlayer from "./pages/MusicPlayer";
import BookSession from "@/pages/BookSession";

function Router() {
  const authenticated = isAuthenticated();

  return (
    <Switch>
      <Route path="/" component={Splash} />
      <Route path="/auth">
        {authenticated ? <Redirect to="/dashboard" /> : <Auth />}
      </Route>
      <Route path="/login">
        {authenticated ? <Redirect to="/dashboard" /> : <Login />}
      </Route>
      <Route path="/signup">
        {authenticated ? <Redirect to="/dashboard" /> : <Signup />}
      </Route>
      
      {/* Onboarding flow */}
      <Route path="/goals-setup">
        {!authenticated ? <Redirect to="/login" /> : <GoalsSetup />}
      </Route>
      <Route path="/body-type-setup">
        {!authenticated ? <Redirect to="/login" /> : <BodyTypeSetup />}
      </Route>

      {/* Protected routes */}
      <Route path="/dashboard">
        {!authenticated ? <Redirect to="/login" /> : <Dashboard />}
      </Route>
      <Route path="/workouts">
        {!authenticated ? <Redirect to="/login" /> : <Workouts />}
      </Route>
      <Route path="/workouts/:id">
        {!authenticated ? <Redirect to="/login" /> : <WorkoutDetail />}
      </Route>
      <Route path="/workout-with-kevin">
        {!authenticated ? <Redirect to="/login" /> : <WorkoutWithKevin />}
      </Route>
      <Route path="/ask-kevin">
        {!authenticated ? <Redirect to="/login" /> : <AskKevin />}
      </Route>
      <Route path="/challenges">
        {!authenticated ? <Redirect to="/login" /> : <Challenges />}
      </Route>
      <Route path="/workout-history">
        {!authenticated ? <Redirect to="/login" /> : <WorkoutHistory />}
      </Route>
      <Route path="/workout-calendar">
        {!authenticated ? <Redirect to="/login" /> : <WorkoutCalendar />}
      </Route>
      <Route path="/profile-settings">
        {!authenticated ? <Redirect to="/login" /> : <ProfileSettings />}
      </Route>
      <Route path="/untamed-studio">
        {!authenticated ? <Redirect to="/login" /> : <UntamedStudio />}
      </Route>
      <Route path="/progress">
        {!authenticated ? <Redirect to="/login" /> : <Progress />}
      </Route>
      <Route path="/settings">
        {!authenticated ? <Redirect to="/login" /> : <Settings />}
      </Route>
      <Route path="/merch">
        {!authenticated ? <Redirect to="/login" /> : <Merch />}
      </Route>
      <Route path="/kg-playlists">
        {!authenticated ? <Redirect to="/login" /> : <KGPlaylists />}
      </Route>
      <Route path="/music-player">
        {!authenticated ? <Redirect to="/login" /> : <MusicPlayer />}
      </Route>
      <Route path="/book-session">
        {!authenticated ? <Redirect to="/login" /> : <BookSession />}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AccessibilityProvider>
          <AudioCuesProvider>
            <Toaster />
            <Router />
          </AudioCuesProvider>
        </AccessibilityProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
