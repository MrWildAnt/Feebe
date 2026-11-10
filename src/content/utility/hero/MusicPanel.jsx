import { MusicPlayer } from "../universal/MusicPlayer.jsx"; // sesuaikan path

export const MusicPanel = ({ hidden, tracks = [], currentId, onSelect }) => {
  return (
    <div
      inert={hidden}
      aria-hidden={hidden}
      className={`music-panel absolute right-20 flex flex-col gap-3 transition-[opacity,visibility] duration-700 ease-in-out ${
        hidden
          ? "invisible opacity-0 pointer-events-none"
          : "visible opacity-100 delay-1000"
      }`}
    >
      <h1 className="text-2xl font-bold text-inherit">Trend of the months</h1>

      {/* Track list */}
      <div className="music flex flex-col gap-3">
        {tracks.map((t) => (
          <div
            key={t.id}
            onClick={() => onSelect(t)}
            className={`flex w-90 cursor-pointer items-center justify-between rounded-xl p-2 transition-colors duration-300 hover:bg-white/20 ${
              t.id === currentId ? "bg-white/20" : ""
            }`}
          >
            <div className="flex gap-4">
              <img
                src={t.cover}
                className="h-15 w-15 rounded-lg shadow-xl"
                alt={t.title}
              />
              <div>
                <h1 className="music-tittle-small">{t.title}</h1>
                <p className="music-author-small">{t.author}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="divider bg-[currentColor]" />
    </div>
  );
};