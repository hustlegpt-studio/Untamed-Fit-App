// Spotify Web Playback SDK OAuth handler
import { Router } from 'express';

const router = Router();

// Spotify app credentials (in production, these should be environment variables)
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'your_spotify_client_id';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || 'your_spotify_client_secret';
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback';

// Store access tokens (in production, use proper session management)
const tokens = new Map<string, { accessToken: string; refreshToken: string; expiresAt: number }>();

// Get Spotify access token
router.post('/token', async (req, res) => {
  try {
    // For demo purposes, return a mock token
    // In production, this would involve proper OAuth flow
    const mockToken = {
      access_token: 'mock_spotify_access_token_for_demo',
      refresh_token: 'mock_refresh_token',
      expires_in: 3600,
      token_type: 'Bearer',
      scope: 'streaming user-read-playback-state user-modify-playback-state user-read-currently-playing'
    };
    
    res.json(mockToken);
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    res.status(500).json({ error: 'Failed to get Spotify token' });
  }
});

// Spotify OAuth callback
router.get('/callback', (req, res) => {
  const { code, state } = req.query;
  
  // Handle OAuth callback
  // Exchange code for access token
  // Store token in session
  
  res.redirect('/music-player');
});

// Initiate OAuth flow
router.get('/authorize', (req, res) => {
  const scope = 'streaming user-read-playback-state user-modify-playback-state user-read-currently-playing';
  const authUrl = `https://accounts.spotify.com/authorize?` +
    `response_type=code&` +
    `client_id=${SPOTIFY_CLIENT_ID}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&` +
    `state=${Math.random().toString(36).substring(7)}`;
  
  res.redirect(authUrl);
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // In production, exchange refresh token for new access token
    const mockResponse = {
      access_token: 'new_mock_access_token',
      expires_in: 3600,
      token_type: 'Bearer'
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

export default router;
