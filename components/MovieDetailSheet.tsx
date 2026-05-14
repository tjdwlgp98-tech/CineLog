import { MySheet } from "./MySheet";
import { Colors, useColors, radius, spacing, typography } from "../constants/theme";
import type { Movie } from "../store/movies";
import { useMoviesStore } from "../store/movies";
import { useMemo } from "react";
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
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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

function makeStyles(c: Colors) {
  return StyleSheet.create({
    meta: {
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    metaText: {
      ...typography.body,
      color: c.text,
    },
    metaMuted: {
      ...typography.caption,
      color: c.textSecondary,
    },
    rating: {
      ...typography.body,
      color: c.primaryText,
      marginBottom: spacing.md,
    },
    notes: {
      ...typography.body,
      color: c.text,
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    notesMuted: {
      ...typography.caption,
      color: c.textSecondary,
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
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    buttonSecondaryText: {
      ...typography.subtitle,
      fontSize: 16,
      color: c.text,
    },
    buttonDanger: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: c.danger,
    },
    buttonDangerText: {
      ...typography.subtitle,
      fontSize: 16,
      color: c.danger,
    },
    pressed: {
      opacity: 0.85,
    },
  });
}
