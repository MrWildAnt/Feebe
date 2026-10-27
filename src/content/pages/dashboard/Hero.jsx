import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { FastAverageColor } from "fast-average-color";
import { Icon } from "@iconify/react";
import "./dashboard.css";
import { Disk } from "../../utility/hero/disk.jsx";
import { Navbar } from "../../utility/hero/navbar.jsx";
import { MusicPanel } from "../../utility/hero/MusicPanel.jsx";
import { fetchTracks } from "../../data/tracks.jsx";

// Saved volume / mute preferences
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

// Disk scroll settings
const DISK_SIZE = 600; // size-150 = 37.5rem = 600px
const DISK_TARGET = 200; // size-50 = 12.5rem = 200px (use 50 for 50px)
const END_TOP = -80; // final top position of the disk (px)
const END_LEFT = -80; // final left position of the disk (px)
const DOCK_AT = 0.98; // scroll progress (0 to 1) at which the disk counts as docked

// Navbar settings
const NAV_FADE_START = 0.6; // navbar bg + bars start fading in at this scroll progress

// Loads the tracks (local now, Supabase later), then mounts the player
export const Hero = () => {
  const [tracks, setTracks] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchTracks()
      .then((list) => {
        if (!cancelled) setTracks(list);
      })
      .catch((err) => {
        console.error("Could not load tracks:", err);
        if (!cancelled) setError(err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <div className="p-10">Could not load tracks.</div>;
  if (!tracks) return <div className="min-h-screen w-full" />; // loading screen
  if (tracks.length === 0) return <div className="p-10">No tracks yet.</div>;

  return <HeroPlayer tracks={tracks} />;
};

const HeroPlayer = ({ tracks }) => {
  const [track, setTrack] = useState(tracks[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCentered, setIsCentered] = useState(false);
  const [isDocked, setIsDocked] = useState(false);
  const [bg, setBg] = useState({ hex: "#f5f5f5", isDark: false });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => loadPrefs().volume);
  const [isMuted, setIsMuted] = useState(() => loadPrefs().isMuted);

  const diskLayerRef = useRef(null);
  const isCenteredRef = useRef(isCentered);
  const animationRef = useRef(null);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);

  // Navbar refs (updated straight from the scroll handler, no re-renders)
  const navBgRef = useRef(null);
  const navCanvasRef = useRef(null);
  const navProgressRef = useRef(0);

  // Web Audio API references
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const gainRef = useRef(null);
  const levelRef = useRef(isMuted ? 0 : volume);
  const frameRef = useRef(null);
  const isDarkRef = useRef(false);
  const endColor = bg.isDark ? "#ffffff" : "#000000";
  const heroGradient = `linear-gradient(135deg, ${bg.hex} 0%, ${endColor} 300%)`;

  const [size, setSize] = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  });

  // Keep canvas dimensions matched to the window
  useEffect(() => {
    const onResize = () =>
      setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Keep the current background brightness available to the visualizer
  useEffect(() => {
    isDarkRef.current = bg.isDark;
  }, [bg.isDark]);

  // Extract the dominant color from the cover image
  useEffect(() => {
    const fac = new FastAverageColor();
    let cancelled = false;

    fac
      .getColorAsync(track.cover, { algorithm: "dominant" })
      .then((color) => {
        if (!cancelled) setBg({ hex: color.hex, isDark: color.isDark });
      })
      .catch(console.error);

    return () => {
      cancelled = true;
      fac.destroy();
    };
  }, [track.cover]);

  // Vinyl rotation
  useEffect(() => {
    const animation = animate(".vinyl-disk", {
      rotate: "1turn",
      duration: 6000,
      ease: "linear",
      loop: true,
      autoplay: true,
    });

    animationRef.current = animation;

    return () => {
      animation.cancel();
      animationRef.current = null;
    };
  }, []);

  // Keep the latest isCentered available to the scroll handler
  useEffect(() => {
    isCenteredRef.current = isCentered;
  }, [isCentered]);

  // Shrink the disk into the top-left corner while .music-by-type scrolls in,
  // and fade the navbar background + bars in at the same time
  useEffect(() => {
    const layer = diskLayerRef.current;
    if (!layer) return;

    const s = DISK_TARGET / DISK_SIZE;

    const update = () => {
      const section = document.querySelector(".music-by-type");
      if (!section) return;

      const vh = window.innerHeight;
      const top = section.getBoundingClientRect().top;

      // 0 when the section's top is at the bottom of the screen,
      // 1 when its top reaches the top of the screen
      const p = Math.min(1, Math.max(0, (vh - top) / vh));
      setIsDocked(p >= DOCK_AT);

      // Navbar background + visualizer fade in near the end of the scroll
      const navP = Math.min(
        1,
        Math.max(0, (p - NAV_FADE_START) / (1 - NAV_FADE_START)),
      );
      navProgressRef.current = navP;
      if (navBgRef.current) navBgRef.current.style.opacity = String(navP);

      // the disk's top-left corner before scrolling
      const startLeft = isCenteredRef.current
        ? window.innerWidth / 2 - DISK_SIZE / 2
        : -DISK_SIZE / 2;
      const startTop = vh / 2 - DISK_SIZE / 2;

      // layer has origin top-left: final = translate + s * startCorner
      // so this lands the disk's top-left corner on (END_LEFT, END_TOP)
      const x = (END_LEFT - s * startLeft) * p;
      const y = (END_TOP - s * startTop) * p;
      const scale = 1 - (1 - s) * p;

      layer.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Audio visualizer: 180 bars, zero gap (hero canvas + navbar canvas)
  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    const navCanvas = navCanvasRef.current;
    if (!audio || !canvas) return;

    const ctx = canvas.getContext("2d");
    const navCtx = navCanvas ? navCanvas.getContext("2d") : null;
    if (!ctx) return;

    let disposed = false;

    const draw = () => {
      if (disposed) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (navCtx) navCtx.clearRect(0, 0, navCanvas.width, navCanvas.height);

      const analyser = analyserRef.current;
      if (!analyser) {
        frameRef.current = requestAnimationFrame(draw);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const data = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(data);

      const barCount = 180;
      const step = bufferLength / barCount;

      // Hero bars
      const barWidth = canvas.width / barCount;
      ctx.fillStyle = isDarkRef.current
        ? "rgba(255, 255, 255, 0.55)"
        : "rgba(0, 0, 0, 0.40)";

      for (let i = 0; i < barCount; i++) {
        const index = Math.min(bufferLength - 1, Math.floor(i * step));
        const barHeight = (data[index] / 255) * canvas.height;

        ctx.fillRect(
          i * barWidth,
          canvas.height - barHeight,
          Math.ceil(barWidth),
          barHeight,
        );
      }

      // Navbar bars (only while the navbar is visible)
      if (navCtx && navProgressRef.current > 0) {
        const navBarWidth = navCanvas.width / barCount;
        navCtx.fillStyle = isDarkRef.current
          ? "rgba(255, 255, 255, 0.55)"
          : "rgba(0, 0, 0, 0.40)";

        for (let i = 0; i < barCount; i++) {
          const index = Math.min(bufferLength - 1, Math.floor(i * step));
          const barHeight = (data[index] / 255) * navCanvas.height;

          navCtx.fillRect(
            i * navBarWidth,
            navCanvas.height - barHeight,
            Math.ceil(navBarWidth),
            barHeight,
          );
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    const start = async () => {
      try {
        // Create the audio graph only once for this audio element
        if (!audioContextRef.current) {
          const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) return;

          const audioContext = new AudioContextClass();
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 2048;
          analyser.smoothingTimeConstant = 0.8;

          const gain = audioContext.createGain();
          gain.gain.value = levelRef.current;

          const source = audioContext.createMediaElementSource(audio);
          source.connect(analyser);
          analyser.connect(gain); // analyser before gain, so bars don't shrink with volume
          gain.connect(audioContext.destination);

          // The graph handles volume now, so leave the element at full volume
          audio.volume = 1;
          audio.muted = false;

          audioContextRef.current = audioContext;
          analyserRef.current = analyser;
          gainRef.current = gain;
        }

        if (audioContextRef.current.state === "suspended") {
          await audioContextRef.current.resume();
        }

        cancelAnimationFrame(frameRef.current);
        draw();
      } catch (error) {
        console.error("Could not start the audio visualizer:", error);
      }
    };

    const stop = () => {
      cancelAnimationFrame(frameRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (navCtx) navCtx.clearRect(0, 0, navCanvas.width, navCanvas.height);
    };

    audio.addEventListener("play", start);
    audio.addEventListener("pause", stop);
    audio.addEventListener("ended", stop);

    if (!audio.paused) start();

    return () => {
      disposed = true;
      audio.removeEventListener("play", start);
      audio.removeEventListener("pause", stop);
      audio.removeEventListener("ended", stop);
      cancelAnimationFrame(frameRef.current);
      // Audio graph refs are kept so Strict Mode doesn't create a second
      // MediaElementSource for the same element.
    };
  }, []);

  // Start every newly selected track from 0:00
  useEffect(() => {
    if (audioRef.current) audioRef.current.currentTime = 0;
    setCurrentTime(0);
  }, [track.id]);

  // Apply volume / mute
  useEffect(() => {
    const level = isMuted ? 0 : volume;
    levelRef.current = level;

    if (gainRef.current) {
      // Web Audio graph exists: control volume through the gain node
      gainRef.current.gain.value = level;
    } else if (audioRef.current) {
      // Graph not created yet (before first play): use the element
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Persist volume / mute
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ volume, isMuted }));
    } catch {
      // storage unavailable (private mode, quota), ignore
    }
  }, [volume, isMuted]);

  // Play / pause: audio + vinyl animation together
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) audio.play().catch(() => setIsPlaying(false));
      else audio.pause();
    }

    const animation = animationRef.current;
    if (animation) {
      if (isPlaying) animation.play();
      else animation.pause();
    }
  }, [isPlaying, track]);

  // Track navigation
  const index = tracks.findIndex((t) => t.id === track.id);

  const handleNext = () => {
    setTrack(tracks[(index + 1) % tracks.length]);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    const audio = audioRef.current;

    // Past 3s: restart the song first, like most players
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    setTrack(tracks[(index - 1 + tracks.length) % tracks.length]);
    setIsPlaying(true);
  };

  const handleSeek = (time) => {
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolume = (v) => {
    setVolume(v);
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    if (isMuted || volume === 0) {
      if (volume === 0) setVolume(0.5);
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  const syncDuration = (event) => {
    const d = event.currentTarget.duration;
    setDuration(Number.isFinite(d) ? d : 0);
  };

  return (
    <div
      className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden transition-colors duration-1000 ${
        bg.isDark ? "text-white" : "text-black"
      }`}
      style={{ background: heroGradient }}
    >
      {/* Audio visualizer */}
      <canvas
        ref={canvasRef}
        width={size.w}
        height={size.h}
        className="pointer-events-none absolute right-0 bottom-0 z-0 h-[80%] w-full opacity-40"
      />

      <audio
        ref={audioRef}
        src={track.audio}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={syncDuration}
        onDurationChange={syncDuration}
        onEnded={handleNext}
      />

      {/* Navbar */}
      <Navbar
        bgRef={navBgRef}
        canvasRef={navCanvasRef}
        gradient={heroGradient}
        width={size.w}
      />

      {/* Vinyl Disk (scroll layer: scales and moves to the top-left) */}
      <div
        ref={diskLayerRef}
        className="pointer-events-none fixed inset-0 z-20 origin-top-left"
      >
        <Disk
          isCentered={isCentered}
          isDocked={isDocked}
          track={track}
          togglePosition={() => {
            if (!isDocked) setIsCentered((v) => !v);
          }}
        />
      </div>

      <div
        inert={isCentered}
        aria-hidden={isCentered}
        className={`tittle absolute flex flex-col gap-4
                  transition-[left,bottom,opacity,transform,visibility]
                  duration-900 ease-in-out ${
                    isCentered
                      ? "pointer-events-none left-0 -bottom-15"
                      : "left-80 bottom-[40%] delay-800"
                  }`}
      >
        <h2
          className={`font-base text-3xl text-inherit transition-[opacity,visibility] duration-300 ease-in-out ${isCentered ? "invisible opacity-0 pointer-events-none" : "visible opacity-100 delay-1000"}`}
        >
          Now Playing
        </h2>
        <div className="flex gap-3">
          <h1 className="font-bold text-7xl text-inherit">{track.title}</h1>
          <h1 className="font-bold text-7xl text-inherit">-</h1>
          <h3 className="font-semibold text-7xl text-inherit">
            {track.author}
          </h3>
        </div>

        {/* addons*/}
        <div className="flex gap-3 items-center">
          <div
            className={`size-15 cursor-pointer rounded-full bg-current/80 flex justify-center items-center transition-[opacity,invisibility,visibility] ${
              isCentered
                ? "invisibility opacity-0 duration-200"
                : "visibility opacity-100 delay-1700 duration-800"
            }`}
            title={track.title}
          >
            <Icon
              icon="ant-design:heart-outlined"
              className="text-4xl text-inherit font-bold invert"
            />
          </div>
          <div
            className={`size-15 cursor-pointer rounded-full bg-current/80 flex justify-center items-center transition-[opacity,invisibility,visibility] ${
              isCentered
                ? "invisibility opacity-0 duration-200"
                : "visibility opacity-100 delay-1700 duration-800"
            }`}
            title={track.title}
          >
            <Icon
              icon="boxicons:bookmark"
              className="text-4xl text-inherit font-bold invert"
            />
          </div>
        </div>
      </div>

      {/* Music Panel */}
      <MusicPanel
        hidden={isCentered}
        tracks={tracks}
        currentId={track.id}
        onSelect={setTrack}
        isPlaying={isPlaying}
        onToggle={() => setIsPlaying((v) => !v)}
        onPrev={handlePrev}
        onNext={handleNext}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        volume={volume}
        isMuted={isMuted}
        onVolumeChange={handleVolume}
        onToggleMute={toggleMute}
      />
    </div>
  );
};

export default Hero;