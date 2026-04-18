import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateSettings } from "@/hooks/use-settings";
import { getCurrentUserProfile, updateUserProfile } from "@/utils/auth";
import { DEFAULT_SOUNDS, playWeightDrop, playButtonClick, playRepComplete } from "@/utils/audio";
import { Settings as SettingsIcon, Bell, Eye, CreditCard, Info, LogOut, User, Crown, Mail, Lock, Calendar, Volume2, ArrowLeft } from "lucide-react";

export default function Settings() {
  const { data: user } = useAuth();
  const updateSettings = useUpdateSettings();
  const [gymAmbience, setGymAmbience] = useState(50);
  const [profileData, setProfileData] = useState<any>({});
  const [profileSaved, setProfileSaved] = useState(false);
  const [accountData, setAccountData] = useState<any>({});
  const [accountSaved, setAccountSaved] = useState(false);
  const [vipUsers, setVipUsers] = useState<string[]>([]);
  const [newVipEmail, setNewVipEmail] = useState("");
  const [vipLoading, setVipLoading] = useState(false);

  useEffect(() => {
    const profile = getCurrentUserProfile();
    if (profile) {
      setProfileData(profile.profile || {});
      setAccountData({
        email: profile.email || "",
        password: ""
      });
    }
    
    // Load VIP users if owner
    if (user?.email === "untamedfitapp@gmail.com") {
      loadVipUsers();
    }
  }, [user]);

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleAccountChange = (field: string, value: string) => {
    setAccountData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    try {
      // Ensure all profile fields are saved
      const allProfileData = {
        ...profileData,
        // Explicitly ensure these fields are included
        name: profileData.name || "",
        age: profileData.age || "",
        birthday: profileData.birthday || "",
        city: profileData.city || "",
        experienceLevel: profileData.experienceLevel || "",
        fitnessGoal: profileData.fitnessGoal || "",
        height: profileData.height || "",
        weight: profileData.weight || "",
        bodyType: profileData.bodyType || "",
        limitations: profileData.limitations || "",
        weightRoomSound: profileData.weightRoomSound || "hardcore",
        uiSounds: profileData.uiSounds !== false,
        masterVolume: profileData.masterVolume || 50
      };
      
      updateUserProfile(allProfileData);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  const handleSaveAccount = () => {
    try {
      // Handle account update logic here
      setAccountSaved(true);
      setTimeout(() => setAccountSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save account:", error);
    }
  };

  const loadVipUsers = async () => {
    try {
      const activeUser = localStorage.getItem("untamedActiveUser");
      const response = await fetch('/api/vip-users', {
        headers: activeUser ? { "x-user-email": activeUser } : {}
      });
      if (response.ok) {
        const users = await response.json();
        setVipUsers(users);
      }
    } catch (error) {
      console.error("Failed to load VIP users:", error);
    }
  };

  const addVipUser = async () => {
    if (!newVipEmail || user?.email !== "untamedfitapp@gmail.com") return;
    
    setVipLoading(true);
    try {
      const activeUser = localStorage.getItem("untamedActiveUser");
      const response = await fetch('/api/vip-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeUser && { "x-user-email": activeUser })
        },
        body: JSON.stringify({ email: newVipEmail })
      });
      
      if (response.ok) {
        const updatedUsers = await response.json();
        setVipUsers(updatedUsers);
        setNewVipEmail("");
      }
    } catch (error) {
      console.error("Failed to add VIP user:", error);
    } finally {
      setVipLoading(false);
    }
  };

  const removeVipUser = async (email: string) => {
    if (user?.email !== "untamedfitapp@gmail.com") return;
    
    setVipLoading(true);
    try {
      const activeUser = localStorage.getItem("untamedActiveUser");
      const response = await fetch(`/api/vip-users/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: activeUser ? { "x-user-email": activeUser } : {}
      });
      
      if (response.ok) {
        const updatedUsers = await response.json();
        setVipUsers(updatedUsers);
      }
    } catch (error) {
      console.error("Failed to remove VIP user:", error);
    } finally {
      setVipLoading(false);
    }
  };

  const isOwner = user?.email === "untamedfitapp@gmail.com";
  const isVip = isOwner || user?.isVIP || vipUsers.includes(user?.email || "");
  const getUserBadge = () => {
    if (isOwner) return { text: "OWNER", color: "bg-accent text-black", icon: Crown };
    if (isVip) return { text: "VIP", color: "bg-yellow-500 text-black", icon: Crown };
    return { text: "FREE ACCOUNT", color: "bg-gray-500 text-white", icon: User };
  };
  const userBadge = getUserBadge();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => window.history.back()}
              className="bg-primary text-black hover:bg-primary/80 rounded-full font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-primary-glow">BACK</span>
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-2">
                <span className="text-primary text-glow">SETTINGS</span>
              </h1>
              <p className="text-silver mt-2 uppercase tracking-widest text-sm">Customize your experience</p>
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>

          <div className="space-y-6">
            {/* Profile Section - Horizontal Layout */}
            <Card className="glass-panel border-white/5 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                  <User className="text-primary w-5 h-5" />
                  PROFILE
                  <span className={`ml-2 px-2 py-1 ${userBadge.color} text-xs rounded font-bold flex items-center gap-1`}>
                    <userBadge.icon className="w-3 h-3" />
                    {userBadge.text}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      placeholder="Enter your age"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Birthday</Label>
                    <Input 
                      value={profileData.birthday || ""} 
                      onChange={(e) => handleProfileChange("birthday", e.target.value)}
                      type="date"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">City</Label>
                    <Input 
                      value={profileData.city || ""} 
                      onChange={(e) => handleProfileChange("city", e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Enter your city"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Email</Label>
                    <Input 
                      value={accountData.email || user?.email || ""} 
                      onChange={(e) => handleAccountChange("email", e.target.value)}
                      type="email"
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Your email"
                      disabled
                    />
                  </div>
                  <div>
                    <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Experience Level</Label>
                    <select 
                      value={profileData.experienceLevel || ""} 
                      onChange={(e) => handleProfileChange("experienceLevel", e.target.value)}
                      className="w-full bg-white/10 border-white/20 text-white rounded p-2"
                    >
                      <option value="">Select experience level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Main Fitness Goal</Label>
                    <select 
                      value={profileData.fitnessGoal || ""} 
                      onChange={(e) => handleProfileChange("fitnessGoal", e.target.value)}
                      className="w-full bg-white/10 border-white/20 text-white rounded p-2"
                    >
                      <option value="">Select your main goal</option>
                      <option value="muscle-gain">Muscle Gain</option>
                      <option value="fat-loss">Fat Loss</option>
                      <option value="strength">Strength Building</option>
                      <option value="endurance">Endurance</option>
                      <option value="flexibility">Flexibility</option>
                      <option value="general-fitness">General Fitness</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <Button 
                    onClick={handleSaveProfile}
                    className="w-full bg-primary text-black hover:bg-primary/80 rounded-xl font-bold uppercase tracking-widest h-10"
                  >
                    Save Profile Settings
                  </Button>
                  {profileSaved && (
                    <p className="text-xs text-primary font-bold uppercase tracking-widest text-center mt-2">✓ Profile Saved</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Three Boxes Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* VIP Status */}
              <Card className="glass-panel border-white/5 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                    <Crown className="text-accent w-5 h-5" />
                    VIP STATUS
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {isVip ? (
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
                  ) : (
                    <div className="text-center space-y-2">
                      <Crown className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-white/60 text-sm">Upgrade to VIP to unlock premium features</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Audio Cues */}
              <Card className="glass-panel border-white/5 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                    <Eye className="text-primary w-5 h-5" />
                    AUDIO CUES
                  </CardTitle>
                </CardHeader>
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
                  
                  <div className="space-y-4">
                    <Label className="text-white font-bold uppercase tracking-wider text-xs">Weight Room Sounds</Label>
                    <select 
                      value={profileData.weightRoomSound || "hardcore"} 
                      onChange={(e) => handleProfileChange("weightRoomSound", e.target.value)}
                      className="w-full bg-white/10 border-white/20 text-white rounded p-2"
                    >
                      <option value="hardcore">Hardcore - Heavy Metal & Intense</option>
                      <option value="zen">Zen - Peaceful & Focused</option>
                      <option value="classic">Classic - Traditional Gym Sounds</option>
                    </select>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => playWeightDrop(profileData.weightRoomSound || "hardcore")}
                        className="text-white border-white/20 hover:bg-white/10"
                      >
                        🔊 Test Weight Drop
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => playRepComplete(profileData.weightRoomSound || "hardcore")}
                        className="text-white border-white/20 hover:bg-white/10"
                      >
                        🔊 Test Rep Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => playButtonClick(profileData.weightRoomSound || "hardcore")}
                        className="text-white border-white/20 hover:bg-white/10"
                      >
                        🔊 Test Click
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-white font-bold uppercase tracking-wider text-xs">UI Interaction Sounds</Label>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Button clicks, screen transitions</p>
                      <Switch 
                        checked={profileData.uiSounds !== false} 
                        onCheckedChange={(val) => handleProfileChange("uiSounds", val)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-white font-bold uppercase tracking-wider text-xs">Master Volume</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">🔇</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={profileData.masterVolume || 50}
                        onChange={(e) => handleProfileChange("masterVolume", e.target.value)}
                        className="flex-1 bg-white/10 border-white/20 rounded-lg h-2"
                      />
                      <span className="text-xs text-muted-foreground w-8 text-right">{profileData.masterVolume || 50}%</span>
                    </div>
                  </div>

                  {/* Custom Sound Upload - VIP Only */}
                  {isVip && (
                    <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-yellow-500/30">
                      <Label className="text-yellow-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                        <Crown className="w-3 h-3" />
                        VIP FEATURE - CUSTOM SOUNDS
                      </Label>
                      <div className="space-y-2">
                        <p className="text-xs text-white/80">Upload your own sound effects (MP3, WAV)</p>
                        <div className="flex gap-2">
                          <Input
                            type="file"
                            accept=".mp3,.wav"
                            className="bg-white/10 border-white/20 text-white text-xs flex-1"
                            disabled={!isVip}
                            placeholder={isVip ? "Choose sound file" : "VIP users only"}
                          />
                          <Button
                            size="sm"
                            className="bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-50"
                            disabled={!isVip}
                          >
                            Upload
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isVip && (
                    <div className="text-center p-4 bg-white/5 rounded-lg border border-gray-500/30">
                      <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                        <Crown className="w-3 h-3" />
                        Upgrade to VIP to unlock custom sound uploads
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* VIP Users Management - Only for Owner */}
              {isOwner && (
                <Card className="glass-panel border-white/5 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                      <Crown className="w-5 h-5 text-accent" />
                      VIP USERS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white font-bold uppercase tracking-wider text-xs">Add VIP User</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={newVipEmail}
                          onChange={(e) => setNewVipEmail(e.target.value)}
                          type="email"
                          className="bg-white/10 border-white/20 text-white flex-1"
                          placeholder="Enter email"
                        />
                        <Button 
                          onClick={addVipUser}
                          disabled={vipLoading}
                          className="bg-accent text-black hover:bg-accent/80"
                        >
                          {vipLoading ? "..." : "Add"}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white font-bold uppercase tracking-wider text-xs">Current VIP Users</Label>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {vipUsers.map((email, index) => (
                          <div key={index} className="flex items-center justify-between bg-white/5 rounded p-2">
                            <span className="text-white text-xs truncate flex-1">{email}</span>
                            <Button
                              onClick={() => removeVipUser(email)}
                              disabled={vipLoading}
                              variant="outline"
                              size="sm"
                              className="text-red-400 border-red-400/30 hover:bg-red-400/10 ml-2"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Body Type Section - Full Width Below */}
            <Card className="glass-panel border-white/5 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white font-bold uppercase tracking-wider flex items-center gap-2">
                  <User className="text-primary w-5 h-5" />
                  BODY TYPE
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Height</Label>
                    <Input 
                      value={profileData.height || ""} 
                      onChange={(e) => handleProfileChange("height", e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Enter your height (e.g., 5 feet 10 inches)"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Weight</Label>
                    <Input 
                      value={profileData.weight || ""} 
                      onChange={(e) => handleProfileChange("weight", e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Enter your weight (e.g., 180 lbs)"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Body Type</Label>
                    <select 
                      value={profileData.bodyType || ""} 
                      onChange={(e) => handleProfileChange("bodyType", e.target.value)}
                      className="w-full bg-white/10 border-white/20 text-white rounded p-2"
                    >
                      <option value="">Select body type</option>
                      <option value="athletic">Athletic</option>
                      <option value="lean">Lean</option>
                      <option value="muscular">Muscular</option>
                      <option value="curvy">Curvy</option>
                      <option value="slim">Slim</option>
                      <option value="average">Average</option>
                      <option value="stocky">Stocky</option>
                      <option value="plus-size">Plus-Size</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-white font-bold uppercase tracking-wider text-xs mb-2 block">Limitations</Label>
                    <textarea 
                      value={profileData.limitations || ""} 
                      onChange={(e) => handleProfileChange("limitations", e.target.value)}
                      className="w-full bg-white/10 border-white/20 text-white rounded p-2 h-16 resize-none"
                      placeholder="Any limitations (optional)"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <Button 
                    onClick={handleSaveProfile}
                    className="w-full bg-primary text-black hover:bg-primary/80 rounded-xl font-bold uppercase tracking-widest h-10"
                  >
                    Save Body Type Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
