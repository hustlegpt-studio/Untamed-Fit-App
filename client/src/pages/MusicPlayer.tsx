import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Heart, MoreHorizontal, ChevronLeft, ChevronRight, List, Home, Search, Library, Radio, Music, Minimize2, Maximize2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSpotifyPlayer, SpotifyPlayerProvider } from "@/contexts/SpotifyPlayerContext";
import { DraggablePlayer } from "@/components/DraggablePlayer";

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

const MusicPlayerContent: React.FC = () => {
  const { data: user } = useAuth();
  const [isPremium] = useState(user?.subscriptionTier === "pro" || user?.subscriptionTier === "elite");
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  
  const { 
    state, 
    play, 
    pause, 
    next, 
    previous, 
    seek, 
    setVolume, 
    loadPlaylist, 
    initialize,
    fallbackToEmbed 
  } = useSpotifyPlayer();

  useEffect(() => {
    // Initialize Spotify player
    initialize();
  }, []);

  useEffect(() => {
    // Get playlist from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const playlistId = urlParams.get('playlist');
    
    if (playlistId) {
      const playlist = playlists.find(p => p.id === playlistId);
      if (playlist) {
        setCurrentPlaylist(playlist);
        // Load playlist into Spotify player
        const playlistUri = `spotify:playlist:${playlist.url.split('/').pop()?.split('?')[0]}`;
        loadPlaylist(playlistUri);
      }
    }
  }, [loadPlaylist]);

  const handlePlayPause = () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleSkipNext = () => {
    next();
  };

  const handleSkipPrevious = () => {
    previous();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = Number(e.target.value) / 100;
    setVolume(volume);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const position = (Number(e.target.value) / 100) * state.duration;
    seek(position);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const Sidebar = () => (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: sidebarOpen ? 0 : -300 }}
      className="w-64 h-full bg-black/50 backdrop-blur-lg border-r border-gray-800 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-600 rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">UNTAMED</h1>
            <p className="text-gray-400 text-xs">FITNESS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors">
            <Home className="w-5 h-5" />
            <span className="font-medium">Home</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors">
            <Search className="w-5 h-5" />
            <span className="font-medium">Search</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors">
            <Library className="w-5 h-5" />
            <span className="font-medium">Your Library</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-primary hover:bg-primary/10 rounded-lg transition-colors">
            <Radio className="w-5 h-5" />
            <span className="font-medium">Radio</span>
          </button>
        </div>

        {/* Playlists Section */}
        <div className="mt-8">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 px-4">KG's Playlists</h3>
          <div className="space-y-1">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => setCurrentPlaylist(playlist)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left ${
                  currentPlaylist?.id === playlist.id
                    ? 'bg-primary/20 text-primary'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <img
                  src={playlist.coverUrl}
                  alt={playlist.title}
                  className="w-8 h-8 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{playlist.title}</p>
                  <p className="text-xs text-gray-400">{playlist.category}</p>
                </div>
                {playlist.isPremium && (
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Powered by Spotify */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
          <span>Powered by</span>
          <div className="w-16 h-4 bg-green-500 rounded-sm flex items-center justify-center">
            <span className="text-black text-xs font-bold">Spotify</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const MainContent = () => (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-900 to-black">
      {/* Top Bar */}
      <div className="h-16 bg-black/50 backdrop-blur-lg border-b border-gray-800 flex items-center justify-between px-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white hover:text-primary transition-colors"
        >
          <ChevronRight className={`w-6 h-6 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
        
        <div className="flex items-center gap-4">
          <button className="text-white hover:text-primary transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button className="text-white hover:text-primary transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-white hover:text-primary transition-colors">
            <List className="w-6 h-6" />
          </button>
          <button className="text-white hover:text-primary transition-colors">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {/* Playlist Info */}
        <div className="flex-1 p-8">
          {currentPlaylist ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <div className="flex items-start gap-8 mb-8">
                <img
                  src={currentPlaylist.coverUrl}
                  alt={currentPlaylist.title}
                  className="w-64 h-64 rounded-lg shadow-2xl object-cover"
                />
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-white mb-4">{currentPlaylist.title}</h1>
                  <p className="text-gray-300 mb-4">{currentPlaylist.category}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {currentPlaylist.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-gray-400">
                    <span>{currentPlaylist.duration}</span>
                    <span>Energy: {currentPlaylist.energy}/5</span>
                    {currentPlaylist.isPremium && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs font-bold">
                        PREMIUM
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Spotify Player */}
              <div className="bg-black/30 backdrop-blur-lg rounded-lg p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-lg">Spotify Player</h3>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsMiniPlayer(!isMiniPlayer)}
                      className="flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold hover:bg-primary/30 transition-colors"
                    >
                      {isMiniPlayer ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                      <span>{isMiniPlayer ? 'Large Player' : 'Mini Player'}</span>
                    </button>
                    <div className="flex items-center gap-2 text-green-500 text-xs">
                      <span>Powered by</span>
                      <div className="w-12 h-3 bg-green-500 rounded-sm flex items-center justify-center">
                        <span className="text-black text-xs font-bold">Spotify</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {state.isReady ? (
                  <div className="space-y-6">
                    {/* Connect Spotify Button for unauthenticated users */}
                    {!state.isUsingSDK && !state.error && (
                      <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-bold text-lg mb-2">Connect Spotify</h3>
                            <p className="text-green-100 text-sm">Connect your Spotify account to enable full playback features</p>
                          </div>
                          <button
                            onClick={() => window.location.href = '/api/spotify/login'}
                            className="px-4 py-2 bg-green-500 text-black rounded-lg font-bold hover:bg-green-600 transition-colors"
                          >
                            Connect Spotify
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {state.error && (
                      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4">
                        <p className="text-yellow-500 text-sm mb-2">{state.error}</p>
                        {state.isUsingSDK && (
                          <button
                            onClick={() => fallbackToEmbed()}
                            className="bg-green-500 hover:bg-green-600 text-black px-3 py-1 rounded text-sm transition-colors"
                          >
                            Switch to Embed Player
                          </button>
                        )}
                      </div>
                    )}
                    
                    {state.isUsingSDK ? (
                      // Web Playback SDK Interface
                      <>
                        {/* Album Art */}
                        <div className="w-32 h-32 rounded-lg overflow-hidden mb-4 shadow-lg">
                          <img
                            src={state.currentTrack?.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop'}
                            alt="Album Art"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Track Info */}
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold text-white mb-2">
                            {state.currentTrack?.name || 'No track playing'}
                          </h3>
                          <p className="text-gray-400 text-lg">
                            {state.currentTrack?.artist || 'Unknown artist'}
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            {state.currentTrack?.album || 'Unknown album'}
                          </p>
                        </div>

                        {/* Progress Bar with Seek */}
                        <div className="mb-6">
                          <div 
                            className="relative h-2 bg-gray-700 rounded-full overflow-hidden mb-2 cursor-pointer"
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = e.clientX - rect.left;
                              const percentage = x / rect.width;
                              const newPosition = percentage * state.duration;
                              seek(newPosition);
                            }}
                          >
                            <div
                              className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-100"
                              style={{ width: `${(state.position / state.duration) * 100}%` }}
                            />
                            <div 
                              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
                              style={{ left: `${(state.position / state.duration) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{formatTime(state.position)}</span>
                            <span>{formatTime(state.duration)}</span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-6 mb-6">
                          <button
                            onClick={() => previous()}
                            className="text-gray-400 hover:text-white transition-colors p-2"
                          >
                            <SkipBack className="w-6 h-6" />
                          </button>
                          <button
                            onClick={() => handlePlayPause()}
                            className="w-16 h-16 bg-green-500 text-black rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg"
                          >
                            {state.isPlaying ? (
                              <Pause className="w-8 h-8" />
                            ) : (
                              <Play className="w-8 h-8 fill-current ml-1" />
                            )}
                          </button>
                          <button
                            onClick={() => next()}
                            className="text-gray-400 hover:text-white transition-colors p-2"
                          >
                            <SkipForward className="w-6 h-6" />
                          </button>
                        </div>

                        {/* Volume Control */}
                        <div className="flex items-center gap-3">
                          <Volume2 className="w-5 h-5 text-gray-400" />
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={state.volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-gray-400 text-sm w-10">
                            {Math.round(state.volume * 100)}%
                          </span>
                        </div>

                        {/* Device Info */}
                        {state.deviceId && (
                          <div className="mt-4 text-xs text-gray-500 text-center">
                            Playing on: Untamed Fitness Web Player
                          </div>
                        )}
                      </>
                    ) : (
                      // Fallback to Embed Player
                      <>
                        {currentPlaylist && (
                          <iframe
                            src={`https://open.spotify.com/embed/playlist/${currentPlaylist.url.split('/').pop()?.split('?')[0]}?utm_source=generator&theme=0`}
                            width="100%"
                            height="380"
                            frameBorder="0"
                            allowFullScreen=""
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            className="rounded-lg bg-black"
                          />
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Initializing Spotify Player...</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">No Playlist Selected</h2>
                <p className="text-gray-400">Choose a playlist from the sidebar to start listening</p>
              </div>
            </div>
          )}
        </div>
      </div>

          </div>
  );

  const MiniPlayer = () => {
  if (!currentPlaylist) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 right-4 w-80 h-32 bg-black/90 backdrop-blur-lg border border-gray-800 rounded-lg shadow-2xl z-50"
      style={{
        // Make draggable
        position: 'fixed',
        cursor: 'move'
      }}
    >
      <div className="p-3 h-full flex items-center gap-3">
        {/* Cover Image */}
        <img
          src={currentPlaylist.coverUrl}
          alt={currentPlaylist.title}
          className="w-16 h-16 rounded object-cover"
        />
        
        {/* Info and Controls */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white text-sm font-bold truncate">{currentPlaylist.title}</h4>
            <button
              onClick={() => setIsMiniPlayer(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Mini Spotify Embed */}
          <iframe
            src={`https://open.spotify.com/embed/playlist/${currentPlaylist.url.split('/').pop()?.split('?')[0]}?utm_source=generator&theme=0`}
            width="100%"
            height="80"
            frameBorder="0"
            allowFullScreen=""
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded bg-black"
          />
        </div>
      </div>
    </motion.div>
  );
};

  return (
    <Layout>
      <div className="h-screen bg-black flex overflow-hidden">
        <Sidebar />
        {isMiniPlayer ? null : <MainContent />}
      </div>
      <DraggablePlayer isVisible={isMiniPlayer} onClose={() => setIsMiniPlayer(false)} />
    </Layout>
  );
}

export default function MusicPlayer() {
  return (
    <SpotifyPlayerProvider>
      <MusicPlayerContent />
    </SpotifyPlayerProvider>
  );
}
