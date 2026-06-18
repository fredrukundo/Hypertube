"use client";

import { useEffect, useRef, useState } from "react";
import { MovieEngine, Subtitle } from "@/types/movie.types";
import { getStreamUrl } from "@/services/movie.service";
import { useMarkAsWatched } from "@/hooks/useMovies";
import { isMovieWatched } from "@/services/movie.service";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Subtitles,
  Loader,
} from "lucide-react";

interface MoviePlayerProps {
  movieId: string;
  engine?: MovieEngine;
  title: string;
  subtitles?: Subtitle[];
  preferredLanguage?: string;
}

export default function MoviePlayer({
  movieId,
  engine = "yts",
  title,
  subtitles = [],
  preferredLanguage = "en",
}: MoviePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>(
    preferredLanguage
  );
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { mutate: markWatched } = useMarkAsWatched();
  const streamUrl = getStreamUrl(movieId, engine);

  // Auto-hide controls
  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    if (isPlaying) {
      controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

  // Video event handlers
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const pct = (video.currentTime / video.duration) * 100;
    setProgress(isNaN(pct) ? 0 : pct);

    // Mark as watched after 30 seconds of playback
 if (!hasStarted && video.currentTime > 30) {
  if (!isMovieWatched(movieId, engine)) {
    markWatched({ movieId, engine });
  }

  setHasStarted(true);
}
  }

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch((err) => {
        if (err.name === "NotSupportedError") {
          setVideoError(
            "This video format is not supported or the source is unavailable."
          );
        }
      });
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    resetControlsTimer();
  };

  const handleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    video.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = (parseFloat(e.target.value) / 100) * video.duration;
    video.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const handleSubtitleChange = (lang: string) => {
    const video = videoRef.current;
    if (!video) return;
    setSelectedSubtitle(lang);
    setShowSubMenu(false);

    // Update active track
    Array.from(video.textTracks).forEach((track) => {
      track.mode = track.language === lang ? "showing" : "hidden";
    });
  };

  // Format seconds  "mm:ss"
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const currentTime = videoRef.current?.currentTime ?? 0;
  const duration = videoRef.current?.duration ?? 0;


  // bonus for keyboard shortcuts
  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const video = videoRef.current;
    if (!video) return;

    // ignore when typing in inputs
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    switch (e.code) {
      case "Space":
        e.preventDefault();
        handlePlayPause();
        break;

      case "KeyM":
        e.preventDefault();
        handleMute();
        break;

      case "KeyF":
        e.preventDefault();
        handleFullscreen();
        break;

      case "ArrowRight":
        e.preventDefault();
        video.currentTime = Math.min(video.currentTime + 10, video.duration);
        break;

      case "ArrowLeft":
        e.preventDefault();
        video.currentTime = Math.max(video.currentTime - 10, 0);
        break;
    }

    resetControlsTimer();
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [isPlaying, isMuted, volume]);

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-2xl overflow-hidden group"
      style={{ aspectRatio: "16/9" }}
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/*  Video element  */}
      <video
        autoPlay={true}
        ref={videoRef}
        src={streamUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onPlaying={() => { setIsPlaying(true); setIsBuffering(false); }}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => { setIsBuffering(false); setVideoError(null); }}
        onError={(e) => {
          setIsBuffering(false);
          
          // Check if it's a 404 error
          const target = e.target as HTMLVideoElement;
          const error = target.error;
          
          if (error?.code === 4) {
            setVideoError(
              "Video streaming is not available yet. The backend stream endpoint needs to be implemented."
            );
          } else {
            setVideoError("This video could not be loaded. The source may be unavailable.");
          }
        }}
        onClick={handlePlayPause}
        preload="metadata"
        crossOrigin="anonymous"
      >
        {subtitles
          .filter((sub) => sub.url && sub.url.trim() !== "")
          .map((sub) => (
            <track
              key={sub.language}
              kind="subtitles"
              src={sub.url}
              srcLang={sub.language}
              label={sub.language.toUpperCase()}
              default={sub.language === preferredLanguage}
            />
          ))}
      </video>


      {/* Buffering spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Loader className="text-white animate-spin" size={40} />
        </div>
      )}

      {/*  Play button overlay (before first play) */}
      {!isPlaying && !isBuffering && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={handlePlayPause}
        >
          <div className="w-16 h-16 bg-[#2872A1]/90 hover:bg-[#2872A1] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110">
            <Play className="text-white ml-1" size={28} fill="white" />
          </div>
        </div>
      )}

      {/* Controls overlay  */}
      <div
        className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        <div className="relative px-4 pb-4 pt-8 space-y-3">
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <span className="text-white text-xs font-mono">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={handleSeek}
              className="flex-1 h-1.5 appearance-none bg-white/30 rounded-full cursor-pointer accent-[#2872A1]"
            />
            <span className="text-white text-xs font-mono">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-[#CBDDE9] transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={22} /> : <Play size={22} fill="white" />}
              </button>

              {/* Mute + Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMute}
                  className="text-white hover:text-[#CBDDE9] transition-colors"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={20} />
                  ) : (
                    <Volume2 size={20} />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolume}
                  className="w-20 h-1 appearance-none bg-white/30 rounded-full cursor-pointer accent-[#2872A1]"
                />
              </div>

              {/* Title */}
              <span className="text-white text-sm font-medium hidden sm:block truncate max-w-[200px]">
                {title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Subtitles */}
              {subtitles.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowSubMenu(!showSubMenu)}
                    className={`transition-colors ${
                      selectedSubtitle
                        ? "text-[#CBDDE9]"
                        : "text-white hover:text-[#CBDDE9]"
                    }`}
                    aria-label="Subtitles"
                  >
                    <Subtitles size={20} />
                  </button>

                  {showSubMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-white/20 rounded-xl overflow-hidden min-w-[140px]">
                      <button
                        onClick={() => handleSubtitleChange("")}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          !selectedSubtitle
                            ? "bg-[#2872A1] text-white"
                            : "text-white hover:bg-white/10"
                        }`}
                      >
                        Off
                      </button>
                      {subtitles.map((sub) => (
                        <button
                          key={sub.language}
                          onClick={() => handleSubtitleChange(sub.language)}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            selectedSubtitle === sub.language
                              ? "bg-[#2872A1] text-white"
                              : "text-white hover:bg-white/10"
                          }`}
                        >
                          {sub.language.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fullscreen */}
              <button
                onClick={handleFullscreen}
                className="text-white hover:text-[#CBDDE9] transition-colors"
                aria-label="Fullscreen"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}