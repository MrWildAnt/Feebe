import { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { SearchMusic } from "../../pages/search/SearchMusic.jsx";

// Tinggi canvas visualizer mengikuti tinggi navbar daisyUI (4rem).
const NAV_HEIGHT = 64;

// Ref dan tampilan latar diteruskan dari Hero agar visualizer selaras saat scroll.

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

      {/* SearchMusic memakai data dan aksi pemutar yang sama dengan player utama. */}
      <div className="navbar-end gap-5">
        <SearchMusic />

        <button className="btn btn-ghost btn-circle avatar border-0 hover:bg-white/20">
          <div className="w-10 rounded-full">
            <img src="../../../assets/cover/apt.png" className="image-full" />
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