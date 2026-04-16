import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  uri: string;
  imageUrl?: string;
}

interface SpotifyPlayerState {
  isReady: boolean;
  isPlaying: boolean;
  currentTrack: SpotifyTrack | null;
  volume: number;
  position: number;
  duration: number;
  isPremium: boolean;
  deviceId: string | null;
  isUsingSDK: boolean;
  error: string | null;
}

interface SpotifyPlayerContextType {
  player: any; // Spotify.Player instance
  state: SpotifyPlayerState;
  play: (uri?: string) => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  seek: (position: number) => void;
  loadPlaylist: (playlistUri: string) => void;
  initialize: () => Promise<void>;
  fallbackToEmbed: () => void;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | null>(null);

export const useSpotifyPlayer = () => {
  const context = useContext(SpotifyPlayerContext);
  if (!context) {
    throw new Error('useSpotifyPlayer must be used within SpotifyPlayerProvider');
  }
  return context;
};

interface SpotifyPlayerProviderProps {
  children: ReactNode;
}

export const SpotifyPlayerProvider: React.FC<SpotifyPlayerProviderProps> = ({ children }) => {
  const [player, setPlayer] = useState<any>(null);
  const [state, setState] = useState<SpotifyPlayerState>({
    isReady: false,
    isPlaying: false,
    currentTrack: null,
    volume: 0.7,
    position: 0,
    duration: 0,
    isPremium: false,
    deviceId: null,
    isUsingSDK: false,
    error: null,
  });
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number>(0);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Load Spotify Web Playback SDK
  const loadSpotifySDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.Spotify) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Spotify SDK'));
      document.body.appendChild(script);
    });
  };

  // Refresh Spotify access token
  const refreshAccessToken = async (): Promise<string> => {
    try {
      const response = await fetch('/api/spotify/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      const data = await response.json();
      
      // Update stored token and expiry
      const newToken = data.access_token;
      const newExpiry = Date.now() + (data.expires_in * 1000);
      
      setAccessToken(newToken);
      setTokenExpiry(newExpiry);
      
      // Store in localStorage
      localStorage.setItem('spotify_access_token', newToken);
      localStorage.setItem('spotify_token_expiry', newExpiry.toString());
      
      return newToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  };

  // Get Spotify access token from backend
  const getSpotifyToken = async (): Promise<string> => {
    try {
      // Check if we have a valid token stored
      const urlParams = new URLSearchParams(window.location.search);
      const authStatus = urlParams.get('auth');
      
      if (authStatus === 'success') {
        // Fresh login, get token from backend
        const response = await fetch('/api/spotify/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: urlParams.get('code') })
        });
        
        if (!response.ok) {
          throw new Error('Failed to get token from backend');
        }
        
        const data = await response.json();
        
        // Store token and expiry
        const token = data.access_token;
        const expiry = Date.now() + (data.expires_in * 1000);
        
        setAccessToken(token);
        setTokenExpiry(expiry);
        setRefreshToken(data.refresh_token);
        
        // Store in localStorage
        localStorage.setItem('spotify_access_token', token);
        localStorage.setItem('spotify_token_expiry', expiry.toString());
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
        
        return token;
      }
      
      // Check for existing valid token in session
      const storedToken = localStorage.getItem('spotify_access_token');
      const storedExpiry = localStorage.getItem('spotify_token_expiry');
      const storedRefresh = localStorage.getItem('spotify_refresh_token');
      
      if (storedToken && storedExpiry && Date.now() < parseInt(storedExpiry)) {
        setAccessToken(storedToken);
        setTokenExpiry(parseInt(storedExpiry));
        setRefreshToken(storedRefresh);
        return storedToken;
      }
      
      // Try to refresh if we have a refresh token
      if (storedRefresh) {
        const refreshedToken = await refreshAccessToken();
        return refreshedToken;
      }
      
      throw new Error('No valid Spotify token available');
    } catch (error) {
      console.error('Failed to get Spotify token:', error);
      throw error;
    }
  };

  // Initialize Spotify player
  const initialize = async () => {
    try {
      setState(prev => ({ ...prev, error: null, isReady: false }));
      
      // Check if running on HTTPS (required for Web Playback SDK)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        throw new Error('Spotify Web Playback SDK requires HTTPS. Please use https://localhost:9688');
      }
      
      // Try to load SDK and get token
      await loadSpotifySDK();
      const token = await getSpotifyToken();
      
      // Check if token is valid
      if (!token || token.length < 50) {
        throw new Error('Invalid Spotify access token. Please connect your Spotify account.');
      }
      
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Untamed Fitness Web Player',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(token);
        },
        volume: state.volume,
      });

      // Set up comprehensive event listeners
      spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Spotify SDK Ready with Device ID', device_id);
        setState(prev => ({ 
          ...prev, 
          deviceId: device_id, 
          isReady: true, 
          isUsingSDK: true,
          error: null 
        }));
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Spotify SDK Device ID has gone offline', device_id);
        setState(prev => ({ ...prev, isReady: false }));
      });

      spotifyPlayer.addListener('player_state_changed', (playerState: any) => {
        if (!playerState) return;

        const currentTrack = playerState.track_window.current_track;
        const track: SpotifyTrack = {
          id: currentTrack.id,
          name: currentTrack.name,
          artist: currentTrack.artists.map((a: any) => a.name).join(', '),
          album: currentTrack.album.name,
          duration: currentTrack.duration_ms,
          uri: currentTrack.uri,
          imageUrl: currentTrack.album.images[0]?.url,
        };

        setState(prev => ({
          ...prev,
          currentTrack: track,
          isPlaying: !playerState.paused,
          position: playerState.position,
          duration: playerState.duration,
        }));
      });

      spotifyPlayer.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('Spotify SDK Initialization Error:', message);
        setState(prev => ({ 
          ...prev, 
          error: `SDK Initialization Error: ${message}`,
          isUsingSDK: false,
          isReady: true 
        }));
      });

      spotifyPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('Spotify SDK Authentication Error:', message);
        setState(prev => ({ 
          ...prev, 
          error: `Authentication Error: ${message}`,
          isUsingSDK: false,
          isReady: true 
        }));
      });

      spotifyPlayer.addListener('account_error', ({ message }: { message: string }) => {
        console.error('Spotify SDK Account Error:', message);
        setState(prev => ({ 
          ...prev, 
          error: `Account Error: ${message}. Spotify Premium required for Web Playback SDK.`,
          isUsingSDK: false,
          isReady: true 
        }));
      });

      spotifyPlayer.addListener('playback_error', ({ message }: { message: string }) => {
        console.error('Spotify SDK Playback Error:', message);
        setState(prev => ({ 
          ...prev, 
          error: `Playback Error: ${message}`,
          isUsingSDK: false,
          isReady: true 
        }));
      });

      // Connect the player
      const connected = await spotifyPlayer.connect();
      if (!connected) {
        throw new Error('Failed to connect to Spotify SDK');
      }
      
      setPlayer(spotifyPlayer);
      console.log('Spotify SDK connected successfully');

    } catch (error) {
      console.error('Error initializing Spotify player:', error);
      // Fall back to embed player mode
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Spotify Web Playback SDK not available. Using embed player.',
        isUsingSDK: false,
        isReady: true // Mark as ready for embed player
      }));
    }
  };

  // Player controls
  const play = async (uri?: string) => {
    if (!player || !state.deviceId) return;

    try {
      if (state.isUsingSDK && player) {
        // Use SDK controls
        await player.resume();
        if (uri) {
          // Play specific track/playlist
          await fetch('/api/spotify/play', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uris: [uri], device_id: state.deviceId })
          });
        }
      } else {
        // Fallback to API
        await fetch('/api/spotify/play', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uris: uri ? [uri] : [], device_id: state.deviceId })
        });
      }
      setState(prev => ({ ...prev, isPlaying: true }));
    } catch (error) {
      console.error('Error playing:', error);
    }
  };

  const pause = async () => {
    if (!player || !state.deviceId) return;

    try {
      if (state.isUsingSDK && player) {
        // Use SDK controls
        await player.pause();
      } else {
        // Fallback to API
        await fetch('/api/spotify/pause', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_id: state.deviceId })
        });
      }
      setState(prev => ({ ...prev, isPlaying: false }));
    } catch (error) {
      console.error('Error pausing:', error);
    }
  };

  const nextTrack = async () => {
    if (!player || !state.deviceId) return;

    try {
      if (state.isUsingSDK && player) {
        // Use SDK controls
        await player.nextTrack();
      } else {
        // Fallback to API
        await fetch('/api/spotify/next', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_id: state.deviceId })
        });
      }
    } catch (error) {
      console.error('Error skipping to next track:', error);
    }
  };

  const previousTrack = async () => {
    if (!player || !state.deviceId) return;

    try {
      if (state.isUsingSDK && player) {
        // Use SDK controls
        await player.previousTrack();
      } else {
        // Fallback to API
        await fetch('/api/spotify/previous', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_id: state.deviceId })
        });
      }
    } catch (error) {
      console.error('Error going to previous track:', error);
    }
  };

  const seek = async (positionMs: number) => {
    if (!player || !state.deviceId) return;

    try {
      if (state.isUsingSDK && player) {
        // Use SDK controls
        await player.seek(positionMs);
      } else {
        // Fallback to API
        await fetch('/api/spotify/seek', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ position_ms: positionMs, device_id: state.deviceId })
        });
      }
      setState(prev => ({ ...prev, position: positionMs }));
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const setVolume = async (volume: number) => {
    if (!player || !state.deviceId) return;

    try {
      if (state.isUsingSDK && player) {
        // Use SDK controls
        await player.setVolume(volume);
      } else {
        // Fallback to API
        await fetch('/api/spotify/volume', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ volume_percent: volume * 100, device_id: state.deviceId })
        });
      }
      setState(prev => ({ ...prev, volume }));
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  // Fallback to embed player
  const fallbackToEmbed = () => {
    setState(prev => ({
      ...prev,
      isUsingSDK: false,
      error: 'Switched to embed player mode',
      isReady: true
    }));
  };

  const loadPlaylist = async (playlistUri: string) => {
    if (!player || !state.deviceId) return;

    try {
      // Get playlist tracks
      const playlistId = playlistUri.split(':').pop();
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: {
          'Authorization': `Bearer ${await getSpotifyToken()}`,
        },
      });
      const playlist = await response.json();

      // Play the first track of the playlist
      const firstTrack = playlist.tracks.items[0]?.track;
      if (firstTrack) {
        await play(firstTrack.uri);
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
    }
  };

  const value: SpotifyPlayerContextType = {
    player,
    state,
    play,
    pause,
    next: nextTrack,
    previous: previousTrack,
    setVolume,
    seek,
    loadPlaylist,
    initialize,
    fallbackToEmbed,
  };

  return (
    <SpotifyPlayerContext.Provider value={value}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
};

// Add type declaration for window.Spotify
declare global {
  interface Window {
    Spotify: {
      Player: any;
    };
  }
}
