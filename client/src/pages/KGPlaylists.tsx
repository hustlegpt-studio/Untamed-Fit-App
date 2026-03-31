import React from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Play, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Playlist {
  id: string;
  title: string;
  url: string;
  coverUrl: string;
  energy: number;
  tags: string[];
  duration: string;
  isPremium?: boolean;
  category: string;
}

const playlists: Playlist[] = [
  {
    id: "untamed-fitness",
    title: "Untamed Fitness",
    url: "https://open.spotify.com/playlist/69p9UJnze06a8hf1ppTHj1?si=FS8MPcUaTTq_beIv52wM7A&pi=KnfHt7OESYeNY&nd=1&dlsi=4b09afab0d654272",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    energy: 5,
    tags: ["Full Body", "HIIT", "Strength"],
    duration: "2h 14m",
    isPremium: true,
    category: "Untamed Signature Mixes",
  },
  {
    id: "military-monday",
    title: "Military Monday",
    url: "https://open.spotify.com/playlist/3birA7raRHqAsduSan6M1e?si=57zJqCfxTs2M-HPbOm2ddg&pi=1eeO1DcYSESfb",
    coverUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop",
    energy: 5,
    tags: ["Cardio", "Intensity", "Endurance"],
    duration: "1h 58m",
    category: "Intensity Boosters",
  },
  {
    id: "beast-mode",
    title: "Beast Mode Bootcamp",
    url: "https://open.spotify.com/playlist/3birA7raRHqAsduSan6M1e?si=57zJqCfxTs2M-HPbOm2ddg&pi=1eeO1DcYSESfb",
    coverUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=300&fit=crop",
    energy: 5,
    tags: ["Heavy", "Strength", "Power"],
    duration: "2h 45m",
    category: "Intensity Boosters",
  },
  {
    id: "zen-party",
    title: "Zen Party",
    url: "https://open.spotify.com/playlist/6lTJBDYBVZf7vlBacC0Oww?si=n2Dq1CZBTbiSV9qTbQr1qg&pi=pnjWoUcnTjCRo",
    coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&h=300&fit=crop",
    energy: 2,
    tags: ["Recovery", "Focus", "Mindfulness"],
    duration: "1h 32m",
    category: "Mindset & Focus",
  },
];

const PlaylistCard = ({ playlist, isPremium }: { playlist: Playlist; isPremium: boolean }) => {
  return (
    <motion.a
      href={playlist.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block rounded-2xl overflow-hidden bg-white border-2 border-green-500 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/30 h-full"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Blurred Background */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-lg opacity-30 group-hover:opacity-50 transition-opacity"
        style={{ backgroundImage: `url(${playlist.coverUrl})` }}
      />

      {/* Light Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-white/20 to-transparent" />

      {/* Content */}
      <div className="relative p-6 h-full flex flex-col justify-between">
        {/* Premium Badge */}
        {playlist.isPremium && (
          <motion.div
            className="absolute top-4 right-4 flex items-center gap-2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {isPremium ? "🔓 Premium" : <><Lock className="w-3 h-3" /> Premium</>}
          </motion.div>
        )}

        {/* Cover Image */}
        <motion.div
          className="mb-4 rounded-lg overflow-hidden border-2 border-green-500 shadow-lg"
          whileHover={{ rotateY: 10 }}
          style={{ perspective: "1000px" }}
        >
          <img
            src={playlist.coverUrl}
            alt={playlist.title}
            className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </motion.div>

        {/* Play Button */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          whileHover={{ scale: 1.1 }}
        >
          <motion.div
            className="bg-green-500 text-white p-4 rounded-full shadow-2xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Play className="w-8 h-8 fill-white" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <h3 className="font-display font-bold text-lg text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
          {playlist.title}
        </h3>

        {/* Energy Meter */}
        <div className="flex gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.span
              key={i}
              className={`text-lg ${i < playlist.energy ? "text-orange-500" : "text-gray-300"}`}
              initial={{ opacity: 0.5 }}
              whileHover={{ opacity: 1, scale: 1.2 }}
            >
              🔥
            </motion.span>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {playlist.tags.map((tag) => (
            <span key={tag} className="text-xs font-bold uppercase tracking-widest px-2 py-1 bg-gray-200 text-gray-900 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Duration */}
        <p className="text-xs text-gray-600 font-semibold">{playlist.duration}</p>
      </div>
    </motion.a>
  );
};

const CategorySection = ({ category, playlists, isPremium }: { category: string; playlists: Playlist[]; isPremium: boolean }) => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-display font-bold text-white mb-6 uppercase tracking-widest border-b-2 border-primary pb-4">{category}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists
          .filter((p) => p.category === category)
          .map((p) => (
            <PlaylistCard key={p.id} playlist={p} isPremium={isPremium} />
          ))}
      </div>
    </section>
  );
};

export default function KGPlaylists() {
  const { data: user } = useAuth();
  const isPremium = user?.subscriptionTier === "pro" || user?.subscriptionTier === "elite";

  const categories = Array.from(new Set(playlists.map((p) => p.category)));

  return (
    <Layout>
      {/* Hero Banner */}
      <motion.section
        className="relative w-full h-80 mb-12 overflow-hidden rounded-b-3xl bg-gradient-to-r from-charcoal via-gray-900 to-black"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Blurred Background */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop)" }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

        {/* Content */}
        <div className="relative h-full flex items-center px-8 md:px-16">
          <motion.div
            className="flex items-center gap-8 w-full"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* Cover Image */}
            <motion.img
              src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop"
              alt="KG's Playlists"
              className="hidden md:block w-48 h-48 rounded-2xl shadow-2xl border-4 border-primary object-cover flex-shrink-0"
              whileHover={{ scale: 1.05, rotate: 2 }}
            />

            {/* Text */}
            <div className="flex-1">
              <motion.h1
                className="text-5xl md:text-6xl font-display font-black mb-3 uppercase tracking-widest text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                KG's <span className="text-primary text-glow">PLAYLISTS</span>
              </motion.h1>
              <motion.p
                className="text-lg md:text-2xl text-silver uppercase tracking-widest"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Curated mixes to fuel your grind.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Playlists Grid */}
      <div className="px-4 md:px-8 pb-16 bg-gradient-to-b from-gray-900 to-black">
        {categories.map((category) => (
          <CategorySection key={category} category={category} playlists={playlists} isPremium={isPremium} />
        ))}
      </div>
    </Layout>
  );
}
