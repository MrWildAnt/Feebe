import { createContext, useContext, useEffect, useRef, useState } from "react";
import { fetchTracks } from "../../data/tracks.jsx";

const PREFS_KEY = "hero-player-prefs";

const loadPrefs = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY));
    return {
      volume:
        typeof saved?.volume === "number"
          ? Math.min(1, Math.max(0, saved.volume))
          : 0.8,
      isMuted: Boolean(saved?.isMuted),
    };
  } catch {
    return { volume: 0.8, isMuted: false };
  }
};

const PlayerContext = createContext(null);

// Pakai di komponen mana saja: const { track, isPlaying, onToggle } = usePlayer();
export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer harus dipakai di dalam <PlayerProvider>");
  return ctx;
};

export const PlayerProvider = ({ children }) => {
  const [tracks, setTracks] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchTracks()
      .then((list) => !cancelled && setTracks(list))
      .catch((err) => {
        console.error("Could not load tracks:", err);
        if (!cancelled) setError(err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <div className="p-10">Could not load tracks.</div>;
  if (!tracks) return <div className="min-h-screen w-full" />;
  if (tracks.length === 0) return <div className="p-10">No tracks yet.</div>;

  return <PlayerCore tracks={tracks}>{children}</PlayerCore>;
};

const PlayerCore = ({ tracks, children }) => {
  const [track, setTrack] = useState(tracks[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => loadPrefs().volume);
  const [isMuted, setIsMuted] = useState(() => loadPrefs().isMuted);

  // Dipakai Hero untuk visualizer (Web Audio)
  const audioRef = useRef(null);
  const gainRef = useRef(null);
  const levelRef = useRef(isMuted ? 0 : volume);

  const index = tracks.findIndex((t) => t.id === track.id);

  // Lagu baru selalu mulai dari 0:00
  useEffect(() => {
    if (audioRef.current) audioRef.current.currentTime = 0;
    setCurrentTime(0);
  }, [track.id]);

  // Volume / mute
  useEffect(() => {
    const level = isMuted ? 0 : volume;
    levelRef.current = level;
    if (gainRef.current) {
      gainRef.current.gain.value = level;
    } else if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Simpan preferensi
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ volume, isMuted }));
    } catch {
      /* ignore */
    }
  }, [volume, isMuted]);

  // Play / pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying, track]);

  const onNext = () => {
    setTrack(tracks[(index + 1) % tracks.length]);
    setIsPlaying(true);
  };

  const onPrev = () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    setTrack(tracks[(index - 1 + tracks.length) % tracks.length]);
    setIsPlaying(true);
  };

  const onSelect = (t) => {
    setTrack(t);
    setIsPlaying(true);
  };

  const onSeek = (time) => {
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const onVolumeChange = (v) => {
    setVolume(v);
    setIsMuted(v === 0);
  };

  const onToggleMute = () => {
    if (isMuted || volume === 0) {
      if (volume === 0) setVolume(0.5);
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  const syncDuration = (e) => {
    const d = e.currentTarget.duration;
    setDuration(Number.isFinite(d) ? d : 0);
  };

  const value = {
    tracks,
    track, // lagu saat ini
    currentId: track.id,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    onSelect,
    onToggle: () => setIsPlaying((v) => !v),
    onPrev,
    onNext,
    onSeek,
    onVolumeChange,
    onToggleMute,
    audioRef,
    gainRef,
    levelRef,
  };

  return (
    <PlayerContext.Provider value={value}>
      {/* Satu-satunya elemen audio di seluruh app */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        src={track.audio}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={syncDuration}
        onDurationChange={syncDuration}
        onEnded={onNext}
      />
      {children}
    </PlayerContext.Provider>
  );
};