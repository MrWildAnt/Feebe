export const Disk = ({ isCentered, isDocked, track, togglePosition }) => {
  return (
    <div
      className={`${isDocked ? "pointer-events-none" : "pointer-events-auto"} fixed z-20 top-1/2 size-150 ${isCentered ? "left-1/2" : "left-0"}`}
      style={{
        transform: `translate(${isCentered ? "-50%" : "-300px"}, -50%)`,
        transition: "left 1000ms ease-in-out, transform 1000ms ease-in-out",
        transitionDelay: isCentered ? "0ms" : "1000ms",
      }}
    >
      {/* disk (spinning, in front) */}
      <div className="vinyl-disk absolute z-10 size-full shrink-0">
        <img
          src="/src/assets/disk.png"
          className="absolute size-full cursor-pointer select-none"
          alt="Vinyl disk"
          draggable={false}
          onClick={togglePosition}
        />

        <img
          className="absolute left-1/2 top-1/2 size-[40%] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full object-cover"
          src={track.cover}
          alt={track.title}
          draggable={false}
          onClick={togglePosition}
        />
      </div>
    </div>
  );
};
