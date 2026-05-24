import { MovieDetailSheet } from "../../components/MovieDetailSheet";
import { AddMovieSheet } from "../../components/AddMovieSheet";
import { Colors, useColors, radius, spacing, typography } from "../../constants/theme";
import type { Movie } from "../../store/movies";
import { useMoviesStore } from "../../store/movies";
import { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLS = 3;
const CARD_GAP = 10;
const CARD_W = (SCREEN_WIDTH - spacing.md * 2 - CARD_GAP * (NUM_COLS - 1)) / NUM_COLS;
const CARD_H = CARD_W * 1.5;

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

const RATING_FILTERS = [
  { label: "전체", value: null },
  { label: "★ 5점", value: 5 },
  { label: "★ 4점", value: 4 },
  { label: "★ 3점", value: 3 },
];

function getYearFilters(movies: Movie[]) {
  const years = Array.from(new Set(movies.map((m) => new Date(m.watchedAt).getFullYear())))
    .sort((a, b) => b - a);
  return years.map((y) => ({ label: `${y}년`, value: y }));
}

export default function ArchiveScreen() {
  const movies = useMoviesStore((s) => s.movies);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editMovieId, setEditMovieId] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const selected = useMemo(() => movies.find((m) => m.id === selectedId) ?? null, [movies, selectedId]);
  const editMovie = useMemo(() => movies.find((m) => m.id === editMovieId) ?? null, [movies, editMovieId]);

  const stats = useMemo(() => {
    const total = movies.length;
    const rated = movies.filter((m) => m.rating != null);
    const avgRating =
      rated.length > 0
        ? (rated.reduce((s, m) => s + (m.rating ?? 0), 0) / rated.length).toFixed(1)
        : "-";
    const now = new Date();
    const thisMonth = movies.filter((m) => {
      const [y, mo] = m.watchedAt.slice(0, 7).split("-").map(Number);
      return y === now.getFullYear() && mo === now.getMonth() + 1;
    }).length;
    return { total, avgRating, thisMonth };
  }, [movies]);

  const yearFilters = useMemo(() => getYearFilters(movies), [movies]);

  const filtered = useMemo(() => {
    return [...movies]
      .filter((m) => {
        if (ratingFilter !== null && m.rating !== ratingFilter) return false;
        if (yearFilter !== null && new Date(m.watchedAt).getFullYear() !== yearFilter) return false;
        return true;
      })
      .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime());
  }, [movies, ratingFilter, yearFilter]);

  const allFilters = [
    ...RATING_FILTERS,
    ...yearFilters,
  ];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* 통계 카드 */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>총 편수</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.avgRating}</Text>
          <Text style={styles.statLabel}>평균 평점</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.thisMonth}</Text>
          <Text style={styles.statLabel}>이달 기록</Text>
        </View>
      </View>

      {/* 필터 칩 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {allFilters.map((f) => {
          const isActive =
            f.value === null
              ? ratingFilter === null && yearFilter === null
              : typeof f.value === "number" && f.value >= 3 && f.value <= 5
              ? ratingFilter === f.value
              : yearFilter === f.value;

          return (
            <Pressable
              key={f.label}
              onPress={() => {
                if (f.value === null) {
                  setRatingFilter(null);
                  setYearFilter(null);
                } else if (typeof f.value === "number" && f.value >= 3 && f.value <= 5) {
                  setRatingFilter(isActive ? null : f.value);
                } else {
                  setYearFilter(isActive ? null : (f.value as number));
                }
              }}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 영화 그리드 */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLS}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <Text style={styles.empty}>아직 기록된 영화가 없어요.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedId(item.id)}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
          >
            {/* 포스터 / 이모지 */}
            <View style={styles.poster}>
              {item.posterPath ? (
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w200${item.posterPath}` }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.emoji}>{getEmoji(item.id)}</Text>
              )}
              {/* 별점 뱃지 */}
              {item.rating != null && (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>{"★".repeat(item.rating)}</Text>
                </View>
              )}
            </View>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          </Pressable>
        )}
      />

      <MovieDetailSheet
        movie={selected}
        onClose={() => setSelectedId(null)}
        onEdit={() => {
          setEditMovieId(selectedId);
          setSelectedId(null);
        }}
      />
      {editMovie !== null && (
        <AddMovieSheet
          key={`edit-${editMovie.id}`}
          visible
          editingMovie={editMovie}
          onClose={() => setEditMovieId(null)}
        />
      )}
    </View>
  );
}

function makeStyles(c: Colors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },

    statsRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    statCard: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      alignItems: "center",
    },
    statValue: {
      fontSize: 24,
      fontWeight: "700",
      color: c.primary,
      lineHeight: 30,
    },
    statLabel: {
      ...typography.caption,
      color: c.textSecondary,
      marginTop: 2,
    },

    filterScroll: {
      flexGrow: 0,
    },
    filterRow: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      gap: spacing.xs,
      alignItems: "center",
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: radius.full,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignSelf: "flex-start",
    },
    chipActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    chipText: { ...typography.body, color: c.text },
    chipTextActive: { color: c.primaryFg, fontWeight: "600" },

    grid: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xl,
    },
    row: {
      gap: CARD_GAP,
      marginBottom: CARD_GAP,
    },

    card: {
      width: CARD_W,
    },
    poster: {
      width: CARD_W,
      height: CARD_H,
      borderRadius: radius.md,
      backgroundColor: c.surface,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    emoji: { fontSize: 40 },
    ratingBadge: {
      position: "absolute",
      bottom: 6,
      right: 6,
      backgroundColor: "rgba(0,0,0,0.75)",
      borderRadius: radius.sm,
      paddingHorizontal: 5,
      paddingVertical: 2,
    },
    ratingText: { fontSize: 9, color: "#FFD700", letterSpacing: 1 },

    title: { ...typography.caption, color: c.text, textAlign: "center" },

    empty: {
      ...typography.body,
      color: c.textSecondary,
      textAlign: "center",
      marginTop: spacing.xl,
    },
  });
}
