import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { usePlayer } from "../../utility/universal/PlayerContext.jsx";

export const SearchMusic = () => {
  const { tracks, onSelect } = usePlayer();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [recentIds, setRecentIds] = useState([]);
  const boxRef = useRef(null);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return [];

    return tracks.filter((track) =>
      `${track.title} ${track.author}`
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, tracks]);

  const recentTracks = useMemo(
    () =>
      recentIds
        .map((id) => tracks.find((track) => track.id === id))
        .filter(Boolean),
    [recentIds, tracks],
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectTrack = (track) => {
    onSelect(track);
    setRecentIds((current) => [
      track.id,
      ...current.filter((id) => id !== track.id),
    ]);
    setQuery("");
    setOpen(false);
  };

  const visibleTracks = query.trim() ? results : recentTracks;

  return (
    <div ref={boxRef} className="relative z-50">
      <div className="input input-bordered flex w-64 items-center gap-2 rounded-full border-current bg-transparent text-inherit">
        <input
          type="search"
          className="grow placeholder:text-inherit placeholder:opacity-70"
          placeholder="Search..."
          value={query}
          aria-label="Search music"
          aria-expanded={open}
          aria-controls="music-search-results"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "Enter" && visibleTracks[0]) {
              event.preventDefault();
              selectTrack(visibleTracks[0]);
            }
          }}
        />
        {query ? (
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-circle"
            aria-label="Clear search"
            onClick={() => setQuery("")}
          >
            <Icon icon="lucide:x" className="h-4 w-4" />
          </button>
        ) : (
          <Icon icon="lucide:search" className="h-5 w-5" />
        )}
      </div>

      {open && (
        <div
          id="music-search-results"
          className="absolute right-0 top-full z-30 mt-3 w-80 rounded-3xl bg-neutral-800/50 p-4 text-white shadow-2xl backdrop-blur-xl"
        >
          <h3 className="mb-3 text-base font-bold">
            {query.trim() ? "Search results" : "Recent search"}
          </h3>

          {visibleTracks.length > 0 ? (
            <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
              {visibleTracks.map((track) => (
                <li key={track.id}>
                  <button
                    type="button"
                    onClick={() => selectTrack(track)}
                    className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/10"
                  >
                    <img
                      src={track.cover}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {track.title}
                      </p>
                      <p className="truncate text-xs text-white/60">
                        {track.author}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-2 py-4 text-sm text-white/60">
              {query.trim()
                ? "No music found."
                : "Your selected songs will appear here."}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchMusic;