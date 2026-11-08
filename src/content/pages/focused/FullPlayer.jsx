import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { animate } from "animejs";
import { MusicPlayer } from "../../utility/universal/MusicPlayer.jsx";
import { usePlayer } from "../../utility/universal/PlayerContext.jsx";
import { useCoverColor } from "../../utility/universal/useCoverColor.jsx";
import SyncedLyrics from "./SyncedLyrics.jsx";
import { LYRICS } from "../../data/lyrics.js";

const HAS_TIMESTAMP = /\[\d{1,2}:\d{2}(?:[.:]\d{1,3})?\]/;

/**
 * Waktu "live" dari <audio> milik PlayerContext.
 * - Saat diputar: dibaca tiap frame langsung dari audioRef (presisi).
 * - Saat pause / seek: mengikuti currentTime dari context.
 */
function useLiveTime() {
  const { audioRef, isPlaying, currentTime, track } = usePlayer();
  const [live, setLive] = useState(() => audioRef.current?.currentTime ?? currentTime);

  useEffect(() => {
    if (!isPlaying) return;
    let raf;
    const tick = () => {
      const audio = audioRef.current;
      if (audio) setLive(audio.currentTime);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, track.id, audioRef]);

  return isPlaying ? live : currentTime;
}

function LyricsPane({ rawLyrics, textSub }) {
  const { track, onSeek } = usePlayer();
  const liveTime = useLiveTime();
  const lyricsRef = useRef(null);

  const hasLyrics = rawLyrics.trim().length > 0;
  const isSynced = hasLyrics && HAS_TIMESTAMP.test(rawLyrics);

  useEffect(() => {
    if (lyricsRef.current) lyricsRef.current.scrollTop = 0;
  }, [track.id]);

  if (!hasLyrics) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className={`text-lg font-semibold ${textSub}`}>Lirik belum tersedia</p>
      </div>
    );
  }

  if (isSynced) {
    return (
      <SyncedLyrics
        key={track.id}
        lrc={rawLyrics}
        currentTime={liveTime}
        onSeek={onSeek}
      />
    );
  }

  return (
    <div
      ref={lyricsRef}
      tabIndex={0}
      className="h-full overflow-y-auto pr-2 mask-[linear-gradient(to_bottom,transparent,black_6%,black_90%,transparent)] focus-visible:outline-none"
    >
      <p className="whitespace-pre-line py-[10vh] text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
        {rawLyrics}
      </p>
    </div>
  );
}

export default function FullPlayer() {
  const navigate = useNavigate();

  const { track } = usePlayer();
  const bg = useCoverColor(track.cover);

  const coverRef = useRef(null);

  const isDark = bg.isDark;
  const endColor = isDark ? "#ffffff" : "#000000";
  const gradient = `linear-gradient(135deg, ${bg.hex} 0%, ${endColor} 300%)`;

  const textMain = isDark ? "text-white/90" : "text-black/80";
  const textSub = isDark ? "text-white/60" : "text-black/55";

  const rawLyrics = track.lrc ?? track.lyrics ?? LYRICS[track.id] ?? "";

  const lyricsVars = {
    "--lyrics-active": isDark ? "#ffffff" : "#000000",
    "--lyrics-on-active": isDark ? "#000000" : "#ffffff",
    "--lyrics-idle": isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.32)",
    "--lyrics-hover": isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
    "--lyrics-size": "clamp(1.75rem, 4vw, 3rem)",
  };

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  useEffect(() => {
    if (!coverRef.current) return;
    animate(coverRef.current, {
      scale: [0.92, 1],
      opacity: [0, 1],
      duration: 600,
      ease: "outExpo",
    });
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && goBack();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main
      className={`relative h-dvh w-full overflow-hidden transition-colors duration-1000 ${textMain}`}
      style={{ background: gradient }}
    >
      <img
        src={track.cover}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-20 blur-3xl"
      />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col px-6 py-6 md:px-12 md:py-10">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            aria-label="Kembali"
            className="flex items-center gap-2 rounded-full py-2 pr-4 pl-2 transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          >
            <Icon icon="mdi:chevron-left" className="h-6 w-6" />
            <span className="text-sm font-semibold">Kembali</span>
          </button>

          <p className={`text-sm ${textSub}`}>Sedang diputar</p>
        </header>

        <div className="mt-6 grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
          <section className="flex min-h-0 flex-col justify-center gap-6">
            <img
              ref={coverRef}
              src={track.cover}
              alt={track.title}
              className="mx-auto aspect-square w-48 rounded-3xl object-cover shadow-2xl sm:w-64 lg:w-full"
            />

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold sm:text-3xl">
                {track.title}
              </h1>
              <p className={`truncate text-base ${textSub}`}>{track.author}</p>
            </div>

            <div className="rounded-3xl bg-white/20 p-4 backdrop-blur-sm">
              <MusicPlayer />
            </div>
          </section>

          <section
            aria-label="Lirik"
            className="relative min-h-0 min-w-0 overflow-hidden"
            style={lyricsVars}
          >
            <LyricsPane rawLyrics={rawLyrics} textSub={textSub} />
          </section>
        </div>
      </div>
    </main>
  );
}