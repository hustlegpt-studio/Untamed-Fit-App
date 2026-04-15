import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { isOwner, isAuthenticated } from "@/utils/auth";
import { saveVideo } from "@/utils/videos";
import { Video, ShieldCheck, Plus, Link, Upload, CheckCircle } from "lucide-react";

const CATEGORIES = [
  "Chest", "Back", "Shoulders", "Biceps", "Triceps", "Legs", "Abs", "Cardio", "Full Body"
];

export default function UntamedStudio() {
  const [, setLocation] = useLocation();
  const [success, setSuccess] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"upload" | "embed">("embed");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    if (!isOwner()) {
      window.location.href = "/dashboard";
    }
  }, []);

  if (!isOwner()) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !url) return;

    const newVideo = {
      id: crypto.randomUUID(),
      title,
      category,
      type,
      url,
      createdAt: new Date().toISOString()
    };

    saveVideo(newVideo);
    setSuccess(true);
    setTitle("");
    setCategory("");
    setUrl("");
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Layout>
      <header className="mb-8 pt-4">
        <div className="flex items-center gap-4 mb-4">
          <ShieldCheck className="h-12 w-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-display text-white">
            UNTAMED <span className="text-primary text-glow">STUDIO</span>
          </h1>
        </div>
        <p className="text-silver mt-2 uppercase tracking-widest text-sm">Owner Video Management Console</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 rounded-3xl border border-primary/20 max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-silver uppercase font-bold tracking-widest">Video Title</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Morning Shred: Advanced Chest" 
              className="bg-white/5 border-white/10"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-silver uppercase font-bold tracking-widest">Category</label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-silver uppercase font-bold tracking-widest">Video Source Type</label>
              <div className="flex gap-2">
                <Button 
                  type="button"
                  onClick={() => setType("embed")}
                  className={`flex-1 rounded-xl h-10 font-bold uppercase text-[10px] border ${type === "embed" ? "bg-primary text-black border-primary" : "bg-white/5 text-white border-white/10"}`}
                >
                  <Link className="w-3 h-3 mr-2" />
                  Embed
                </Button>
                <Button 
                  type="button"
                  onClick={() => setType("upload")}
                  className={`flex-1 rounded-xl h-10 font-bold uppercase text-[10px] border ${type === "upload" ? "bg-primary text-black border-primary" : "bg-white/5 text-white border-white/10"}`}
                >
                  <Upload className="w-3 h-3 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-silver uppercase font-bold tracking-widest">
              {type === "embed" ? "Video URL (YouTube/Vimeo)" : "Local Video Path"}
            </label>
            <Input 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              placeholder={type === "embed" ? "https://youtube.com/..." : "/videos/workout.mp4"} 
              className="bg-white/5 border-white/10"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary text-black hover:opacity-90 rounded-full font-bold uppercase tracking-widest h-14 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Save Video to Untamed Studio
          </Button>

          {success && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-primary font-bold text-sm uppercase tracking-wider"
            >
              <CheckCircle className="w-5 h-5" />
              Video saved to Untamed Studio
            </motion.div>
          )}
        </form>
      </motion.div>
    </Layout>
  );
}
