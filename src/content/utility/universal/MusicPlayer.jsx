import { Icon } from "@iconify/react";
import { usePlayer } from "./PlayerContext.jsx";

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const getVolumeIcon = (level) => {
  if (level === 0) return "mdi:volume-off";
  if (level < 0.34) return "mdi:volume-low";
  if (level < 0.67) return "mdi:volume-medium";
  return "mdi:volume-high";
};

const skipClass =
  "flex size-12 cursor-pointer items-center justify-center rounded-full transition-transform duration-300 hover:scale-110 hover:bg-white/20";

export const MusicPlayer = ({ className = "w-full" }) => {
  const {
    isPlaying,
    onToggle,
    onPrev,
    onNext,
    currentTime,
    duration,
    onSeek,
    volume,
    isMuted,
    onVolumeChange,
    onToggleMute,
  } = usePlayer();

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const level = isMuted ? 0 : volume;

  return (
    <div className={`player flex flex-col gap-3 ${className}`}>
      {/* Controls */}
      <div className="relative flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous song"
          className={skipClass}
        >
          <Icon icon="mdi:skip-previous" className="text-4xl" />
        </button>

        <button
          type="button"
          onClick={onToggle}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex size-17 cursor-pointer items-center justify-center rounded-full bg-current/20 transition-transform duration-300 hover:scale-110"
        >
          <Icon
            icon={isPlaying ? "basil:pause-solid" : "clarity:play-solid"}
            className="text-4xl"
          />
        </button>

        <button
          type="button"
          onClick={onNext}
          aria-label="Next song"
          className={skipClass}
        >
          <Icon icon="mdi:skip-next" className="text-4xl" />
        </button>

        {/* Volume: pops up from the right side */}
        <div className="group absolute right-0 flex flex-col items-center">
          <div className="invisible absolute bottom-full left-1/2 -translate-x-1/2 translate-y-2 pb-2 opacity-0 transition-all duration-300 ease-out group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex flex-col items-center gap-1 rounded-full bg-white/20 px-1 py-3 backdrop-blur-md">
              <span className="text-[10px] opacity-70">
                {Math.round(level * 100)}
              </span>

              <div className="flex h-28 w-8 items-center justify-center">
                <input
                  type="range"
                  className="seek-volume w-25 shrink-0 -rotate-90"
                  min={0}
                  max={1}
                  step={0.01}
                  value={level}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  aria-label="Volume"
                  style={{ "--pct": `${level * 100}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={level === 0 ? "Unmute" : "Mute"}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full transition-transform duration-300 hover:scale-110 hover:bg-white/20"
          >
            <Icon icon={getVolumeIcon(level)} className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1">
        <input
          type="range"
          className="seek"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onChange={(e) => onSeek(Number(e.target.value))}
          disabled={!duration}
          aria-label="Seek"
          style={{ "--pct": `${progress}%` }}
        />
        <div className="flex justify-between text-xs opacity-70">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};