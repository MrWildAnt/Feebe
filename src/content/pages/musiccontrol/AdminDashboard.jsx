// import { useEffect, useRef, useState } from "react";
// import { Icon } from "@iconify/react";
// import { FastAverageColor } from "fast-average-color";
// import { supabase } from "../../../lib/supabase.js";
// import {
//   fetchTracks,
//   createTrack,
//   updateTrack,
//   deleteTrack,
//   uploadTrackFile,
// } from "../../data/tracks.jsx";

const EMPTY_SONG = { id: null, title: "", artist: "", author: "", cover: "", audio: "" };
const EMPTY_AUTHOR = { id: null, name: "", bio: "" };

// const panel = "rounded-2xl bg-white/70 p-5 text-black shadow-xl backdrop-blur-md";
// const field =
//   "w-full rounded-xl border border-black/20 bg-white/80 px-3 py-2 text-sm outline-none focus:border-black";
// const pill =
//   "flex cursor-pointer items-center gap-1 rounded-full border border-black/30 px-3 py-1 text-xs font-medium transition hover:bg-black hover:text-white disabled:opacity-40";

export const AdminDashboard = ({ currentTrack }) => {
  const [songs, setSongs] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [playing, setPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bg, setBg] = useState({ hex: "#7a98a8", isDark: false });
  const [songForm, setSongForm] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [authorForm, setAuthorForm] = useState(EMPTY_AUTHOR);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  // State untuk Realtime Chart Analytics
  // Set default ke angka 0 semua (kosong) agar masuk ke empty state dulu
  const [chartData, setChartData] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [liveActiveCount, setLiveActiveCount] = useState(0);

  const audioRef = useRef(null);
  const active = playing || currentTrack || songs[0];

//   const notify = (text, error = false) => {
//     setMsg({ text, error });
//     setTimeout(() => setMsg(null), 3500);
//   };

  const loadSongs = async () => {
    try {
      setSongs(await fetchTracks());
    } catch (e) {
      notify(`Could not load songs: ${e.message}`, true);
    }
  };

  const loadAuthors = async () => {
    const { data, error } = await supabase
      .from("authors")
      .select("id, name, bio")
      .order("name");
    if (error) return notify(`Could not load authors: ${error.message}`, true);
    setAuthors(data);
  };

  // Load Analytics & Setup Realtime Channel
  const loadAnalytics = async () => {
    try {
      const { data: sessions } = await supabase.from("active_sessions").select("*");
      if (sessions) {
        setLiveActiveCount(sessions.length);
      }
      
      // Jika nanti teman kamu sudah isi tabel log/analytics di supabase, fetch datanya ke sini.
      // const { data: logs } = await supabase.from("listening_logs").select("*");
      // if (logs && logs.length > 0) { setChartData(logs); }
    } catch (e) {
      console.error("Error analytics:", e);
    }
  };

  useEffect(() => {
    loadSongs();
    loadAuthors();
    loadAnalytics();

    const channel = supabase
      .channel("admin-chart-analytics")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "active_sessions" },
        () => loadAnalytics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!active?.cover) return;
    const fac = new FastAverageColor();
    let cancelled = false;
    fac
      .getColorAsync(active.cover, { algorithm: "dominant", crossOrigin: "anonymous" })
      .then((c) => !cancelled && setBg({ hex: c.hex, isDark: c.isDark }))
      .catch(() => {});
    return () => {
      cancelled = true;
      fac.destroy();
    };
  }, [active?.cover]);

  const togglePlay = (song) => {
    if (playing?.id === song.id) {
      setIsPlaying((v) => !v);
    } else {
      setPlaying(song);
      setIsPlaying(true);
    }
  };

//   useEffect(() => {
//     const a = audioRef.current;
//     if (!a || !playing) return;
//     if (isPlaying) a.play().catch(() => setIsPlaying(false));
//     else a.pause();
//   }, [isPlaying, playing]);

  const saveSong = async (e) => {
    e.preventDefault();
    if (!songForm.title.trim() || !songForm.artist?.trim() || !songForm.author) {
      return notify("Title, artist, and author are required.", true);
    }
    const isNew = songForm.id === null;
    if (isNew && (!coverFile || !audioFile)) {
      return notify("Choose a cover image and an audio file.", true);
    }

    setBusy(true);
    try {
      const data = {
        title: songForm.title.trim(),
        artist: songForm.artist.trim(),
        author: songForm.author,
        cover: coverFile ? await uploadTrackFile("covers", coverFile) : songForm.cover,
        audio: audioFile ? await uploadTrackFile("music", audioFile) : songForm.audio,
      };
      if (isNew) await createTrack(data);
      else await updateTrack(songForm.id, data);

//       notify(isNew ? "Song added." : "Song updated.");
//       closeSongForm();
//       await loadSongs();
//     } catch (err) {
//       notify(err.message, true);
//     } finally {
//       setBusy(false);
//     }
//   };

//   const removeSong = async (song) => {
//     if (!confirm(`Delete "${song.title}"?`)) return;
//     try {
//       await deleteTrack(song.id);
//       if (playing?.id === song.id) {
//         setPlaying(null);
//         setIsPlaying(false);
//       }
//       notify("Song deleted.");
//       await loadSongs();
//     } catch (err) {
//       notify(err.message, true);
//     }
//   };

//   const closeSongForm = () => {
//     setSongForm(null);
//     setCoverFile(null);
//     setAudioFile(null);
//   };

  const saveAuthor = async (e) => {
    e.preventDefault();
    const name = authorForm.name.trim();
    if (!name) return notify("Author name is required.", true);

//     const row = { name, bio: authorForm.bio.trim() };
//     const q = authorForm.id
//       ? supabase.from("authors").update(row).eq("id", authorForm.id)
//       : supabase.from("authors").insert(row);
//     const { error } = await q;
//     if (error) return notify(error.message, true);

//     notify(authorForm.id ? "Author updated." : "Author added.");
//     setAuthorForm(EMPTY_AUTHOR);
//     loadAuthors();
//   };

//   const removeAuthor = async (author) => {
//     if (!confirm(`Delete author "${author.name}"?`)) return;
//     const { error } = await supabase.from("authors").delete().eq("id", author.id);
//     if (error) return notify(error.message, true);
//     notify("Author deleted.");
//     if (authorForm.id === author.id) setAuthorForm(EMPTY_AUTHOR);
//     loadAuthors();
//   };

  const endColor = bg.isDark ? "#E0F2FE" : "#000000";

  // Kalkulasi koordinat SVG Line Chart (hanya jalan kalau data ada)
  const maxUsers = chartData.length > 0 ? Math.max(...chartData.map((d) => d.users), 10) : 10;
  const chartHeight = 160;
  const chartWidth = 600;
  const points = chartData.length > 0 ? chartData
    .map((d, i) => {
      const x = (i / (chartData.length - 1)) * chartWidth;
      const y = chartHeight - (d.users / maxUsers) * (chartHeight - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ") : "";

  return (
    <div
      className="min-h-screen w-full p-6 transition-[background] duration-1000 md:p-10"
      style={{
        background: `linear-gradient(135deg, ${bg.hex} 0%, ${endColor} 300%)`,
        color: bg.isDark ? "#E0F2FE" : "#000",
      }}
    >
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        src={playing?.audio}
        onEnded={() => setIsPlaying(false)}
      />

      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Feebe admin</h1>
        {active && (
          <div className="flex items-center gap-3 rounded-full bg-white/70 py-1 pr-4 pl-1 text-black backdrop-blur-md">
            <img src={active.cover} alt="" className="size-9 rounded-full object-cover" />
            <span className="text-sm font-medium">
              {active.title} · {active.artist || active.author}
            </span>
          </div>
        )}
      </header>

//       {msg && (
//         <div
//           role="status"
//           className={`fixed top-5 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2 text-sm font-medium shadow-lg ${
//             msg.error ? "bg-red-600 text-white" : "bg-black text-white"
//           }`}
//         >
//           {msg.text}
//         </div>
//       )}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Manage song */}
        <section className={panel}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Manage songs</h2>
            <button
              className={pill}
              onClick={() => setSongForm({ ...EMPTY_SONG, author: authors[0]?.name ?? "" })}
            >
              <Icon icon="mdi:plus" /> Add song
            </button>
          </div>

          {songs.length === 0 ? (
            <p className="py-10 text-center text-sm opacity-60">No songs yet. Add the first one.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/20">
                    <th className="py-2 pr-3">ID</th>
                    <th className="pr-3">Cover</th>
                    <th className="pr-3">Title</th>
                    <th className="pr-3">Author</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map((s) => (
                    <tr
                      key={s.id}
                      className={`border-b border-black/10 ${playing?.id === s.id ? "bg-black/5" : ""}`}
                    >
                      <td className="py-2 pr-3 font-semibold">{s.id}</td>
                      <td className="pr-3">
                        <button
                          type="button"
                          onClick={() => togglePlay(s)}
                          aria-label={`Play ${s.title}`}
                          className="group relative block size-12 cursor-pointer"
                        >
                          <img src={s.cover} alt="" className="size-12 rounded-lg object-cover" />
                          <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 text-xl text-white opacity-0 transition group-hover:opacity-100">
                            <Icon
                              icon={
                                playing?.id === s.id && isPlaying
                                  ? "basil:pause-solid"
                                  : "clarity:play-solid"
                              }
                            />
                          </span>
                        </button>
                      </td>
                      <td className="pr-3 font-medium">{s.title}</td>
                      <td className="pr-3">{s.author}</td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button
                            className={pill}
                            onClick={() => setSongForm({ ...s, artist: s.artist || "" })}
                            aria-label={`Edit ${s.title}`}
                          >
                            <Icon icon="mdi:pencil" /> Edit
                          </button>
                          <button
                            className={pill}
                            onClick={() => removeSong(s)}
                            aria-label={`Delete ${s.title}`}
                          >
                            <Icon icon="mdi:trash-can-outline" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Authors */}
        <div className="flex flex-col gap-6">
          <form onSubmit={saveAuthor} className={`${panel} flex flex-col gap-3`}>
            <h2 className="text-xl font-bold">{authorForm.id ? "Edit author" : "Add author"}</h2>
            <input
              className={field}
              placeholder="Name"
              value={authorForm.name}
              onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })}
            />
            <textarea
              className={`${field} min-h-20 resize-none`}
              placeholder="Bio"
              value={authorForm.bio}
              onChange={(e) => setAuthorForm({ ...authorForm, bio: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              {authorForm.id && (
                <button type="button" className={pill} onClick={() => setAuthorForm(EMPTY_AUTHOR)}>
                  Cancel
                </button>
              )}
              <button type="submit" className={pill}>
                <Icon icon={authorForm.id ? "mdi:check" : "mdi:plus"} />{" "}
                {authorForm.id ? "Save changes" : "Add author"}
              </button>
            </div>
          </form>

          <section className={panel}>
            <h2 className="mb-3 text-xl font-bold">Authors</h2>
            {authors.length === 0 ? (
              <p className="text-sm opacity-60">No authors yet.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {authors.map((a) => (
                  <li
                    key={a.id}
                    onClick={() => setAuthorForm({ id: a.id, name: a.name, bio: a.bio ?? "" })}
                    className="flex cursor-pointer items-center justify-between rounded-xl px-2 py-1.5 hover:bg-black/5"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-black/10">
                        <Icon icon="mdi:account-outline" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{a.name}</p>
                        {a.bio && <p className="truncate text-xs opacity-60">{a.bio}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="cursor-pointer rounded-full p-1.5 hover:bg-black/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAuthorForm({ id: a.id, name: a.name, bio: a.bio ?? "" });
                        }}
                        aria-label={`Edit ${a.name}`}
                      >
                        <Icon icon="mdi:pencil" />
                      </button>
                      <button
                        className="cursor-pointer rounded-full p-1.5 hover:bg-black/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAuthor(a);
                        }}
                        aria-label={`Delete ${a.name}`}
                      >
                        <Icon icon="mdi:trash-can-outline" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* ---------------- REALTIME PLATFORM ACTIVITY (EMPTY STATE KETIKA BELUM ADA DATA) ---------------- */}
      <section className={`mt-6 ${panel}`}>
        <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold">Realtime Platform Activity</h2>
            <p className="text-xs opacity-60">Pantau jumlah pengguna aktif dan durasi streaming harian</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-black/5 px-3 py-1.5 text-xs font-semibold">
              Online Now: <span className="text-emerald-600">{liveActiveCount} users</span>
            </div>
            <span className="flex items-center gap-2 text-xs font-semibold">
              <span className="relative flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-3 rounded-full bg-emerald-500"></span>
              </span>
              Live Sync
            </span>
          </div>
        </div>

        {/* Kondisi: Jika chartData kosong, tampilkan Empty State yang bersih */}
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-black/5 text-2xl opacity-50">
              <Icon icon="mdi:chart-line-variant" />
            </div>
            <p className="text-sm font-semibold">Belum ada data aktivitas atau riwayat pemutaran</p>
            <p className="mt-1 text-xs opacity-50 max-w-sm">
              Grafik aktivitas dan durasi streaming akan otomatis muncul di sini begitu ada pengguna yang mendengarkan musik di Feebe.
            </p>
          </div>
        ) : (
          /* Chart Container (Hanya muncul kalau data sudah ada) */
          <div className="relative w-full overflow-x-auto pt-4">
            <div className="relative h-48 w-full min-w-[500px]">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full overflow-visible">
                {[0, 0.33, 0.66, 1].map((ratio, idx) => (
                  <line
                    key={idx}
                    x1="0"
                    y1={chartHeight * ratio}
                    x2={chartWidth}
                    y2={chartHeight * ratio}
                    stroke="currentColor"
                    strokeOpacity="0.08"
                    strokeDasharray="4 4"
                  />
                ))}

                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-black/80 transition-all duration-300"
                  points={points}
                />

                {chartData.map((d, i) => {
                  const x = (i / (chartData.length - 1)) * chartWidth;
                  const y = chartHeight - (d.users / maxUsers) * (chartHeight - 20) - 10;
                  const isHovered = hoveredIndex === i;

                  return (
                    <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                      {isHovered && (
                        <line
                          x1={x}
                          y1="0"
                          x2={x}
                          y2={chartHeight}
                          stroke="currentColor"
                          strokeDasharray="2 2"
                          strokeOpacity="0.4"
                        />
                      )}

                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? "6" : "4"}
                        className="fill-white stroke-black transition-all duration-200"
                        strokeWidth="2.5"
                      />

                      {isHovered && (
                        <foreignObject x={x - 60} y={y - 75} width="120" height="70" className="overflow-visible z-50">
                          <div className="rounded-xl bg-black px-3 py-2 text-white shadow-xl backdrop-blur-md">
                            <p className="text-[10px] opacity-70">{d.day}</p>
                            <p className="text-xs font-bold">{d.users} Active Users</p>
                            <p className="text-[10px] text-emerald-400">{d.time} mins listened</p>
                          </div>
                        </foreignObject>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="mt-4 flex justify-between px-2 text-xs font-medium opacity-60">
              {chartData.map((d, i) => (
                <span
                  key={i}
                  className={`cursor-pointer transition hover:font-bold hover:opacity-100 ${
                    hoveredIndex === i ? "font-bold text-black opacity-100" : ""
                  }`}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {d.day}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Song modal (add / edit) */}
      {songForm && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
          onClick={closeSongForm}
        >
          <form
            onSubmit={saveSong}
            onClick={(e) => e.stopPropagation()}
            className={`${panel} flex w-full max-w-md flex-col gap-3 bg-white!`}
          >
            <h2 className="text-xl font-bold">{songForm.id === null ? "Add song" : "Edit song"}</h2>

            <input
              className={field}
              placeholder="Title"
              value={songForm.title}
              onChange={(e) => setSongForm({ ...songForm, title: e.target.value })}
            />

            <input
              className={field}
              placeholder="Artist Name (e.g. Oasis, Twice)"
              value={songForm.artist || ""}
              onChange={(e) => setSongForm({ ...songForm, artist: e.target.value })}
            />

            <select
              className={field}
              value={songForm.author}
              onChange={(e) => setSongForm({ ...songForm, author: e.target.value })}
            >
              <option value="" disabled>
                Choose author
              </option>
              {authors.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>

//             <label className="text-sm">
//               Cover image {songForm.id !== null && "(leave empty to keep current)"}
//               <input
//                 type="file"
//                 accept="image/*"
//                 className={`${field} mt-1`}
//                 onChange={(e) => setCoverFile(e.target.files[0] ?? null)}
//               />
//             </label>

//             <label className="text-sm">
//               Audio file {songForm.id !== null && "(leave empty to keep current)"}
//               <input
//                 type="file"
//                 accept="audio/*"
//                 className={`${field} mt-1`}
//                 onChange={(e) => setAudioFile(e.target.files[0] ?? null)}
//               />
//             </label>

//             <div className="mt-2 flex justify-end gap-2">
//               <button type="button" className={pill} onClick={closeSongForm}>
//                 Cancel
//               </button>
//               <button type="submit" className={pill} disabled={busy}>
//                 {busy ? "Saving..." : "Save song"}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

export default AdminDashboard;