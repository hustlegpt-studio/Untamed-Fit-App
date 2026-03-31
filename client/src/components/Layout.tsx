import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Dumbbell, 
  MessageSquare, 
  LineChart, 
  Settings, 
  Play, 
  X, 
  User, 
  ShieldCheck,
  LogOut,
  Music,
  CalendarCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { isOwner, logoutUser } from "@/utils/auth";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user } = useAuth();
  const [adClosed, setAdClosed] = useState(false);
  const [adShown, setAdShown] = useState(false);
  const owner = isOwner();

  const isFreeUser = user?.subscriptionTier === "free";
  const shouldShowAd = isFreeUser && !adClosed && !adShown;

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/workouts", icon: Dumbbell, label: "Body Part" },
    { href: "/workout-with-kevin", icon: Play, label: "Train With Kevin" },
    { href: "/ask-kevin", icon: MessageSquare, label: "Coaching from KG" },
    { href: "/kg-playlists", icon: Music, label: "KG's Playlists" },
    { href: "/workout-calendar", icon: LineChart, label: "Workout Calendar" },
    { href: "/book-session", icon: CalendarCheck, label: "Book a Session" },
    ...(owner ? [{ href: "/untamed-studio", icon: ShieldCheck, label: "Untamed Studio" }] : []),
    { href: "/progress", icon: LineChart, label: "Progress" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-body">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border glass-panel z-10 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Untamed Fit" className="h-16 w-16 object-contain" />
            <h1 className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300">
              UNTAMED FIT
            </h1>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-8">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-primary box-glow rounded-full")} />
                  <span className="font-semibold">{item.label}</span>
                  {isActive && (
                    <motion.div layoutId="sidebar-active" className="absolute left-0 w-1 h-8 bg-primary rounded-r-full" />
                  )}
                </div>
              </Link>
            );
          })}
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group text-muted-foreground hover:bg-white/5 hover:text-destructive"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="font-semibold uppercase tracking-wider text-xs">Sign Out</span>
          </button>
        </nav>

        {/* Promo Ad for Free Users */}
        {shouldShowAd && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="m-4 p-4 rounded-2xl glass-panel border border-accent/50 relative group"
          >
            <button
              onClick={() => setAdClosed(true)}
              className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close ad"
            >
              <X className="w-4 h-4 text-accent" />
            </button>
            <div className="pr-6">
              <h4 className="text-xs font-display font-bold text-accent uppercase tracking-wider mb-2">
                PREMIUM GEAR
              </h4>
              <p className="text-[10px] text-silver mb-3 leading-tight">
                Rep the Untamed grind. Shop exclusive merch & apparel.
              </p>
              <a
                href="https://untamed-fitness-training.printify.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-accent hover:underline uppercase tracking-wider"
              >
                VISIT SHOP →
              </a>
            </div>
          </motion.div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-0 relative overflow-x-hidden">
        {/* Ambient background glow */}
        <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-0 p-4 md:p-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 flex justify-around items-center p-4 pb-safe z-50">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className="flex flex-col items-center gap-1 cursor-pointer">
                <div className={cn("p-2 rounded-full transition-all", isActive ? "bg-primary/20 text-primary box-glow" : "text-muted-foreground")}>
                  <item.icon className="w-6 h-6" />
                </div>
                {isActive && <motion.div layoutId="mobile-active" className="w-1 h-1 bg-primary rounded-full mt-1" />}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
