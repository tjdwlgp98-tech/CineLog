import { MySheet } from "./MySheet";
import { colors, radius, spacing, typography } from "../constants/theme";
import type { Movie } from "../store/movies";
import { useMoviesStore } from "../store/movies";
import { Pressable, StyleSheet, Text, View } from "react-native";

type MovieDetailSheetProps = {
  movie: Movie | null;
  onClose: () => void;
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function MovieDetailSheet({ movie, onClose }: MovieDetailSheetProps) {
  const setArchived = useMoviesStore((s) => s.setArchived);
  const deleteMovie = useMoviesStore((s) => s.deleteMovie);

  const toggleArchive = () => {
    if (!movie) return;
    setArchived(movie.id, !movie.archived);
    onClose();
  };

  const remove = () => {
    if (!movie) return;
    deleteMovie(movie.id);
    onClose();
  };

  return (
    <MySheet visible={movie != null} onClose={onClose} title={movie?.title}>
      {movie ? (
        <>
          <View style={styles.meta}>
            {movie.year != null ? (
              <Text style={styles.metaText}>{movie.year}</Text>
            ) : null}
            {movie.director ? (
              <Text style={styles.metaText}>{movie.director}</Text>
            ) : null}
            <Text style={styles.metaMuted}>
              Watched {formatDate(movie.watchedAt)}
            </Text>
          </View>
          {movie.rating != null ? (
            <Text style={styles.rating}>Rating: {movie.rating} / 5</Text>
          ) : null}
          {movie.notes ? (
            <Text style={styles.notes}>{movie.notes}</Text>
          ) : (
            <Text style={styles.notesMuted}>No notes</Text>
          )}
          <View style={styles.actions}>
            <Pressable
              onPress={toggleArchive}
              style={({ pressed }) => [
                styles.button,
                styles.buttonSecondary,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonSecondaryText}>
                {movie.archived ? "Restore to log" : "Move to archive"}
              </Text>
            </Pressable>
            <Pressable
              onPress={remove}
              style={({ pressed }) => [
                styles.button,
                styles.buttonDanger,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonDangerText}>Delete</Text>
            </Pressable>
          </View>
        </>
      ) : null}
    </MySheet>
  );
}

const styles = StyleSheet.create({
  meta: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  metaText: {
    ...typography.bodyLarge,
    color: colors.text,
  },
  metaMuted: {
    ...typography.caption,
    color: colors.textMuted,
  },
  rating: {
    ...typography.bodyLarge,
    color: colors.accent,
    marginBottom: spacing.md,
  },
  notes: {
    ...typography.bodyLarge,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  notesMuted: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  button: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonSecondaryText: {
    ...typography.subtitle,
    color: colors.text,
  },
  buttonDanger: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.danger,
  },
  buttonDangerText: {
    ...typography.subtitle,
    color: colors.danger,
  },
  pressed: {
    opacity: 0.85,
  },
});
