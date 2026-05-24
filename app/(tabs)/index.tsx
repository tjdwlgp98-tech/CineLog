import { AddMovieSheet } from "../../components/AddMovieSheet";
import { DayMoviesSheet } from "../../components/DayMoviesSheet";
import { MovieDetailSheet } from "../../components/MovieDetailSheet";
import { Colors, useColors, radius, spacing, typography } from "../../constants/theme";
import type { Movie } from "../../store/movies";
import { useMoviesStore } from "../../store/movies";
import { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const SCREEN_WIDTH = Dimensions.get("window").width;
const CELL_W = Math.floor(SCREEN_WIDTH / 7);
const CELL_H = 92;

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

type Cell = { day: number; isCurrentMonth: boolean; dateKey: string | null };

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function getDaysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

function formatMonthTitle(y: number, m: number): string {
  return new Date(y, m, 1).toLocaleDateString("ko-KR", { year: "numeric", month: "long" });
}

function getTodayKey(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

export default function LogScreen() {
  const movies = useMoviesStore((s) => s.movies);
  const [detailMovieId, setDetailMovieId] = useState<string | null>(null);
  const [editMovieId, setEditMovieId] = useState<string | null>(null);
  const [addDate, setAddDate] = useState<Date | null>(null);
  const [dayMoviesKey, setDayMoviesKey] = useState<string | null>(null);

  const detailMovie = useMemo(
    () => movies.find((m) => m.id === detailMovieId) ?? null,
    [movies, detailMovieId]
  );
  const editMovie = useMemo(
    () => movies.find((m) => m.id === editMovieId) ?? null,
    [movies, editMovieId]
  );
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const active = useMemo(() => movies, [movies]);

  const moviesByDate = useMemo(() => {
    const map: Record<string, Movie[]> = {};
    for (const m of active) {
      const key = toDateKey(m.watchedAt);
      if (!map[key]) map[key] = [];
      map[key].push(m);
    }
    return map;
  }, [active]);

  const dayMoviesList = useMemo(
    () => (dayMoviesKey ? (moviesByDate[dayMoviesKey] ?? []) : []),
    [moviesByDate, dayMoviesKey]
  );

  const todayKey = getTodayKey();

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  const rows = useMemo((): Cell[][] => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = getDaysInMonth(year, month);
    const prevDays = getDaysInMonth(year, month === 0 ? 11 : month - 1);
    const cells: Cell[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: prevDays - firstDay + 1 + i, isCurrentMonth: false, dateKey: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const k = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, isCurrentMonth: true, dateKey: k });
    }
    let next = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ day: next++, isCurrentMonth: false, dateKey: null });
    }

    const result: Cell[][] = [];
    for (let i = 0; i < cells.length; i += 7) result.push(cells.slice(i, i + 7));
    return result;
  }, [year, month]);

  return (
    <View style={styles.screen}>
      {/* 커스텀 헤더 */}
      <View style={[styles.customHeader, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.logo}>
          <Text style={styles.logoFilm}>Cine</Text>
          <Text style={styles.logoLog}>log</Text>
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 월 네비게이션 */}
        <View style={styles.header}>
          <Pressable onPress={prevMonth} style={styles.navBtn}>
            <Text style={styles.navArrow}>‹</Text>
          </Pressable>
          <Text style={styles.monthTitle}>{formatMonthTitle(year, month)}</Text>
          <Pressable onPress={nextMonth} style={styles.navBtn}>
            <Text style={styles.navArrow}>›</Text>
          </Pressable>
        </View>

        {/* 요일 헤더 */}
        <View style={styles.weekRow}>
          {WEEK_DAYS.map((d, i) => (
            <Text
              key={d}
              style={[
                styles.dayLabel,
                i === 0 && { color: colors.danger },
                i === 6 && { color: "#4A9EFF" },
              ]}
            >
              {d}
            </Text>
          ))}
        </View>

        {/* 캘린더 그리드 */}
        {rows.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((cell, ci) => {
              const dayMovies = cell.dateKey ? (moviesByDate[cell.dateKey] ?? []) : [];
              const isToday = cell.dateKey === todayKey;
              const primary = dayMovies[0] ?? null;
              const extra = dayMovies.length - 1;

              const hasMultiple = dayMovies.length >= 2;

              return (
                <Pressable
                  key={ci}
                  style={styles.cell}
                  onPress={() => {
                    if (!cell.isCurrentMonth || !cell.dateKey) return;
                    if (hasMultiple) {
                      setDayMoviesKey(cell.dateKey);
                    } else if (dayMovies.length === 0) {
                      const [y, mo, d] = cell.dateKey.split("-").map(Number);
                      setAddDate(new Date(y, mo - 1, d));
                    }
                  }}
                >
                  {cell.isCurrentMonth && (
                    <>
                      <View style={styles.dateRow}>
                        <View style={[styles.dateBadge, isToday && { backgroundColor: colors.primary }]}>
                          <Text
                            style={[
                              styles.dateNum,
                              ci === 0 && { color: colors.danger },
                              ci === 6 && { color: "#4A9EFF" },
                              isToday && { color: colors.primaryFg, fontWeight: "700" },
                            ]}
                          >
                            {cell.day}
                          </Text>
                        </View>
                        {hasMultiple && (
                          <View style={styles.extraBadge}>
                            <Text style={styles.extraCount}>{dayMovies.length}</Text>
                          </View>
                        )}
                      </View>

                      {primary && (
                        <Pressable
                          onPress={() => {
                            if (hasMultiple) {
                              setDayMoviesKey(cell.dateKey);
                            } else {
                              setDetailMovieId(primary.id);
                            }
                          }}
                          style={({ pressed }) => [styles.movieCard, pressed && { opacity: 0.75 }]}
                        >
                          {primary.posterPath ? (
                            <Image
                              source={{ uri: `https://image.tmdb.org/t/p/w200${primary.posterPath}` }}
                              style={styles.moviePoster}
                              resizeMode="cover"
                            />
                          ) : (
                            <Text style={styles.movieEmoji}>{getEmoji(primary.id)}</Text>
                          )}
                        </Pressable>
                      )}
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
      <DayMoviesSheet
        dateKey={dayMoviesKey}
        movies={dayMoviesList}
        onClose={() => setDayMoviesKey(null)}
        onSelect={(movie) => {
          setDayMoviesKey(null);
          setDetailMovieId(movie.id);
        }}
        onAdd={() => {
          const key = dayMoviesKey;
          setDayMoviesKey(null);
          if (key) {
            const [y, mo, d] = key.split("-").map(Number);
            setAddDate(new Date(y, mo - 1, d));
          }
        }}
      />
      <MovieDetailSheet
        movie={detailMovie}
        onClose={() => setDetailMovieId(null)}
        onEdit={() => {
          setEditMovieId(detailMovieId);
          setDetailMovieId(null);
        }}
      />
      {addDate !== null && (
        <AddMovieSheet
          key={addDate.toISOString()}
          visible
          initialDate={addDate}
          onClose={() => setAddDate(null)}
        />
      )}
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
    scroll: { paddingBottom: spacing.xl },

    customHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
      backgroundColor: c.background,
    },
    logo: {
      fontSize: 22,
      fontWeight: "700",
      letterSpacing: -0.5,
    },
    logoFilm: {
      color: c.text,
    },
    logoLog: {
      color: c.primary,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
    },
    navBtn: { padding: spacing.xs },
    navArrow: { fontSize: 28, color: c.text, fontWeight: "200", lineHeight: 32 },
    monthTitle: { ...typography.subtitle, color: c.text },

    weekRow: {
      flexDirection: "row",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    dayLabel: {
      width: CELL_W,
      textAlign: "center",
      ...typography.caption,
      color: c.textTertiary,
      paddingVertical: 6,
    },

    row: {
      flexDirection: "row",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    cell: {
      width: CELL_W,
      minHeight: CELL_H,
      padding: 4,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: c.border,
    },

    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 3,
    },
    dateBadge: {
      width: 20,
      height: 20,
      borderRadius: radius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    dateNum: {
      fontSize: 11,
      fontWeight: "500",
      color: c.text,
      lineHeight: 14,
    },
    dateNumFaded: {
      color: c.textTertiary,
    },
    extraBadge: {
      marginLeft: 2,
      backgroundColor: c.primary + "33",
      borderRadius: radius.sm,
      paddingHorizontal: 3,
      paddingVertical: 1,
    },
    extraCount: {
      fontSize: 8,
      fontWeight: "700",
      color: c.primary,
    },

    movieCard: {
      borderRadius: radius.sm,
      overflow: "hidden",
      flex: 1,
    },
    moviePoster: {
      width: "100%",
      height: "100%",
      borderRadius: radius.sm,
    },
    movieEmoji: {
      fontSize: 24,
      lineHeight: 30,
      textAlign: "center",
      flex: 1,
      paddingTop: 10,
    },
  });
}
