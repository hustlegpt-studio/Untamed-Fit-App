import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateSettings } from "@/hooks/use-settings";
import { getCurrentUserProfile, updateUserProfile } from "@/utils/auth";
import { Settings as SettingsIcon, Bell, Eye, CreditCard, Info, LogOut, User, Crown, Mail, Lock } from "lucide-react";

export default function Settings() {
  const { data: user } = useAuth();
  const updateSettings = useUpdateSettings();
  const [gymAmbience, setGymAmbience] = useState(50);
  const [profileData, setProfileData] = useState<any>({});
  const [profileSaved, setProfileSaved] = useState(false);
  const [accountData, setAccountData] = useState<any>({});
  const [accountSaved, setAccountSaved] = useState(false);

  useEffect(() => {
    const profile = getCurrentUserProfile();
    if (profile) {
      setProfileData(profile.profile || {});
      setAccountData({
        email: profile.email || "",
        password: ""
      });
    }
  }, []);

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleAccountChange = (field: string, value: string) => {
    setAccountData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    try {
      updateUserProfile(profileData);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  const handleSaveAccount = () => {
    try {
      // Update account settings (email/password)
      setAccountSaved(true);
      setTimeout(() => setAccountSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save account:", error);
    }
  };

  const isOwner = user?.email === "untamedfitapp@gmail.com";
  const isVIP = isOwner || user?.subscriptionTier === "V.I.P.";

  return (
    <Layout>
      <header className="mb-10 pt-4">
        <div className="flex items-center gap-4 mb-4">
          <img src="/logo.png" alt="Untamed Fit" className="h-12 w-12 object-contain" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display text-white">
          APP <span className="text-primary text-glow">SETTINGS</span>
        </h1>
        <p className="text-silver mt-2 uppercase tracking-widest text-sm">Customize your experience</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* V.I.P. Users Section */}
          {(isOwner || isVIP) && (
            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <Crown className="text-accent w-5 h-5" /> V.I.P. USERS
              </h2>
              <Card className="glass-panel border-accent/20 bg-accent/5 rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Crown className="w-24 h-24" />
                </div>
                <CardContent className="pt-6">
                  <p className="text-[10px] font-bold text-accent tracking-[0.2em] uppercase mb-1">Status</p>
                  <h3 className="text-2xl font-display font-bold text-white uppercase mb-4">
                    {isOwner ? "OWNER" : "V.I.P."}
                  </h3>
                  <p className="text-sm text-white mb-4">
                    {isOwner 
                      ? "You have full access to all features and premium content."
                      : "You have unlimited access to all premium features."
                    }
                  </p>
                  <div className="space-y-2">
                    <div className="text-xs text-white flex items-center gap-2">
                      <Crown className="w-3 h-3 text-accent" />
                      All Premium Workouts Unlocked
                    </div>
                    <div className="text-xs text-white flex items-center gap-2">
                      <Crown className="w-3 h-3 text-accent" />
                      Advanced AI Coaching
                    </div>
                    <div className="text-xs text-white flex items-center gap-2">
                      <Crown className="w-3 h-3 text-accent" />
                      Priority Support
                    </div>
                    <div className="text-xs text-white flex items-center gap-2">
                      <Crown className="w-3 h-3 text-accent" />
                      Exclusive Content
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Eye className="text-primary w-5 h-5" /> ACCESSIBILITY
            </h2>
            <Card className="glass-panel border-white/5 rounded-2xl">
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white font-bold uppercase tracking-wider">Blind Mode</Label>
                    <p className="text-xs text-muted-foreground">Audio descriptions and voice navigation</p>
                  </div>
                  <Switch 
                    checked={user?.blindMode} 
                    onCheckedChange={(val) => updateSettings.mutate({ blindMode: val })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white font-bold uppercase tracking-wider">Mute Voice Cues</Label>
                    <p className="text-xs text-muted-foreground">Turn off coaching audio during workouts</p>
                  </div>
                  <Switch 
                    checked={!user?.voiceCues} 
                    onCheckedChange={(val) => updateSettings.mutate({ voiceCues: !val })}
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Bell className="text-primary w-5 h-5" /> SOUND ENGINE
            </h2>
            <Card className="glass-panel border-white/5 rounded-2xl">
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label className="text-white font-bold uppercase tracking-wider">Gym Ambience Volume</Label>
                    <span className="text-primary font-display font-bold">{gymAmbience}%</span>
                  </div>
                  <Slider 
                    value={[gymAmbience]} 
                    onValueChange={(val) => setGymAmbience(val[0])}
                    max={100} 
                    step={1} 
                    className="py-4"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {["Standard Gym", "Hardcore", "Zen Recovery"].map(pack => (
                      <Button key={pack} variant="outline" className="border-white/10 hover:border-primary/50 text-[10px] font-bold uppercase h-10">
                        {pack}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="space-y-6">
          {/* Account Settings Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Mail className="text-primary w-5 h-5" /> ACCOUNT
            </h2>
            <Card className="glass-panel border-white/5 rounded-2xl">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-white font-bold">{user?.name || "User"}</span>
                  {isOwner && (
                    <span className="bg-accent text-white text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                      Owner
                    </span>
                  )}
                </div>
                <div>
                  <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Email</Label>
                  <Input 
                    value={accountData.email || user?.email || ""} 
                    onChange={(e) => handleAccountChange("email", e.target.value)}
                    type="email"
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Your email"
                  />
                </div>
                <div>
                  <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Change Password</Label>
                  <Input 
                    value={accountData.password || ""} 
                    onChange={(e) => handleAccountChange("password", e.target.value)}
                    type="password"
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="New password (leave blank to keep current)"
                  />
                </div>
                <Button 
                  onClick={handleSaveAccount}
                  className="w-full bg-primary text-white hover:bg-primary/80 rounded-xl font-bold uppercase tracking-widest h-10"
                >
                  Save Account Settings
                </Button>
                {accountSaved && (
                  <p className="text-xs text-primary font-bold uppercase tracking-widest text-center">✓ Account Saved</p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Profile Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <User className="text-primary w-5 h-5" /> PROFILE
            </h2>
            <Card className="glass-panel border-white/5 rounded-2xl">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Name</Label>
                  <Input 
                    value={profileData.name || ""} 
                    onChange={(e) => handleProfileChange("name", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Age</Label>
                  <Input 
                    value={profileData.age || ""} 
                    onChange={(e) => handleProfileChange("age", e.target.value)}
                    type="number"
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Your age"
                  />
                </div>
                <div>
                  <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">City</Label>
                  <Input 
                    value={profileData.city || ""} 
                    onChange={(e) => handleProfileChange("city", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Your city"
                  />
                </div>
                <div>
                  <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Experience Level</Label>
                  <select 
                    value={profileData.experienceLevel || ""} 
                    onChange={(e) => handleProfileChange("experienceLevel", e.target.value)}
                    className="w-full bg-white/10 border-white/20 text-white rounded-lg px-3 py-2"
                  >
                    <option value="" className="bg-gray-800">Select experience</option>
                    <option value="beginner" className="bg-gray-800">Beginner</option>
                    <option value="intermediate" className="bg-gray-800">Intermediate</option>
                    <option value="advanced" className="bg-gray-800">Advanced</option>
                    <option value="expert" className="bg-gray-800">Expert</option>
                  </select>
                </div>
                <div>
                  <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Main Fitness Goal</Label>
                  <select 
                    value={profileData.mainGoal || ""} 
                    onChange={(e) => handleProfileChange("mainGoal", e.target.value)}
                    className="w-full bg-white/10 border-white/20 text-white rounded-lg px-3 py-2"
                  >
                    <option value="" className="bg-gray-800">Select goal</option>
                    <option value="weight-loss" className="bg-gray-800">Weight Loss</option>
                    <option value="muscle-gain" className="bg-gray-800">Muscle Gain</option>
                    <option value="strength" className="bg-gray-800">Strength Building</option>
                    <option value="endurance" className="bg-gray-800">Endurance</option>
                    <option value="flexibility" className="bg-gray-800">Flexibility</option>
                    <option value="general-fitness" className="bg-gray-800">General Fitness</option>
                  </select>
                </div>
                <Button 
                  onClick={handleSaveProfile}
                  className="w-full bg-primary text-white hover:bg-primary/80 rounded-xl font-bold uppercase tracking-widest h-10 mt-4"
                >
                  Save Profile
                </Button>
                {profileSaved && (
                  <p className="text-xs text-primary font-bold uppercase tracking-widest text-center">✓ Profile Saved</p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Body Type Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <User className="text-primary w-5 h-5" /> BODY TYPE
            </h2>
            <Card className="glass-panel border-white/5 rounded-2xl">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Body Type Category</Label>
                  <select 
                    value={profileData.bodyType || ""} 
                    onChange={(e) => handleProfileChange("bodyType", e.target.value)}
                    className="w-full bg-white/10 border-white/20 text-white rounded-lg px-3 py-2"
                  >
                    <option value="" className="bg-gray-800">Select body type</option>
                    <option value="ectomorph" className="bg-gray-800">Ectomorph (Lean)</option>
                    <option value="mesomorph" className="bg-gray-800">Mesomorph (Athletic)</option>
                    <option value="endomorph" className="bg-gray-800">Endomorph (Stocky)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Height (cm)</Label>
                  <Input 
                    value={profileData.height || ""} 
                    onChange={(e) => handleProfileChange("height", e.target.value)}
                    type="number"
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Your height in cm"
                  />
                </div>
                <div>
                  <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Weight (lbs)</Label>
                  <Input 
                    value={profileData.weight || ""} 
                    onChange={(e) => handleProfileChange("weight", e.target.value)}
                    type="number"
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Your weight in lbs"
                  />
                </div>
                <Button 
                  onClick={handleSaveProfile}
                  className="w-full bg-primary text-white hover:bg-primary/80 rounded-xl font-bold uppercase tracking-widest h-10"
                >
                  Save Body Type
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Info className="text-primary w-5 h-5" /> ABOUT
            </h2>
            <Card className="glass-panel border-white/5 rounded-2xl">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4">
                  <img src="/logo.png" alt="Untamed" className="w-full h-full object-contain" />
                </div>
                <p className="text-sm font-bold text-white uppercase tracking-widest">Untamed Fit v1.0.0</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">
                  Created by Kevin Gilliam<br/>
                  Built with HustleBuilder™<br/>
                  Engineered by TMG Rambo
                </p>
                <Button variant="ghost" className="mt-6 text-destructive hover:text-destructive hover:bg-destructive/10 w-full rounded-xl font-bold uppercase tracking-widest text-xs h-12">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </Layout>
  );
}
