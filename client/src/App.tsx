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
import KGPlaylists from "@/pages/KGPlaylists";
import BookSession from "@/pages/BookSession";

function Router() {
  const authenticated = isAuthenticated();

  return (
    <Switch>
      <Route path="/" component={Splash} />
      <Route path="/auth">
        {authenticated ? <Redirect to="/dashboard" /> : <Auth />}
      </Route>
      
      {/* Onboarding flow */}
      <Route path="/goals-setup">
        {!authenticated ? <Redirect to="/auth" /> : <GoalsSetup />}
      </Route>
      <Route path="/body-type-setup">
        {!authenticated ? <Redirect to="/auth" /> : <BodyTypeSetup />}
      </Route>

      {/* Protected routes */}
      <Route path="/dashboard">
        {!authenticated ? <Redirect to="/auth" /> : <Dashboard />}
      </Route>
      <Route path="/workouts">
        {!authenticated ? <Redirect to="/auth" /> : <Workouts />}
      </Route>
      <Route path="/workouts/:id">
        {!authenticated ? <Redirect to="/auth" /> : <WorkoutDetail />}
      </Route>
      <Route path="/workout-with-kevin">
        {!authenticated ? <Redirect to="/auth" /> : <WorkoutWithKevin />}
      </Route>
      <Route path="/ask-kevin">
        {!authenticated ? <Redirect to="/auth" /> : <AskKevin />}
      </Route>
      <Route path="/challenges">
        {!authenticated ? <Redirect to="/auth" /> : <Challenges />}
      </Route>
      <Route path="/workout-history">
        {!authenticated ? <Redirect to="/auth" /> : <WorkoutHistory />}
      </Route>
      <Route path="/workout-calendar">
        {!authenticated ? <Redirect to="/auth" /> : <WorkoutCalendar />}
      </Route>
      <Route path="/profile-settings">
        {!authenticated ? <Redirect to="/auth" /> : <ProfileSettings />}
      </Route>
      <Route path="/untamed-studio">
        {!authenticated ? <Redirect to="/auth" /> : <UntamedStudio />}
      </Route>
      <Route path="/progress">
        {!authenticated ? <Redirect to="/auth" /> : <Progress />}
      </Route>
      <Route path="/settings">
        {!authenticated ? <Redirect to="/auth" /> : <Settings />}
      </Route>
      <Route path="/merch">
        {!authenticated ? <Redirect to="/auth" /> : <Merch />}
      </Route>
      <Route path="/kg-playlists">
        {!authenticated ? <Redirect to="/auth" /> : <KGPlaylists />}
      </Route>
      <Route path="/book-session">
        {!authenticated ? <Redirect to="/auth" /> : <BookSession />}
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
