import { TRACKS } from "./tracks.jsx";

const cover = (id) => TRACKS.find((t) => t.id === id)?.cover;

// Playlist shape: { id, name, cover, trackIds }
export const PLAYLISTS = [
  { id: 1, name: "Chill Vibes", cover: cover(1), trackIds: [1, 2] },
  { id: 2, name: "K-Pop Hits", cover: cover(3), trackIds: [3] },
  { id: 3, name: "Late Night", cover: cover(2), trackIds: [2, 1] },
];