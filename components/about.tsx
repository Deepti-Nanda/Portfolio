"use client";

import { useRef, useState } from "react";

export function About() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      video.pause();
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = value;
    setCurrentTime(value);
  };

  const handleFullscreen = () => {
    const wrapper = videoWrapperRef.current;
    if (!wrapper) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      wrapper.requestFullscreen?.();
    }
  };

  const formatTime = (time: number) => {
    if (!Number.isFinite(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <section id="about" className="reveal" aria-labelledby="about-heading">
      <div className="container">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left side - Text */}
          <div className="min-w-0 lg:pr-8">
            <h2
              id="about-heading"
              className="section-title text-[var(--foreground)]"
            >
              About Me
            </h2>

            <div className="max-w-none text-[var(--foreground)]">
              <p className="mb-5 text-sm leading-relaxed text-[var(--muted)] sm:mb-6 sm:text-base lg:text-lg">
                I build technology that solves real-world problems. I'm a BCA
                undergraduate at Sarala Birla University (Class of 2027),
                focused on full-stack development and AI-driven applications.
              </p>

              <p className="mb-5 text-sm leading-relaxed text-[var(--muted)] sm:mb-6 sm:text-base lg:text-lg">
                My journey in tech started with curiosity about how things work
                behind the screen. Today, I craft scalable web applications,
                experiment with machine learning models, and contribute to
                open-source projects. I believe the best code is written with
                empathy for the end user.
              </p>

              <p className="text-sm leading-relaxed text-[var(--muted)] sm:text-base lg:text-lg">
                When I'm not coding, you'll find me solving algorithmic
                challenges on LeetCode, exploring new frameworks, or sharing
                knowledge with the developer community.
              </p>
            </div>

            {/* Quick facts */}
            <div
              className="mt-7 flex flex-wrap gap-2 sm:mt-10 sm:gap-3"
              aria-label="Quick facts"
            >
              {[
                "BCA 2024-2027",
                "Sarala Birla University",
                "Ranchi, India",
                "Full-Stack Developer",
                "AI Enthusiast",
                "Open Source",
              ].map((fact) => (
                <div key={fact} className="skill-chip">
                  <span>{fact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Video Player */}
          <div className="relative min-w-0 w-full">
            <div
              ref={videoWrapperRef}
              className="video-wrapper group"
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(false)}
              onTouchStart={() => setShowControls(true)}
            >
              <video
                ref={videoRef}
                className="w-full h-full"
                poster="/video-poster.jpg"
                preload="metadata"
                playsInline
                onClick={togglePlay}
                onEnded={handleVideoEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(e) =>
                  setCurrentTime(e.currentTarget.currentTime)
                }
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                aria-label="Introductory video about Deepti Nanda"
              >
                <source src="/intro-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Play/Pause Overlay */}
              <button
                onClick={togglePlay}
                className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                  !isPlaying || showControls
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }`}
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full glass border border-[var(--card-border)] shadow-xl backdrop-blur-md sm:h-20 sm:w-20">
                  {isPlaying ? (
                    <svg
                      className="h-7 w-7 text-white sm:h-8 sm:w-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg
                      className="h-7 w-7 text-white sm:h-8 sm:w-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </span>
              </button>

              {/* Video Controls */}
              <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 transition-opacity sm:p-4 ${
                  showControls || isPlaying
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                <div className="flex items-center gap-2 text-white sm:gap-4">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 transition-colors hover:bg-white/30"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  {/* Progress */}
                  <input
                    type="range"
                    min={0}
                    max={duration || 1}
                    step="0.1"
                    value={Math.min(currentTime, duration || 1)}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    className="min-w-0 flex-1 cursor-pointer accent-white"
                    aria-label="Video progress"
                  />

                  {/* Time */}
                  <span className="shrink-0 text-[10px] font-mono tabular-nums sm:text-xs">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  {/* Mute */}
                  <button
                    onClick={handleMute}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 transition-colors hover:bg-white/30"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.59 3L19 9.59 17.59 8.17 15.17 10.6l-2.42-2.43-1.42 1.42L13.76 12l-2.43 2.41 1.42 1.42 2.42-2.42 2.42 2.42 1.42-1.42L16.59 12z" />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                      </svg>
                    )}
                  </button>

                  {/* Fullscreen */}
                  <button
                    onClick={handleFullscreen}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 transition-colors hover:bg-white/30"
                    aria-label="Toggle fullscreen"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-[var(--muted)] sm:mt-4 sm:text-sm">
              Click to play / pause · 40 second introduction
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
