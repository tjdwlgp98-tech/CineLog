import { MySheet } from "./MySheet";
import { Colors, useColors, radius, spacing, typography } from "../constants/theme";
import type { Movie } from "../store/movies";
import { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const MOVIE_EMOJIS = [
  "🎬", "🎭", "🌊", "🍿", "🎥", "🌙", "⭐", "🔮",
  "🗺️", "🌹", "🔫", "🧠", "🚀", "🐉", "🌺", "🎞️",
  "🦁", "🌃", "🏔️", "🌊", "🎪", "🕵️", "👻", "🤖",
];

function getEmoji(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff;
  return MOVIE_EMOJIS[h % MOVIE_EMOJIS.length];
}

function formatDayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

type Props = {
  dateKey: string | null;
  movies: Movie[];
  onClose: () => void;
  onSelect: (movie: Movie) => void;
};

export function DayMoviesSheet({ dateKey, movies, onClose, onSelect }: Props) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <MySheet
      visible={dateKey !== null && movies.length > 0}
      onClose={onClose}
      title={dateKey ? formatDayLabel(dateKey) : ""}
    >
      <View style={styles.list}>
        {movies.map((movie, i) => (
          <Pressable
            key={movie.id}
            onPress={() => onSelect(movie)}
            style={({ pressed }) => [
              styles.item,
              i < movies.length - 1 && styles.itemBorder,
              pressed && { opacity: 0.7 },
            ]}
          >
            {movie.posterPath ? (
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w200${movie.posterPath}` }}
                style={styles.poster}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.poster, styles.posterFallback]}>
                <Text style={styles.emoji}>{getEmoji(movie.id)}</Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={2}>{movie.title}</Text>
              {(movie.director || movie.year) ? (
                <Text style={styles.meta} numberOfLines={1}>
                  {[movie.director, movie.year].filter(Boolean).join(" · ")}
                </Text>
              ) : null}
              {movie.rating != null ? (
                <Text style={styles.rating}>{"★".repeat(movie.rating)}</Text>
              ) : null}
            </View>
          </Pressable>
        ))}
      </View>
    </MySheet>
  );
}

function makeStyles(c: Colors) {
  return StyleSheet.create({
    list: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      overflow: "hidden",
      marginBottom: spacing.md,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.md,
    },
    itemBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    poster: {
      width: 48,
      height: 72,
      borderRadius: radius.sm,
    },
    posterFallback: {
      backgroundColor: c.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    emoji: { fontSize: 24 },
    info: {
      flex: 1,
      gap: 4,
    },
    title: {
      ...typography.bodyLarge,
      color: c.text,
    },
    meta: {
      ...typography.caption,
      color: c.textSecondary,
    },
    rating: {
      fontSize: 12,
      color: c.primary,
      letterSpacing: 1,
    },
  });
}
