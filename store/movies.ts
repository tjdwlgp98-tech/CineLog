import { supabase } from "../lib/supabase";
import { create } from "zustand";

export type Movie = {
  id: string;
  title: string;
  director?: string;
  year?: number;
  rating?: number;
  notes?: string;
  watchedAt: string;
  archived: boolean;
  posterPath?: string;
};

type DbRow = {
  id: string;
  title: string;
  director: string | null;
  year: number | null;
  rating: number | null;
  notes: string | null;
  watched_at: string;
  archived: boolean;
  poster_path: string | null;
};

function rowToMovie(r: DbRow): Movie {
  return {
    id: r.id,
    title: r.title,
    director: r.director ?? undefined,
    year: r.year ?? undefined,
    rating: r.rating ?? undefined,
    notes: r.notes ?? undefined,
    watchedAt: r.watched_at,
    archived: r.archived,
    posterPath: r.poster_path ?? undefined,
  };
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

type MoviesState = {
  movies: Movie[];
  fetchMovies: () => Promise<void>;
  addMovie: (input: Omit<Movie, "id" | "archived">) => Promise<void>;
  updateMovie: (id: string, patch: Partial<Omit<Movie, "id">>) => Promise<void>;
  deleteMovie: (id: string) => Promise<void>;
  setArchived: (id: string, archived: boolean) => Promise<void>;
};

export const useMoviesStore = create<MoviesState>((set, get) => ({
  movies: [],

  fetchMovies: async () => {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .order("watched_at", { ascending: false });
    if (!error && data) {
      set({ movies: (data as DbRow[]).map(rowToMovie) });
    }
  },

  addMovie: async (input) => {
    const movie: Movie = { id: generateId(), archived: false, ...input };
    set((s) => ({ movies: [movie, ...s.movies] }));
    await supabase.from("movies").insert({
      id: movie.id,
      title: movie.title,
      director: movie.director ?? null,
      year: movie.year ?? null,
      rating: movie.rating ?? null,
      notes: movie.notes ?? null,
      watched_at: movie.watchedAt,
      archived: movie.archived,
      poster_path: movie.posterPath ?? null,
    });
  },

  updateMovie: async (id, patch) => {
    set((s) => ({
      movies: s.movies.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
    const dbPatch: Partial<DbRow> = {};
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.director !== undefined) dbPatch.director = patch.director ?? null;
    if (patch.year !== undefined) dbPatch.year = patch.year ?? null;
    if (patch.rating !== undefined) dbPatch.rating = patch.rating ?? null;
    if (patch.notes !== undefined) dbPatch.notes = patch.notes ?? null;
    if (patch.watchedAt !== undefined) dbPatch.watched_at = patch.watchedAt;
    if (patch.archived !== undefined) dbPatch.archived = patch.archived;
    if (patch.posterPath !== undefined) dbPatch.poster_path = patch.posterPath ?? null;
    await supabase.from("movies").update(dbPatch).eq("id", id);
  },

  deleteMovie: async (id) => {
    set((s) => ({ movies: s.movies.filter((m) => m.id !== id) }));
    await supabase.from("movies").delete().eq("id", id);
  },

  setArchived: async (id, archived) => {
    get().updateMovie(id, { archived });
  },
}));
