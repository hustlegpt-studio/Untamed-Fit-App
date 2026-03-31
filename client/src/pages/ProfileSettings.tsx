import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getCurrentUserProfile, updateUserProfile, isAuthenticated } from "@/utils/auth";
import { User, MapPin, Scale, Utensils, Target, Phone, Save, CheckCircle } from "lucide-react";

const GOALS = [
  { id: "weight-loss", label: "Weight Loss" },
  { id: "muscle-gain", label: "Muscle Gain" },
  { id: "endurance", label: "Endurance" },
  { id: "flexibility", label: "Flexibility" },
  { id: "athleticism", label: "Athleticism" },
];

const BODY_TYPES = [
  { id: "ectomorph", label: "Ectomorph" },
  { id: "mesomorph", label: "Mesomorph" },
  { id: "endomorph", label: "Endomorph" },
];

export default function ProfileSettings() {
  const [, setLocation] = useLocation();
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    username: "",
    address: "",
    city: "",
    state: "",
    country: "",
    age: "",
    dob: "",
    height: "",
    weight: "",
    bodyType: "",
    dietaryPreferences: "",
    favoriteFoods: "",
    dislikedFoods: "",
    allergies: "",
    goals: [],
    emergencyContact: "",
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      setLocation("/auth");
      return;
    }

    const user = getCurrentUserProfile();
    if (user && user.profile) {
      setFormData((prev: any) => ({
        ...prev,
        ...user.profile,
        goals: user.profile.goals || [],
      }));
    }
  }, [setLocation]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleGoalToggle = (goalId: string) => {
    setFormData((prev: any) => {
      const currentGoals = prev.goals || [];
      const newGoals = currentGoals.includes(goalId)
        ? currentGoals.filter((g: string) => g !== goalId)
        : [...currentGoals, goalId];
      return { ...prev, goals: newGoals };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(formData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Layout>
      <header className="mb-8 pt-4">
        <div className="flex items-center gap-4 mb-4">
          <img src="/logo.png" alt="Untamed Fit" className="h-12 w-12 object-contain" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display text-white">
          PROFILE <span className="text-primary text-glow">SETTINGS</span>
        </h1>
        <p className="text-silver mt-2 uppercase tracking-widest text-sm">Update your information for a personalized experience.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-8 max-w-4xl pb-20">
        {/* Section: Basic Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display font-bold text-white uppercase">Basic Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-silver uppercase font-bold tracking-widest">Full Name</label>
              <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Kevin Gilliam" className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-silver uppercase font-bold tracking-widest">Username</label>
              <Input value={formData.username} onChange={(e) => handleChange("username", e.target.value)} placeholder="kg_beast" className="bg-white/5 border-white/10" />
            </div>
          </div>
        </motion.div>

        {/* Section: Location */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display font-bold text-white uppercase">Location</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-silver uppercase font-bold tracking-widest">Address</label>
              <Input value={formData.address} onChange={(e) => handleChange("address", e.target.value)} placeholder="123 Hustle St" className="bg-white/5 border-white/10" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-[10px] text-silver uppercase font-bold tracking-widest">City</label>
                <Input value={formData.city} onChange={(e) => handleChange("city", e.target.value)} placeholder="Detroit" className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-silver uppercase font-bold tracking-widest">State</label>
                <Input value={formData.state} onChange={(e) => handleChange("state", e.target.value)} placeholder="MI" className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-silver uppercase font-bold tracking-widest">Country</label>
                <Input value={formData.country} onChange={(e) => handleChange("country", e.target.value)} placeholder="USA" className="bg-white/5 border-white/10" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section: Physicals */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <Scale className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display font-bold text-white uppercase">Physical Attributes</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-silver uppercase font-bold tracking-widest">Age</label>
              <Input type="number" value={formData.age} onChange={(e) => handleChange("age", e.target.value)} placeholder="30" className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-[10px] text-silver uppercase font-bold tracking-widest">DOB</label>
              <Input type="date" value={formData.dob} onChange={(e) => handleChange("dob", e.target.value)} className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-silver uppercase font-bold tracking-widest">Height (in)</label>
              <Input type="number" value={formData.height} onChange={(e) => handleChange("height", e.target.value)} placeholder="72" className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-silver uppercase font-bold tracking-widest">Weight (lbs)</label>
              <Input type="number" value={formData.weight} onChange={(e) => handleChange("weight", e.target.value)} placeholder="200" className="bg-white/5 border-white/10" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <label className="text-[10px] text-silver uppercase font-bold tracking-widest">Body Type</label>
            <Select value={formData.bodyType} onValueChange={(val) => handleChange("bodyType", val)}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Select Body Type" />
              </SelectTrigger>
              <SelectContent>
                {BODY_TYPES.map(bt => (
                  <SelectItem key={bt.id} value={bt.id}>{bt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Section: Nutrition */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <Utensils className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display font-bold text-white uppercase">Nutrition & Diet</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-silver uppercase font-bold tracking-widest">Dietary Preferences</label>
              <Input value={formData.dietaryPreferences} onChange={(e) => handleChange("dietaryPreferences", e.target.value)} placeholder="e.g. Keto, Vegan, High Protein" className="bg-white/5 border-white/10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] text-silver uppercase font-bold tracking-widest">Favorite Foods</label>
                <Textarea value={formData.favoriteFoods} onChange={(e) => handleChange("favoriteFoods", e.target.value)} placeholder="Chicken, Steak, Rice..." className="bg-white/5 border-white/10 min-h-[80px]" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-silver uppercase font-bold tracking-widest">Disliked Foods</label>
                <Textarea value={formData.dislikedFoods} onChange={(e) => handleChange("dislikedFoods", e.target.value)} placeholder="Broccoli, Liver..." className="bg-white/5 border-white/10 min-h-[80px]" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-silver uppercase font-bold tracking-widest">Allergies</label>
              <Input value={formData.allergies} onChange={(e) => handleChange("allergies", e.target.value)} placeholder="Peanuts, Shellfish..." className="bg-white/5 border-white/10" />
            </div>
          </div>
        </motion.div>

        {/* Section: Goals */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display font-bold text-white uppercase">Fitness Goals</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GOALS.map(goal => (
              <div key={goal.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-primary/20 transition-colors cursor-pointer" onClick={() => handleGoalToggle(goal.id)}>
                <Checkbox checked={formData.goals?.includes(goal.id)} onCheckedChange={() => handleGoalToggle(goal.id)} className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-black" />
                <span className="text-sm font-bold text-white uppercase">{goal.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section: Emergency */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <Phone className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display font-bold text-white uppercase">Emergency Contact</h2>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-silver uppercase font-bold tracking-widest">Contact Info (Name & Phone)</label>
            <Input value={formData.emergencyContact} onChange={(e) => handleChange("emergencyContact", e.target.value)} placeholder="Jane Doe - 555-0123" className="bg-white/5 border-white/10" />
          </div>
        </motion.div>

        {/* Action Bar */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
          <div className="glass-panel p-4 rounded-full border border-primary/20 shadow-2xl flex items-center justify-between gap-4">
            <AnimatePresence>
              {success && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex items-center gap-2 text-primary font-bold text-xs uppercase">
                  <CheckCircle className="w-5 h-5" />
                  Profile Updated
                </motion.div>
              )}
            </AnimatePresence>
            <Button type="submit" className="w-full bg-primary text-black hover:opacity-90 rounded-full font-bold uppercase tracking-widest h-12 flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Layout>
  );
}
