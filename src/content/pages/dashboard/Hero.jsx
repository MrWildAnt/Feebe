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
        <div className="flex gap-3">
          <h1 className="font-bold text-7xl text-inherit">{track.title}</h1>
          <h1 className="font-bold text-7xl text-inherit">-</h1>
          <h3 className="font-semibold text-7xl text-inherit">
            {track.author}
          </h3>
        </div>

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
