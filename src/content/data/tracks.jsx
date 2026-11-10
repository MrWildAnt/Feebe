import { supabase } from "../../lib/supabase.js";
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

// true  = load from Supabase
// false = use local data (TRACKS)
const USE_SUPABASE = true;

// Single place to load tracks. Local now, Supabase later.
export async function fetchTracks() {
  if (!USE_SUPABASE) return TRACKS;

  // --- Supabase version ---
  const { data, error } = await supabase
    .from("tracks")
    .select("id, title, author, cover_url, audio_url")
    .order("id");
  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    author: row.author,
    cover: row.cover_url,
    audio: row.audio_url,
  }));
}

// ======================= CRUD (Supabase only) =======================

const COLUMNS = "id, title, author, cover_url, audio_url";

// DB row -> app track
const toTrack = (row) => ({
  id: row.id,
  title: row.title,
  author: row.author,
  cover: row.cover_url,
  audio: row.audio_url,
});

// app track -> DB row (only the fields that were provided)
const toRow = (track) => {
  const row = {};
  if (track.title !== undefined) row.title = track.title;
  if (track.author !== undefined) row.author = track.author;
  if (track.cover !== undefined) row.cover_url = track.cover;
  if (track.audio !== undefined) row.audio_url = track.audio;
  return row;
};

const requireSupabase = () => {
  if (!USE_SUPABASE) {
    throw new Error("CRUD needs Supabase. Set USE_SUPABASE = true.");
  }
};

// READ (one)
export async function fetchTrackById(id) {
  requireSupabase();

  const { data, error } = await supabase
    .from("tracks")
    .select(COLUMNS)
    .eq("id", id)
    .single();
  if (error) throw error;

  return toTrack(data);
}

// CREATE
// createTrack({ title, author, cover, audio }) -> the new track
export async function createTrack(track) {
  requireSupabase();

  const { data, error } = await supabase
    .from("tracks")
    .insert(toRow(track))
    .select(COLUMNS)
    .single();
  if (error) throw error;

  return toTrack(data);
}

// UPDATE
// updateTrack(3, { title: "New title" }) -> the updated track
export async function updateTrack(id, changes) {
  requireSupabase();

  const { data, error } = await supabase
    .from("tracks")
    .update(toRow(changes))
    .eq("id", id)
    .select(COLUMNS)
    .single();
  if (error) throw error;

  return toTrack(data);
}

// DELETE
// deleteTrack(3) -> true
export async function deleteTrack(id) {
  requireSupabase();

  const { error } = await supabase.from("tracks").delete().eq("id", id);
  if (error) throw error;

  return true;
}

// UPLOAD a file to Storage and get its public URL
// uploadTrackFile("music", file) -> "https://.../music/123-name.mp3"
// buckets: "covers" or "music"
export async function uploadTrackFile(bucket, file) {
  requireSupabase();

  // safe unique file name: no spaces or weird characters
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}