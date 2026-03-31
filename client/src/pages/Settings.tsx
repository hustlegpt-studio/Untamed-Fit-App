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
import { Settings as SettingsIcon, Bell, Eye, CreditCard, Info, LogOut, User } from "lucide-react";

export default function Settings() {
  const { data: user } = useAuth();
  const updateSettings = useUpdateSettings();
  const [gymAmbience, setGymAmbience] = useState(50);
  const [profileData, setProfileData] = useState<any>({});
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    const profile = getCurrentUserProfile();
    if (profile) {
      setProfileData(profile.profile || {});
    }
  }, []);

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
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
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <CreditCard className="text-primary w-5 h-5" /> SUBSCRIPTION
            </h2>
            <Card className="glass-panel border-accent/20 bg-accent/5 rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <SettingsIcon className="w-24 h-24 rotate-12" />
              </div>
              <CardContent className="pt-6">
                <p className="text-[10px] font-bold text-accent tracking-[0.2em] uppercase mb-1">Current Plan</p>
                <h3 className="text-3xl font-display font-bold text-white uppercase mb-4">{user?.subscriptionTier || "Free"}</h3>
                <ul className="space-y-2 mb-6">
                  <li className="text-xs text-silver flex items-center gap-2">✓ Basic AI Chat</li>
                  <li className="text-xs text-silver flex items-center gap-2">✓ Body Part Workouts</li>
                  <li className="text-xs text-silver/40 flex items-center gap-2">✕ Premium Video Workouts</li>
                </ul>
                <Button className="w-full bg-accent text-white hover:bg-accent/80 rounded-xl font-bold uppercase tracking-widest h-12">
                  Upgrade to Elite
                </Button>
              </CardContent>
            </Card>
          </section>

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
                  <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Height (cm)</Label>
                  <Input 
                    value={profileData.height || ""} 
                    onChange={(e) => handleProfileChange("height", e.target.value)}
                    type="number"
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Your height"
                  />
                </div>
                <div>
                  <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Weight (lbs)</Label>
                  <Input 
                    value={profileData.weight || ""} 
                    onChange={(e) => handleProfileChange("weight", e.target.value)}
                    type="number"
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Your weight"
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
                <Button 
                  onClick={handleSaveProfile}
                  className="w-full bg-primary text-white hover:bg-primary/80 rounded-xl font-bold uppercase tracking-widest h-10 mt-4"
                >
                  Save Profile
                </Button>
                {profileSaved && (
                  <p className="text-xs text-primary font-bold uppercase tracking-widest text-center">✓ Saved</p>
                )}
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
