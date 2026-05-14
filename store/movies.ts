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
};

type MoviesState = {
  movies: Movie[];
  addMovie: (input: Omit<Movie, "id" | "archived">) => void;
  updateMovie: (id: string, patch: Partial<Omit<Movie, "id">>) => void;
  deleteMovie: (id: string) => void;
  setArchived: (id: string, archived: boolean) => void;
};

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useMoviesStore = create<MoviesState>((set) => ({
  movies: [],
  addMovie: (input) =>
    set((s) => ({
      movies: [
        {
          id: generateId(),
          archived: false,
          ...input,
        },
        ...s.movies,
      ],
    })),
  updateMovie: (id, patch) =>
    set((s) => ({
      movies: s.movies.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  deleteMovie: (id) =>
    set((s) => ({
      movies: s.movies.filter((m) => m.id !== id),
    })),
  setArchived: (id, archived) =>
    set((s) => ({
      movies: s.movies.map((m) => (m.id === id ? { ...m, archived } : m)),
    })),
}));
