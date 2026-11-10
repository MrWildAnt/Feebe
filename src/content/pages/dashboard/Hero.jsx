import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import "./dashboard.css";
import { Disk } from "../../utility/hero/disk.jsx";
import { Navbar } from "../../utility/hero/navbar.jsx";
import { MusicPanel } from "../../utility/hero/MusicPanel.jsx";
import { usePlayer } from "../../utility/universal/PlayerContext.jsx";
import { useCoverColor } from "../../utility/universal/useCoverColor.jsx";
import {
  useWindowSize,
  useVinyl,
  useDiskScroll,
  useVisualizer,
} from "../../utility/hero/UseHeroEffect.jsx";

// Tombol kecil di bawah judul (heart, bookmark)
const AddonButton = ({ icon, title, isCentered }) => (
  <div
    className={`size-15 cursor-pointer rounded-full bg-current/80 flex justify-center items-center transition-[opacity,invisibility,visibility] ${
      isCentered
        ? "invisibility opacity-0 duration-200"
        : "visibility opacity-100 delay-1700 duration-800"
    }`}
    title={title}
  >
    <Icon icon={icon} className="text-4xl text-inherit font-bold invert" />
  </div>
);

// Loading + error sudah ditangani PlayerProvider
export const Hero = () => <HeroPlayer />;

const HeroPlayer = () => {
  const { tracks, track, isPlaying, onSelect, audioRef, gainRef, levelRef } =
    usePlayer();

<<<<<<< HEAD
// Navbar settings
const NAV_FADE_START = 0.6; // navbar bg + bars start fading in at this scroll progress

// Running text: hanya bergerak kalau isinya lebih lebar dari kotak (anime.js)
const Marquee = ({ children, className = "", speed = 60, gap = 64 }) => {
  const boxRef = useRef(null);
  const trackRef = useRef(null);
  const textRef = useRef(null);
  const [overflow, setOverflow] = useState(false);
  const [textW, setTextW] = useState(0);

  // Ukur lebar teks vs kotak (dan ukur ulang kalau ukurannya berubah)
  useEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) return;

    const measure = () => {
      setTextW(text.offsetWidth);
      setOverflow(text.offsetWidth > box.clientWidth);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(text);
    return () => ro.disconnect();
  }, []);

  // Jalankan animasi hanya kalau teks kepanjangan
  useEffect(() => {
    const el = trackRef.current;
    if (!overflow || !el || !textW) return;

    const distance = textW + gap;
    const animation = animate(el, {
      translateX: [0, -distance],
      duration: (distance / speed) * 1000,
      ease: "linear",
      loop: true,
    });

    return () => {
      animation.cancel();
      el.style.transform = "";
    };
  }, [overflow, textW, speed, gap]);

  return (
    <div
      ref={boxRef}
      className={`overflow-hidden ${className} ${
        overflow
          ? "mask-[linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
          : ""
      }`}
    >
      <div ref={trackRef} className="flex w-max">
        <div
          ref={textRef}
          className="flex shrink-0 gap-3 whitespace-nowrap"
          style={{ marginRight: gap }}
        >
          {children}
        </div>
        {overflow && (
          <div
            aria-hidden="true"
            className="flex shrink-0 gap-3 whitespace-nowrap"
            style={{ marginRight: gap }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

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
=======
>>>>>>> frontend
  const [isCentered, setIsCentered] = useState(false);
  const canvasRef = useRef(null);
  const navCanvasRef = useRef(null);

  const bg = useCoverColor(track.cover);
  const size = useWindowSize();
  const { isDocked, diskLayerRef, navBgRef, navProgressRef } =
    useDiskScroll(isCentered);

  useVinyl(isPlaying);
  useVisualizer({
    audioRef,
    gainRef,
    levelRef,
    canvasRef,
    navCanvasRef,
    navProgressRef,
    isDark: bg.isDark,
  });

  const endColor = bg.isDark ? "#ffffff" : "#000000";
  const heroGradient = `linear-gradient(135deg, ${bg.hex} 0%, ${endColor} 300%)`;

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
          tracks={tracks}
          track={track}
          onSelect={onSelect}
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
        <Marquee key={track.id} className="w-170">
          <h1 className="font-bold text-7xl text-inherit">{track.title}</h1>
          <h1 className="font-bold text-7xl text-inherit">-</h1>
          <h3 className="font-semibold text-7xl text-inherit">
            {track.author}
          </h3>
        </Marquee>

        {/* addons */}
        <div className="flex gap-3 items-center">
          <AddonButton
            icon="ant-design:heart-outlined"
            title={track.title}
            isCentered={isCentered}
          />
          <AddonButton
            icon="boxicons:bookmark"
            title={track.title}
            isCentered={isCentered}
          />
        </div>
      </div>

      {/* Music Panel */}
      <MusicPanel
        hidden={isCentered}
        tracks={tracks}
        currentId={track.id}
        onSelect={onSelect}
      />
    </div>
  );
};

export default Hero;
