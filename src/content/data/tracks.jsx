import wonderwall from "../../assets/cover/wonderwall.png";
import blue from "../../assets/cover/blue.png";
import strategy from "../../assets/cover/strategy.png";
import blueaudio from "../../assets/music/yung kai - blue (official music video) - yung kai.mp3";
import strategyaudio from "../../assets/music/TWICE - Strategy (Lyrics) - 7clouds K-pop.mp3";
import wonderwallaudio from "../../assets/music/Oasis - Wonderwall (Lyrics) - Young Pilgrim Music.mp3";

// Track shape: { id, title, author, cover, audio }
// Keep these field names the same when you move to Supabase,
// so the UI components never need to change.
export const TRACKS = [
  {
    id: 1,
    title: "Wonderwall",
    author: "Oasis",
    cover: wonderwall,
    audio: wonderwallaudio,
  },
  { id: 2, title: "Blue", author: "Yungkai", cover: blue, audio: blueaudio },
  {
    id: 3,
    title: "Strategy",
    author: "Twice",
    cover: strategy,
    audio: strategyaudio,
  },
];

// Single place to load tracks. Local now, Supabase later.
export async function fetchTracks() {
  return TRACKS;

  // --- Supabase version (swap in later) ---
  // import { supabase } from "../../lib/supabase.js";
  //
  // const { data, error } = await supabase
  //   .from("tracks")
  //   .select("id, title, author, cover_url, audio_url")
  //   .order("id");
  // if (error) throw error;
  //
  // return data.map((row) => ({
  //   id: row.id,
  //   title: row.title,
  //   author: row.author,
  //   cover: row.cover_url,
  //   audio: row.audio_url,
  // }));
}