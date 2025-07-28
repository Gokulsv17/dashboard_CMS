import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  videoUrl?: string;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  videoTitle,
  videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [isOpen]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full max-w-4xl mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition duration-200 z-10"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Video Title */}
        <div className="absolute -top-12 left-0 text-white">
          <h3 className="text-lg font-semibold">{videoTitle}</h3>
        </div>

        {/* Video Container */}
        <div 
          className="relative bg-black rounded-lg overflow-hidden"
          onMouseMove={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-auto max-h-[70vh]"
            onClick={togglePlay}
          />

          {/* Video Controls */}
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-gray-300 transition duration-200"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>

                {/* Skip Buttons */}
                <button
                  onClick={() => skipTime(-10)}
                  className="text-white hover:text-gray-300 transition duration-200"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={() => skipTime(10)}
                  className="text-white hover:text-gray-300 transition duration-200"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                {/* Volume Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-gray-300 transition duration-200"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Time Display */}
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Playback Speed */}
                <select
                  value={playbackRate}
                  onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                  className="bg-gray-800 text-white text-sm rounded px-2 py-1 border-none outline-none"
                >
                  {playbackSpeeds.map(speed => (
                    <option key={speed} value={speed}>
                      {speed}x
                    </option>
                  ))}
                </select>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-gray-300 transition duration-200"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayerModal;