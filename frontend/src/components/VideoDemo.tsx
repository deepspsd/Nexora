import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";

const VideoDemo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section 
      ref={sectionRef}
      className="py-12 md:py-16 bg-gradient-to-br from-gray-50 via-white to-pulse-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden"
      id="demo"
    >
      {/* Background decorative elements */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-pulse-100 rounded-full opacity-30 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
      
      <div className="section-container">
        <div className="text-center mb-8">
          <div className="pulse-chip mx-auto mb-4">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse-500 text-white mr-2">02</span>
            <span>See It In Action</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-3 text-gray-900 dark:text-white">
            Watch NEXORA Build a Complete Startup
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See how our AI agents work together to create everything from market research to MVP in minutes
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black group">
            {/* Video Element */}
            <video
              ref={videoRef}
              className="w-full aspect-video object-cover"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              poster="/nexora-demo-poster.jpg"
              preload="metadata"
            >
              <source src="/nexora-demo.mp4" type="video/mp4" />
              <source src="/nexora-demo.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video>

            {/* Video Overlay */}
            <div className={cn(
              "absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300",
              isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
            )}>
              {/* Play Button */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="flex items-center justify-center w-20 h-20 bg-white/90 hover:bg-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group"
                  aria-label="Play video"
                >
                  <Play className="w-8 h-8 text-pulse-600 ml-1" />
                </button>
              )}
            </div>

            {/* Video Controls */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
              isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
            )}>
              {/* Progress Bar */}
              <div 
                className="w-full h-2 bg-white/20 rounded-full mb-3 cursor-pointer"
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-pulse-500 rounded-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-pulse-300 transition-colors"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-pulse-300 transition-colors"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>

                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <button
                  onClick={() => videoRef.current?.requestFullscreen()}
                  className="text-white hover:text-pulse-300 transition-colors"
                  aria-label="Fullscreen"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          {/* Video Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-lg dark:shadow-gray-700/20">
              <div className="w-10 h-10 bg-pulse-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-pulse-600 font-bold text-sm">3min</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-sm">Complete MVP</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs">Watch as NEXORA generates a full-stack application with modern UI</p>
            </div>

            <div className="text-center p-4 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-lg dark:shadow-gray-700/20">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-sm">AI</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-sm">Smart Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs">See real-time market research and competitor analysis in action</p>
            </div>

            <div className="text-center p-4 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-lg dark:shadow-gray-700/20">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-sm">$0</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-sm">No Code Required</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs">Zero technical knowledge needed - just describe your idea</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoDemo;
