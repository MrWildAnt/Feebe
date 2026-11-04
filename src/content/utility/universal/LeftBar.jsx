import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { utils } from "animejs";
import { usePlayer } from "./PlayerContext.jsx";
import { PLAYLISTS } from "../../data/playlists.jsx";

const SHOW_START = 0.5; // bar mulai muncul di progres scroll ini (0 sampai 1)
const STAGGER = 0.15; // jeda antar item
const PARALLAX = 0.04; // kecepatan parallax per item setelah section di atas
const PARALLAX_MAX = 14; // batas geser parallax (px)

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export const LeftBar = () => {
  const { tracks, onSelect } = usePlayer();
  const [playlists, setPlaylists] = useState(PLAYLISTS);
  const [activeId, setActiveId] = useState(null);

  const barRef = useRef(null);
  const itemRefs = useRef([]);

  // Klik playlist: tandai aktif, putar lagu pertamanya
  const handleSelect = (pl) => {
    setActiveId(pl.id);
    const first = tracks.find((t) => t.id === pl.trackIds[0]);
    if (first) onSelect(first);
  };

  // Tambah playlist baru (dummy, UI saja)
  const handleAdd = () => {
    const id = Date.now();
    const base = tracks[playlists.length % tracks.length];
    setPlaylists((list) => [
      ...list,
      {
        id,
        name: `Playlist ${list.length + 1}`,
        cover: base?.cover,
        trackIds: base ? [base.id] : [],
      },
    ]);
  };

  useEffect(() => {
    const update = () => {
      const bar = barRef.current;
      const section = document.querySelector(".music-by-type");
      if (!bar || !section) return;

      const vh = window.innerHeight;
      const top = section.getBoundingClientRect().top;

      const p = clamp((vh - top) / vh, 0, 1);
      const show = clamp((p - SHOW_START) / (1 - SHOW_START), 0, 1);
      const past = Math.max(0, -top);

      utils.set(bar, { translateX: (1 - show) * -100, opacity: show });
      bar.style.pointerEvents = show > 0.9 ? "auto" : "none";

      const n = itemRefs.current.length;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const local = clamp(show * (1 + n * STAGGER) - i * STAGGER, 0, 1);
        const drift = clamp(past * PARALLAX * (i + 1), 0, PARALLAX_MAX * (i + 1));

        utils.set(el, {
          translateX: (1 - local) * -70,
          translateY: (1 - local) * 50 - drift / (n || 1),
          opacity: local,
        });
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [playlists.length]);

  return (
    <aside
      ref={barRef}
      style={{ opacity: 0 }}
      className="pointer-events-none fixed top-36 bottom-6 left-5 z-30 flex w-20 flex-col items-center gap-4 rounded-3xl bg-white/20 backdrop-blur-sm py-4"
    >
      {/* Garis kecil + tile library */}
      <div className="flex flex-col items-center gap-1 ">
        <div className="h-0.5 w-8 rounded-full bg-white/70" />
        <div
          className="flex size-12 items-center justify-center rounded-lg bg-white/80 text-neutral-900"
          title="Your playlists"
        >
          <Icon icon="mdi:music-note" className="text-3xl" />
        </div>
      </div>

      {/* Tambah playlist */}
      <button
        type="button"
        onClick={handleAdd}
        aria-label="New playlist"
        title="New playlist"
        className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/70 text-white transition-colors hover:bg-white/20"
      >
        <Icon icon="mdi:plus" className="text-2xl" />
      </button>

      {/* Daftar playlist */}
      <div className="flex flex-col items-center gap-4 overflow-y-auto">
        {playlists.map((pl, i) => (
          <button
            key={pl.id}
            ref={(el) => (itemRefs.current[i] = el)}
            type="button"
            onClick={() => handleSelect(pl)}
            title={pl.name}
            aria-label={`Playlist ${pl.name}`}
            style={{ opacity: 0 }}
            className={`size-14 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-neutral-700 ring-2 transition-[box-shadow] duration-300 ${
              pl.id === activeId
                ? "ring-white"
                : "ring-transparent hover:ring-white/50"
            }`}
          >
            {pl.cover && (
              <img
                src={pl.cover}
                alt={pl.name}
                className="size-full object-cover"
                draggable={false}
              />
            )}
          </button>
        ))}
      </div>
    </aside>
  );
};