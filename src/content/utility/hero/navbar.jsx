// Tinggi navbar daisyUI default (4rem). Dipakai juga sebagai tinggi canvas bars.
const NAV_HEIGHT = 64;

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

      <div className="navbar-start">
        <a className="btn btn-ghost border-0 text-xl text-inherit hover:bg-white/20">
          Menu
        </a>
      </div>

      <div className="navbar-center">
        <a className="btn btn-ghost border-0 text-xl text-inherit hover:bg-white/20">
          Feebe
        </a>
      </div>

      <div className="navbar-end">
        <button className="btn btn-ghost border-0 text-inherit hover:bg-white/20">
          Search
        </button>
      </div>
    </div>
  );
};