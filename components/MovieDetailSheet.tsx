import { MySheet } from "./MySheet";
import { Colors, useColors, radius, spacing, typography } from "../constants/theme";
import type { Movie } from "../store/movies";
import { useMoviesStore } from "../store/movies";
import { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type MovieDetailSheetProps = {
  movie: Movie | null;
  onClose: () => void;
  onEdit: () => void;
};

function formatDate(iso: string): string {
  try {
    const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function MovieDetailSheet({ movie, onClose, onEdit }: MovieDetailSheetProps) {
  const deleteMovie = useMoviesStore((s) => s.deleteMovie);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const remove = () => {
    if (!movie) return;
    deleteMovie(movie.id);
    onClose();
  };

  return (
    <MySheet visible={movie != null} onClose={onClose}>
      {movie ? (
        <>
          {/* 포스터 */}
          {movie.posterPath ? (
            <View style={styles.posterWrapper}>
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w342${movie.posterPath}` }}
                style={styles.poster}
                resizeMode="cover"
              />
            </View>
          ) : null}

          {/* 제목 */}
          <Text style={styles.title} numberOfLines={3}>{movie.title}</Text>

          {/* 메타 정보 */}
          <View style={styles.meta}>
            {(movie.director || movie.year) ? (
              <Text style={styles.metaText}>
                {[movie.director, movie.year].filter(Boolean).join(" · ")}
              </Text>
            ) : null}
            <Text style={styles.metaMuted}>관람일 {formatDate(movie.watchedAt)}</Text>
          </View>

          {/* 별점 */}
          {movie.rating != null ? (
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Text key={s} style={[styles.star, s <= movie.rating! && styles.starFilled]}>★</Text>
              ))}
            </View>
          ) : null}

          {/* 한줄평 */}
          {movie.notes ? (
            <Text style={styles.notes}>{movie.notes}</Text>
          ) : null}

          {/* 액션 버튼 */}
          <View style={styles.actions}>
            <Pressable
              onPress={onEdit}
              style={({ pressed }) => [styles.button, styles.buttonSecondary, pressed && styles.pressed]}
            >
              <Text style={styles.buttonSecondaryText}>수정</Text>
            </Pressable>
            <Pressable
              onPress={remove}
              style={({ pressed }) => [styles.button, styles.buttonDanger, pressed && styles.pressed]}
            >
              <Text style={styles.buttonDangerText}>삭제</Text>
            </Pressable>
          </View>
        </>
      ) : null}
    </MySheet>
  );
}

function makeStyles(c: Colors) {
  return StyleSheet.create({
    posterWrapper: {
      alignItems: "center",
      marginBottom: spacing.md,
    },
    poster: {
      width: 140,
      height: 210,
      borderRadius: radius.md,
    },

    title: {
      ...typography.subtitle,
      color: c.text,
      fontSize: 18,
      marginBottom: spacing.xs,
    },
    meta: {
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    metaText: {
      ...typography.bodyLarge,
      color: c.textSecondary,
    },
    metaMuted: {
      ...typography.caption,
      color: c.textTertiary,
    },

    starRow: {
      flexDirection: "row",
      gap: 4,
      marginBottom: spacing.md,
    },
    star: {
      fontSize: 22,
      color: c.border,
    },
    starFilled: {
      color: c.primary,
    },

    notes: {
      ...typography.bodyLarge,
      color: c.text,
      marginBottom: spacing.lg,
      lineHeight: 22,
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
      color: c.text,
    },
    buttonDanger: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: c.danger,
    },
    buttonDangerText: {
      ...typography.subtitle,
      color: c.danger,
    },
    pressed: {
      opacity: 0.85,
    },
  });
}
