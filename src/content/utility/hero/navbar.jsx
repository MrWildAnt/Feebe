import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
// Sesuaikan path import ini dengan lokasi file tracks kamu
import { TRACKS } from "../../data/tracks.jsx";

// Tinggi navbar daisyUI default (4rem). Dipakai juga sebagai tinggi canvas bars.
const NAV_HEIGHT = 64;

// Search bar + popup recent search
const SearchBox = () => {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  // Tutup popup kalau klik di luar search box
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <label className="input input-bordered flex w-64 items-center gap-2 rounded-full border-current bg-transparent text-inherit">
        <input
          type="text"
          className="grow placeholder:text-inherit placeholder:opacity-70"
          placeholder="Search..."
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        />
        <Icon icon="lucide:search" className="h-5 w-5" />
      </label>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-3 w-80 rounded-3xl bg-neutral-800/40 p-4 text-white shadow-2xl backdrop-blur-xs">
          <h3 className="mb-3 text-base font-bold">Recent search</h3>

          <ul className="flex flex-col gap-1">
            {TRACKS.map((track) => (
              <li key={track.id}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/10"
                >
                  <img
                    src={track.cover}
                    alt={track.title}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{track.title}</p>
                    <p className="truncate text-xs text-white/60">
                      {track.author}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const Navbar = ({ bgRef, canvasRef, gradient, width }) => {
  return (
    <div className="navbar fixed top-0 z-20">
      {/* Background + visualizer navbar: meniru hero, fade in saat scroll */}
      <div
        ref={bgRef}
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-0 transition-colors duration-1000"
        style={{ background: gradient }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={NAV_HEIGHT}
          className="absolute inset-0 h-full w-full"
        />
      </div>

      {/* Logo */}
      <div className="navbar-start pl-25">
        <a className="btn btn-ghost border-0 text-xl font-bold text-inherit hover:bg-white/20">
          FeeBe
          <Icon icon="mdi:music-note" className="h-4 w-4" />
        </a>
      </div>

      {/* Menu navigasi */}
      <div className="navbar-center gap-2">
        <a className="btn btn-ghost border-0 text-base font-semibold text-inherit hover:bg-white/20">
          Home
        </a>
        <a className="btn btn-ghost border-0 text-base font-semibold text-inherit hover:bg-white/20">
          Discover
        </a>
        <a className="btn btn-ghost border-0 text-base font-semibold text-inherit hover:bg-white/20">
          Library
        </a>
      </div>

      {/* Search + avatar + notifikasi */}
      <div className="navbar-end gap-5">
        <SearchBox />

        <button className="btn btn-ghost btn-circle avatar border-0 hover:bg-white/20">
          <div className="w-10 rounded-full">
            <img alt="Profile" src="/avatar.png" />
          </div>
        </button>

        <button className="btn btn-ghost btn-circle border-0 text-inherit hover:bg-white/20">
          <div className="indicator">
            <Icon icon="mdi:bell" className="h-6 w-6" />
            <span className="badge badge-xs badge-error indicator-item"></span>
          </div>
        </button>
      </div>
    </div>
  );
};