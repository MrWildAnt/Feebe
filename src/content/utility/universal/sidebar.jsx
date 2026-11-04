import { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { utils } from "animejs";
import { MusicPlayer } from "./MusicPlayer.jsx";
import { usePlayer } from "./PlayerContext.jsx";
import { useCoverColor } from "./useCoverColor.jsx";

const DUMMY_LYRICS =
  "wajahmu gemilang\npelan\nlembut menembus\nhutan hujan\nku mencintaimu dalam\ngaun baja\npada\nperayaan~perayaan\n\nkau\nmembuatku\nmenjadi\ntak berdaya\n\nkau\nmembuatku\nmenjadi\ntak berdaya\n\nkau\nmembuatku\nmenjadi\ntak berdaya";

const SHOW_START = 0.5;
const PANEL_W = 360;
const GAP = 48;

const clamp = (n, min, max) =>
  Math.min(max, Math.max(min, n));

export const Sidebar = () => {
  const { track } = usePlayer();
  const bg = useCoverColor(track.cover);

  const wrapRef = useRef(null);

  const closedX = PANEL_W + GAP;

  const endColor = bg.isDark ? "#ffffff" : "#000000";
  const lyricsGradient = `linear-gradient(135deg, ${bg.hex} 0%, ${endColor} 300%)`;

  // Animasi muncul setelah melewati Hero
  useEffect(() => {
    const update = () => {
      const el = wrapRef.current;
      const section = document.querySelector(".music-by-type");

      if (!el || !section) return;

      const vh = window.innerHeight;
      const top = section.getBoundingClientRect().top;

      const progress = clamp((vh - top) / vh, 0, 1);
      const show = clamp(
        (progress - SHOW_START) / (1 - SHOW_START),
        0,
        1
      );

      utils.set(el, {
        translateX: (1 - show) * closedX,
        opacity: show,
      });

      el.style.pointerEvents = show > 0.9 ? "auto" : "none";
    };

    update();

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [closedX]);

  return (
    <div
      ref={wrapRef}
      className="fixed h-130 top-36 right-5 z-50 flex items-start pointer-events-none"
      style={{
        opacity: 0,
        transform: `translateX(${closedX}px)`,
      }}
    >
      {/* Panel */}
      <div className="w-90 h-full text-white">
        <div
          className={`h-100 rounded-t-3xl p-6 flex flex-col gap-4 transition-colors duration-1000 ${
            bg.isDark ? "text-white/90" : "text-black/80"
          }`}
          style={{ background: lyricsGradient }}
        >
          <div className="flex justify-end items-end">
            <Icon
              icon="cuida:maximize-outline"
              className="h-6 w-6"
            />
          </div>

          <p className="text-2xl overflow-y-auto leading-tight font-bold whitespace-pre-line">
            {track.lyrics ?? DUMMY_LYRICS}
          </p>
        </div>

        <div className="flex h-50 flex-col gap-4 rounded-b-3xl bg-white/20 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <img
              src={track.cover}
              alt={track.title}
              className="h-12 w-12 rounded-lg object-cover"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {track.title}
              </p>
              <p className="truncate text-xs text-white/60">
                {track.author}
              </p>
            </div>
          </div>

          <MusicPlayer />
        </div>
      </div>
    </div>
  );
};