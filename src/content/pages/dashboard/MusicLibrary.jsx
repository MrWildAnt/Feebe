
import { useState } from "react";
import { Icon } from "@iconify/react";

const playlists = [
  {
    name: "Random song",
    icon: "mdi:music",
    color: "bg-orange-300",
    cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400",
  },
  {
    name: "Romantic song",
    icon: "mdi:heart",
    color: "bg-white",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400",
  },
  {
    name: "My Fav song",
    icon: "mdi:owl",
    color: "bg-cyan-300",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
  },
  {
    name: "Star regreat",
    icon: "mdi:star-four-points",
    color: "bg-white",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400",
  },
  {
    name: "Chill",
    icon: "mdi:cat",
    color: "bg-white",
    cover: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400",
  },
  {
    name: "Dj gaming",
    icon: "mdi:headphones",
    color: "bg-rose-300",
    cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400",
  },
];

const stations = [
  {
    name: "RNB & Soul",
    type: "RNB",
    color: "bg-red-500",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400",
  },
  {
    name: "Trap",
    type: "TRAP",
    color: "bg-green-500",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400",
  },
  {
    name: "Pop",
    type: "POP",
    color: "bg-purple-600",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
  },
];

const songs = [
  {
    id: 1,
    title: "2112",
    artist: "Reality Club",
    album: "What do you really k...",
    duration: "1:23",
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200",
  },
  {
    id: 2,
    title: "Dancing In The Dark",
    artist: "Joji, 88 Rising",
    album: "BALLADS1",
    duration: "3:45",
    cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200",
  },
  {
    id: 3,
    title: "Always",
    artist: "Rex Orange County",
    album: "Pony",
    duration: "6:12",
    cover: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  },
];

export const MusicLibrary = () => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  return (
    <section className="relative w-full max-w-250 h-[620px] overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#292727] via-[#171616] to-[#101010] p-7 text-white shadow-2xl">

      {/* Scrollbar */}
      <div className="absolute right-5 top-14 bottom-10 w-[5px] rounded-full bg-white/20">
        <div className="h-1/2 w-full rounded-full bg-white/80" />
      </div>

      <div className="h-full overflow-y-auto pr-7 scrollbar-hide">

        {/* ================= LIBRARY VIEW ================= */}
        {!selectedPlaylist ? (
          <>
            {/* Navigation Tabs */}
            <div className="mb-7 flex items-center gap-3">
              {["ALL", "MUSIC", "PODCAST"].map((tab, i) => (
                <button
                  key={tab}
                  className={`rounded-full px-4 py-1 text-[11px] font-semibold transition ${
                    i === 0
                      ? "bg-white text-black"
                      : "bg-white/20 text-white/70"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Playlist Grid */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-4">
              {playlists.map((playlist) => (
                <button
                  key={playlist.name}
                  onClick={() => setSelectedPlaylist(playlist)}
                  className="group flex h-[58px] cursor-pointer items-center gap-3 rounded-xl bg-white/[0.09] p-2 text-left transition hover:bg-white/[0.16]"
                >
                  <div className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg ${playlist.color}`}>
                    <Icon
                      icon={playlist.icon}
                      className="text-2xl text-neutral-900"
                    />
                  </div>

                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-white/85">
                    {playlist.name}
                  </span>

                  {playlist.name === "Random song" && (
                    <Icon
                      icon="mdi:play-circle"
                      className="mr-1 text-xl text-white/90"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Recommended Section */}
            <div className="mt-10">

              {/* Section Heading */}
              <div className="mb-5 grid grid-cols-2 gap-8">
                <div>
                  <p className="mb-1 text-[9px] text-white/40">
                    New Video Music From Laufey
                  </p>
                  <h3 className="text-sm font-bold">
                    You're Under Arrest
                  </h3>
                </div>

                <div>
                  <p className="mb-1 text-[9px] text-white/40">
                    Non-Stop Music Based On Your Favorite Song And Artist
                  </p>
                  <h3 className="text-sm font-bold">
                    Recommended Stations
                  </h3>
                </div>
              </div>

              {/* Music Cards */}
              <div className="grid grid-cols-4 gap-3">

                {/* Featured Card */}
                <div className="col-span-1 h-[190px] overflow-hidden rounded-xl bg-neutral-800">
                  <img
                    src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500"
                    alt="Featured music"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Station Cards */}
                {stations.map((station) => (
                  <div
                    key={station.name}
                    className={`relative flex h-[190px] cursor-pointer flex-col overflow-hidden rounded-xl p-3 transition duration-300 hover:-translate-y-1 ${station.color}`}
                  >
                    <span className="text-[10px] font-bold text-black/70">
                      {station.type}
                    </span>

                    <div className="mt-7 flex justify-center">
                      <img
                        src={station.image}
                        alt={station.name}
                        className="size-20 rounded-full border-4 border-black/20 object-cover shadow-xl"
                      />
                    </div>

                    <span className="mt-auto text-xs font-bold text-black">
                      {station.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (

          /* ================= PLAYLIST DETAIL VIEW ================= */
          <div className="animate-in fade-in duration-300">

            {/* Playlist Header */}
            <div className="relative -mx-7 -mt-7 flex h-[188px] items-center gap-5 rounded-[28px] bg-[#242424] p-7">

              {/* Back Button */}
              <button
                type="button"
                onClick={() => setSelectedPlaylist(null)}
                aria-label="Back to library"
                title="Back to library"
                className="absolute left-8 top-10 z-10 flex size-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
              >
                <Icon
                  icon="mdi:arrow-left"
                  className="text-lg"
                />
              </button>

              {/* Playlist Cover */}
              <img
                src={selectedPlaylist.cover}
                alt={selectedPlaylist.name}
                className="mt-5 size-32 shrink-0 rounded-lg object-cover"
              />

              {/* Playlist Information */}
              <div className="mt-5 min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-white/70">
                  Public Playlist
                </p>

                <h1 className="truncate text-2xl font-bold">
                  {selectedPlaylist.name}
                </h1>

                <p className="mt-1 text-[10px] text-white/40">
                  I love song like this.
                </p>

                <div className="mt-3 flex items-center gap-2 text-[10px] text-white/40">
                  <Icon
                    icon="mdi:plus-circle-outline"
                    className="text-xl"
                  />
                  <Icon
                    icon="mdi:account-circle"
                    className="text-xl"
                  />
                  <span>•</span>
                  <span>11 Song, 4 hr 5 min</span>
                </div>
              </div>

              {/* Play / Pause */}
              <button className="mt-5 flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:scale-105">
                <Icon
                  icon="mdi:pause"
                  className="text-2xl"
                />
              </button>
            </div>

            {/* Playlist Actions */}
            <div className="flex items-center gap-3 pt-4 pb-3">
              <button className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-black transition hover:bg-white/80">
                <Icon
                  icon="mdi:plus"
                  className="text-base"
                />
                Add
              </button>

              <button className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-black transition hover:bg-white/80">
                <Icon
                  icon="mdi:pencil-outline"
                  className="text-base"
                />
                Name & Details
              </button>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[25px_1.1fr_1fr_1fr] items-center border-b border-white/20 py-2 text-[10px] text-white/40">
              <span>#</span>
              <span>Artist</span>
              <span>Album</span>
              <Icon icon="mdi:clock-time-four-outline" />
            </div>

            {/* Song List */}
            <div className="pb-6">
              {songs.map((song, index) => (
                <div
                  key={song.id}
                  className="group grid grid-cols-[25px_1.1fr_1fr_1fr] items-center gap-2 rounded-lg py-3 transition hover:bg-white/5"
                >
                  <span className="text-[10px] text-white/40">
                    {index + 1}.
                  </span>

                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={song.cover}
                      alt={song.title}
                      className="size-12 shrink-0 rounded-lg object-cover"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold">
                        {song.title}
                      </p>
                      <p className="truncate text-[9px] text-white/40">
                        {song.artist}
                      </p>
                    </div>
                  </div>

                  <span className="truncate text-[10px] text-white/40">
                    {song.album}
                  </span>

                  <span className="text-[10px] text-white/40">
                    {song.duration}
                  </span>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
