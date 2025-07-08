import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import { Box, CircularProgress, Alert, Typography, useTheme } from '@mui/material';

// Import HLS support
import '@videojs/http-streaming';

// Define Video.js options type if not available
interface VideoJsPlayerOptions {
  autoplay?: boolean | string;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  fluid?: boolean;
  responsive?: boolean;
  preload?: string;
  sources?: Array<{
    src: string;
    type?: string;
  }>;
  poster?: string;
  html5?: any;
  errorDisplay?: boolean;
  playbackRates?: number[];
  userActions?: {
    hotkeys?: boolean;
  };
  [key: string]: any;
}

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  width?: string | number;
  height?: string | number;
  onReady?: (player: Player) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  fluid?: boolean;
  responsive?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  debug?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  autoplay = false,
  controls = true,
  loop = false,
  muted = false,
  width = '100%',
  height = '400px', // Set a default height
  onReady,
  onPlay,
  onPause,
  onEnded,
  onError,
  onTimeUpdate,
  fluid = true,
  responsive = true,
  preload = 'auto',
  debug = false,
}) => {
  const videoRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const theme = useTheme();

  // Add custom CSS for the video player styling
  useEffect(() => {
    const primaryColor = theme.palette.primary.main;
    
    // Create or update the custom styles
    let styleSheet = document.getElementById('custom-video-js-styles') as HTMLStyleElement;
    if (!styleSheet) {
      styleSheet = document.createElement('style');
      styleSheet.id = 'custom-video-js-styles';
      document.head.appendChild(styleSheet);
    }

    styleSheet.textContent = `
      /* Player container rounded corners */
      .video-js {
        border-radius: 12px !important;
        overflow: hidden !important;
      }

      /* Hide the default big play button */
      .video-js .vjs-big-play-button {
        display: none !important;
      }

      /* Custom minimalistic play button */
      .video-js .vjs-custom-play-button {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 60px;
        height: 60px;
        background-color: ${primaryColor};
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .video-js .vjs-custom-play-button:hover {
        background-color: ${primaryColor}dd;
        transform: translate(-50%, -50%) scale(1.1);
      }

      .video-js .vjs-custom-play-button::before {
        content: '';
        width: 0;
        height: 0;
        border-left: 18px solid white;
        border-top: 12px solid transparent;
        border-bottom: 12px solid transparent;
        margin-left: 4px;
      }

      .video-js.vjs-playing .vjs-custom-play-button {
        display: none;
      }

      /* Control bar styling */
      .video-js .vjs-control-bar {
        background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%);
        border-radius: 0 0 12px 12px;
      }

      /* Progress bar styling */
      .video-js .vjs-progress-control .vjs-progress-holder {
        background-color: rgba(255, 255, 255, 0.2);
      }

      .video-js .vjs-progress-control .vjs-play-progress {
        background-color: ${primaryColor};
      }

      .video-js .vjs-progress-control .vjs-load-progress {
        background-color: rgba(255, 255, 255, 0.4);
      }

      /* Volume slider styling */
      .video-js .vjs-volume-level {
        background-color: ${primaryColor};
      }

      /* Button hover effects */
      .video-js .vjs-control-bar .vjs-button:hover {
        color: ${primaryColor};
      }      /* Playback rate menu styling */
      .video-js .vjs-playback-rate .vjs-playback-rate-value {
        font-size: 0.9em;
        line-height: 1.8;
      }

      .video-js .vjs-menu .vjs-menu-content {
        background-color: white;
        border-radius: 8px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-height: 200px;
        overflow-y: auto;
        overflow-x: hidden;
        color: #333;
      }

      .video-js .vjs-menu .vjs-menu-content::-webkit-scrollbar {
        width: 4px;
      }

      .video-js .vjs-menu .vjs-menu-content::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
        border-radius: 2px;
      }

      .video-js .vjs-menu .vjs-menu-content::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 2px;
      }

      .video-js .vjs-menu .vjs-menu-content::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.3);
      }

      .video-js .vjs-menu li {
        font-size: 0.85em;
        padding: 8px 12px;
        color: #333;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }

      .video-js .vjs-menu li:last-child {
        border-bottom: none;
      }

      .video-js .vjs-menu li.vjs-selected {
        background-color: ${primaryColor};
        color: white;
      }

      .video-js .vjs-menu li:hover {
        background-color: ${primaryColor}22;
        color: #333;
      }

      .video-js .vjs-menu li.vjs-selected:hover {
        background-color: ${primaryColor};
        color: white;
      }
    `;

    // Cleanup function
    return () => {
      if (styleSheet && styleSheet.parentNode) {
        styleSheet.parentNode.removeChild(styleSheet);
      }
    };
  }, [theme.palette.primary.main]);

  useEffect(() => {
    if (!videoRef.current || !src) return;    const videoElement = document.createElement('video-js');
    videoElement.classList.add('vjs-custom-skin');
    videoElement.setAttribute('style', 'width: 100%; height: 100%;');
    videoRef.current.appendChild(videoElement);

    // Determine source type based on URL
    let sourceType = 'video/mp4'; // default
    if (src.includes('.m3u8')) {
      sourceType = 'application/x-mpegURL';
    } else if (src.includes('.mpd')) {
      sourceType = 'application/dash+xml';
    } else if (src.includes('.webm')) {
      sourceType = 'video/webm';
    } else if (src.includes('.ogg')) {
      sourceType = 'video/ogg';
    }

    if (debug) {
      console.log('Initializing video player with:', { src, sourceType });
    }    // Video.js options
    const options: VideoJsPlayerOptions = {
      autoplay,
      controls,
      loop,
      muted,
      fluid,
      responsive,
      preload,
      sources: [{
        src,
        type: sourceType,
      }],
      poster,
      html5: {
        vhs: {
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          overrideNative: !videojs.browser.IS_SAFARI,
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
      // Enable error display
      errorDisplay: true,
      // Increase timeout for slow connections
      timeout: 45000,
      // Add playback rate control
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      // Enable hotkeys
      userActions: {
        hotkeys: true,
      },
    };

    try {      // Initialize Video.js
      const player = videojs(videoElement, options, function onPlayerReady() {
        console.log('Player is ready');
        setInitialized(true);
        setLoading(false);
        
        // Add custom play button
        const customPlayButton = document.createElement('button');
        customPlayButton.className = 'vjs-custom-play-button';
        customPlayButton.addEventListener('click', () => {
          if (player.paused()) {
            player.play();
          }
        });
        player.el().appendChild(customPlayButton);
        
        // Log player state for debugging
        if (debug) {
          console.log('Player initialized:', {
            src: player.currentSrc(),
            duration: player.duration(),
            paused: player.paused(),
            readyState: player.readyState(),
          });
        }
        
        if (onReady) {
          onReady(player);
        }
      });

      playerRef.current = player;

      // Event listeners
      player.on('loadstart', () => {
        if (debug) console.log('Load started');
        setLoading(true);
        setError(null);
      });

      player.on('loadeddata', () => {
        if (debug) console.log('Data loaded');
        setLoading(false);
      });

      player.on('play', () => {
        if (onPlay) onPlay();
      });

      player.on('pause', () => {
        if (onPause) onPause();
      });

      player.on('ended', () => {
        if (onEnded) onEnded();
      });

      player.on('error', (e: any) => {
        const playerError = player.error();
        const errorMessage = playerError ? 
          `Error Code: ${playerError.code}, Message: ${playerError.message}` : 
          'Unknown error occurred';
        
        console.error('Video.js error:', errorMessage, e);
        setError(errorMessage);
        setLoading(false);
        
        if (onError) onError(playerError || e);
      });

      player.on('timeupdate', () => {
        if (onTimeUpdate) {
          onTimeUpdate(player.currentTime() || 0, player.duration() || 0);
        }
      });

      // Add source error handling
      player.on('sourceerror', (e: any) => {
        console.error('Source error:', e);
        setError('Failed to load video source. Please check the URL and CORS settings.');
      });

      // Try to load the source explicitly
      player.src({ type: sourceType, src });
      
      // For debugging - check ready state after a delay
      if (debug) {
        setTimeout(() => {
          console.log('Player state after 2s:', {
            readyState: player.readyState(),
            networkState: player.networkState(),
            error: player.error(),
            currentSrc: player.currentSrc(),
          });
        }, 2000);
      }

    } catch (err) {
      console.error('Failed to initialize player:', err);
      setError('Failed to initialize video player');
      setLoading(false);
    }

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
        setInitialized(false);
      }
    };
  }, [src, debug]);
  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Video container */}
      <div ref={videoRef} style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }} />

      {/* Loading indicator */}
      {loading && !error && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <CircularProgress color="primary" />
          <Typography variant="body2" sx={{ color: 'white', mt: 2 }}>
            Loading video...
          </Typography>
        </Box>
      )}

      {/* Error display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            position: 'absolute',
            top: 20,
            left: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          {error}
        </Alert>
      )}

      {/* Debug info */}
      {debug && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: 1,
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 1000,
          }}
        >
          <div>Src: {src}</div>
          <div>Initialized: {initialized ? 'Yes' : 'No'}</div>
          <div>Loading: {loading ? 'Yes' : 'No'}</div>
        </Box>
      )}
    </Box>
  );
};

export default VideoPlayer;

// Example usage with debugging:
/*
import VideoPlayer from './VideoPlayer';

// Basic usage
<VideoPlayer
  src="https://your-video-url.mp4"
  controls={true}
  debug={true} // Enable debug mode to see what's happening
/>

// For Flask backend with CORS headers needed:
// Make sure your Flask endpoint includes these headers:
// response.headers['Access-Control-Allow-Origin'] = '*'
// response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
// response.headers['Access-Control-Allow-Headers'] = 'Range'

// For Bunny CDN
<VideoPlayer
  src="https://your-pull-zone.b-cdn.net/video.mp4"
  height="500px"
/>

// For HLS streaming
<VideoPlayer
  src="https://example.com/playlist.m3u8"
  muted={true} // Often needed for autoplay
  autoplay={true}
/>
*/