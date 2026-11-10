const SPACING = 340; // jarak antar disk di carousel (px)
const SIDE_SCALE = 0.6;
const SIDE_OPACITY = 0.6;

const SIZE_CENTER = 400; // size-100
const SIZE_LEFT = 600; // size-150
const LEFT_OFFSET = -20; // -left-5

const getOffset = (i, index, n) => {
  let d = (((i - index) % n) + n) % n;
  if (d > n / 2) d -= n;
  return d;
};

export const Disk = ({
  isCentered,
  isDocked,
  tracks,
  track,
  onSelect,
  togglePosition,
}) => {
  const n = tracks.length;
  const index = tracks.findIndex((t) => t.id === track.id);
  const size = isCentered ? SIZE_CENTER : SIZE_LEFT;

  return (
    <div
      className={`${isDocked ? "pointer-events-none" : "pointer-events-auto"} fixed z-20 top-1/2`}
      style={{
        width: size,
        height: size,
        left: isCentered ? "50%" : LEFT_OFFSET,
        transform: `translate(${isCentered ? "-50%" : "-300px"}, -50%)`,
        transition:
          "left 1000ms ease-in-out, transform 1000ms ease-in-out, width 1000ms ease-in-out, height 1000ms ease-in-out",
        transitionDelay: isCentered ? "0ms" : "1000ms",
      }}
    >
      {tracks.map((t, i) => {
        const d = getOffset(i, index, n);
        const isCurrent = d === 0;
        const isNeighbor = Math.abs(d) === 1;

        const x = isCentered ? d * SPACING : 0;
        const scale = isCentered && !isCurrent ? SIDE_SCALE : 1;
        const opacity = isCurrent
          ? 1
          : isCentered && isNeighbor
            ? SIDE_OPACITY
            : 0;
        const clickable = isCurrent || (isCentered && isNeighbor);

        const handleClick = () => {
          if (isCurrent) togglePosition();
          else if (isCentered) onSelect(t);
        };

        return (
          // Lapisan luar: fade mengikuti scroll (tanpa transisi, langsung ikut scroll)
          <div
            key={t.id}
            className={`absolute inset-0 ${isCurrent ? "z-10" : "z-0"} ${clickable ? "" : "pointer-events-none"}`}
            style={
              isCurrent
                ? undefined
                : { opacity: "calc(1 - var(--scroll-p, 0))" }
            }
          >
            {/* Lapisan dalam: transisi posisi, skala, dan opacity antar mode */}
            <div
              className="vinyl-wrap absolute inset-0"
              style={{
                transform: `translateX(${x}px) scale(${scale})`,
                opacity,
                transition:
                  "transform 1000ms ease-in-out, opacity 600ms ease-in-out",
              }}
            >
              <div className="vinyl-disk absolute size-full shrink-0">
                <img
                  src="/src/assets/disk.png"
                  className="absolute size-full cursor-pointer select-none"
                  alt="Vinyl disk"
                  draggable={false}
                  onClick={handleClick}
                />
                <img
                  className="absolute left-1/2 top-1/2 size-[40%] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full object-cover"
                  src={t.cover}
                  alt={t.title}
                  draggable={false}
                  onClick={handleClick}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
