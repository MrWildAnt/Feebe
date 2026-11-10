import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayer } from "../../utility/universal/PlayerContext.jsx";
import "./SyncedLyrics.css";

const LEAD = 0.15; // detik, highlight sedikit lebih awal biar terasa pas
const MANUAL_SCROLL_PAUSE = 3000; // ms, jeda auto-scroll setelah user scroll sendiri

// "[01:23.45] teks" -> { time: 83.45, text: "teks" }
function parseLrc(lrc) {
  const lines = [];
  for (const raw of lrc.split(/\r?\n/)) {
    const stamps = [
      ...raw.matchAll(/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g),
    ];
    if (!stamps.length) continue;
    const text = raw.replace(/\[[^\]]*\]/g, "").trim();
    if (!text) continue;
    for (const m of stamps) {
      const frac = m[3] ? Number(`0.${m[3]}`) : 0;
      lines.push({ time: Number(m[1]) * 60 + Number(m[2]) + frac, text });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

// Index baris terakhir yang waktunya <= t (-1 kalau belum mulai)
function findActive(lines, t) {
  let lo = 0;
  let hi = lines.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lines[mid].time <= t) {
      ans = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return ans;
}

export default function SyncedLyrics({ lrc, currentTime = 0, onSeek }) {
  const { audioRef } = usePlayer();
  const lines = useMemo(() => parseLrc(lrc), [lrc]);
  const [active, setActive] = useState(-1);

  const boxRef = useRef(null);
  const lineRefs = useRef([]);
  const timeRef = useRef(currentTime);
  const pausedUntil = useRef(0);
  const firstScroll = useRef(true);

  timeRef.current = currentTime;

  // 1) Loop per frame: baca waktu audio langsung, setState hanya kalau baris berganti
  useEffect(() => {
    let raf;
    const tick = () => {
      const t = (audioRef?.current?.currentTime ?? timeRef.current) + LEAD;
      const i = findActive(lines, t);
      setActive((prev) => (prev === i ? prev : i));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [lines, audioRef]);

  // 2) Geser scroll supaya baris aktif ada di sekitar 35% tinggi kontainer
  useEffect(() => {
    const box = boxRef.current;
    const el = lineRefs.current[Math.max(active, 0)];
    if (!box || !el) return;
    if (Date.now() < pausedUntil.current) return;

    const boxRect = box.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const target = box.clientHeight * 0.35 - el.clientHeight / 2;
    const delta = elRect.top - boxRect.top - target;

    box.scrollTo({
      top: box.scrollTop + delta,
      behavior: firstScroll.current ? "auto" : "smooth",
    });
    firstScroll.current = false;
  }, [active]);

  const pauseAutoScroll = () => {
    pausedUntil.current = Date.now() + MANUAL_SCROLL_PAUSE;
  };

  return (
    <>
      {/* LABEL DEBUG sementara, hapus kalau sudah jalan */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(0,0,0,0.7)",
          color: "#0f0",
          fontSize: 12,
          padding: "4px 8px",
          borderRadius: 6,
        }}
      >
        active: {active} | lines: {lines.length} | t:{" "}
        {(audioRef?.current?.currentTime ?? -1).toFixed(1)} | paused:{" "}
        {String(audioRef?.current?.paused)}
      </div>

      <div
        ref={boxRef}
        className="synced-lyrics"
        onWheel={pauseAutoScroll}
        onTouchMove={pauseAutoScroll}
      >
        {lines.map((line, i) => {
          const dist = Math.abs(i - active);
          return (
            <button
              key={`${line.time}-${i}`}
              type="button"
              ref={(el) => (lineRefs.current[i] = el)}
              className={`synced-line${i === active ? " is-active" : ""}${
                i < active ? " is-past" : ""
              }`}
              style={{
                "--d": Math.min(dist, 4),
                "--delay": `${Math.min(dist, 5) * 40}ms`,
              }}
              onClick={() => {
                pausedUntil.current = 0;
                onSeek?.(line.time);
              }}
            >
              {line.text}
            </button>
          );
        })}
      </div>
    </>
  );
}
