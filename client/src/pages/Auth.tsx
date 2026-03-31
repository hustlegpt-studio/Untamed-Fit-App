import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { createUser, loginUser, setActiveUser, isAuthenticated } from "@/utils/auth";
import { Mail, Lock, AlertCircle } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated()) {
      window.location.href = "/dashboard";
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Please fill in all fields");
      }
      
      const user = loginUser(email, password);
      if (!user) {
        throw new Error("Invalid email or password");
      }
      
      setActiveUser(email);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email || !password || !confirmPassword) {
        throw new Error("Please fill in all fields for signup");
      }
      
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      
      createUser(email, password);
      setActiveUser(email);
      window.location.href = "/goals-setup";
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="fixed top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
      <div className="fixed inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 rounded-3xl w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Untamed Fit" className="h-16 w-16 mx-auto object-contain mb-4" />
          <h1 className="text-4xl font-display font-bold text-white mb-1 uppercase tracking-tighter">AUTHENTICATION</h1>
          <p className="text-2xl font-display font-bold text-primary text-glow">UNTAMED FIT</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Email" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input 
                type="password" 
                placeholder="Confirm Password (Signup Only)" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
          </div>

          {error && (
            <div className="flex gap-2 p-3 bg-destructive/20 rounded-lg border border-destructive/50">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive text-sm font-semibold">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button 
              type="button"
              onClick={handleLogin}
              className="bg-primary text-black hover:opacity-90 rounded-full font-bold uppercase tracking-wider"
              disabled={isLoading}
            >
              Login
            </Button>
            <Button 
              type="button"
              onClick={handleSignup}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 rounded-full font-bold uppercase tracking-wider"
              disabled={isLoading}
            >
              Signup
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
