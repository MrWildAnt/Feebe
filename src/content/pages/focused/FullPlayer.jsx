import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { animate } from "animejs";
import { MusicPlayer } from "../../utility/universal/MusicPlayer.jsx";
import { usePlayer } from "../../utility/universal/PlayerContext.jsx";
import { useCoverColor } from "../../utility/universal/useCoverColor.jsx";

const DUMMY_LYRICS =
  "wajahmu gemilang\npelan\nlembut menembus\nhutan hujan\nku mencintaimu dalam\ngaun baja\npada\nperayaan~perayaan\n\nkau\nmembuatku\nmenjadi\ntak berdaya\n\nkau\nmembuatku\nmenjadi\ntak berdaya\n\nkau\nmembuatku\nmenjadi\ntak berdaya";

export default function FullPlayer() {
  const navigate = useNavigate();
  const { track } = usePlayer();
  const bg = useCoverColor(track.cover);

  const coverRef = useRef(null);
  const lyricsRef = useRef(null);

  const isDark = bg.isDark;
  const endColor = isDark ? "#ffffff" : "#000000";
  const gradient = `linear-gradient(135deg, ${bg.hex} 0%, ${endColor} 300%)`;

  const textMain = isDark ? "text-white/90" : "text-black/80";
  const textSub = isDark ? "text-white/60" : "text-black/55";

  // Kembali ke halaman sebelumnya; kalau dibuka langsung lewat URL, ke beranda
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  // Animasi cover saat halaman dibuka
  useEffect(() => {
    if (!coverRef.current) return;
    animate(coverRef.current, {
      scale: [0.92, 1],
      opacity: [0, 1],
      duration: 600,
      ease: "outExpo",
    });
  }, []);

  // Reset scroll lirik saat ganti lagu
  useEffect(() => {
    if (lyricsRef.current) lyricsRef.current.scrollTop = 0;
  }, [track.title]);

  // ESC untuk kembali
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
      {/* Cover buram sebagai tekstur latar */}
      <img
        src={track.cover}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-20 blur-3xl"
      />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col px-6 py-6 md:px-12 md:py-10">
        {/* Header */}
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

        {/* Konten */}
        <div className="mt-6 grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
          {/* Kiri: cover + info + kontrol */}
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
              <p className={`truncate text-base ${textSub}`}>
                {track.author}
              </p>
            </div>

            <div className="rounded-3xl bg-white/20 p-4 backdrop-blur-sm">
              <MusicPlayer />
            </div>
          </section>

          {/* Kanan: lirik */}
          <section
            ref={lyricsRef}
            tabIndex={0}
            aria-label="Lirik"
            className="min-h-0 overflow-y-auto pr-2 mask-[linear-gradient(to_bottom,transparent,black_6%,black_90%,transparent)] focus-visible:outline-none"
          >
            <p className="whitespace-pre-line py-[10vh] text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {track.lyrics ?? DUMMY_LYRICS}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
