import { Colors, useColors, radius, spacing, typography } from "../../constants/theme";
import { useMoviesStore } from "../../store/movies";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const TMDB_KEY = "9542e21c6213b7848d7dc82bdb3e1c78";
const TMDB_BASE = "https://api.themoviedb.org/3";

type TmdbResult = {
  id: number;
  title: string;
  release_date?: string;
  overview?: string;
  poster_path?: string | null;
};

async function searchTmdb(query: string): Promise<TmdbResult[]> {
  const url =
    `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}` +
    `&query=${encodeURIComponent(query)}&language=ko-KR&include_adult=false&page=1`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? []).slice(0, 7);
}

async function fetchDirector(movieId: number): Promise<string> {
  const url = `${TMDB_BASE}/movie/${movieId}/credits?api_key=${TMDB_KEY}&language=ko-KR`;
  const res = await fetch(url);
  if (!res.ok) return "";
  const data = await res.json();
  const dir = (data.crew ?? []).find(
    (c: { job: string; name: string }) => c.job === "Director",
  );
  return dir?.name ?? "";
}


export default function AddScreen() {
  const router = useRouter();
  const addMovie = useMoviesStore((s) => s.addMovie);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [title, setTitle] = useState("");
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipSearchRef = useRef(false);
  const [confirmed, setConfirmed] = useState(false);

  const [director, setDirector] = useState("");
  const [year, setYear] = useState("");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [watchedAt, setWatchedAt] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [posterPath, setPosterPath] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (skipSearchRef.current) { skipSearchRef.current = false; return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!title.trim()) {
      setResults([]);
      setSearching(false);
      setNoResults(false);
      return;
    }
    setSearching(true);
    setNoResults(false);
    debounceRef.current = setTimeout(async () => {
      const res = await searchTmdb(title);
      setResults(res);
      setNoResults(res.length === 0);
      setSearching(false);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title]);

  async function selectMovie(movie: TmdbResult) {
    skipSearchRef.current = true;
    setTitle(movie.title);
    setResults([]);
    setNoResults(false);
    setYear(movie.release_date?.slice(0, 4) ?? "");
    setPosterPath(movie.poster_path ?? undefined);
    setDirector("");
    setConfirmed(true);
    const dir = await fetchDirector(movie.id);
    setDirector(dir);
  }

  function resetSearch() {
    setConfirmed(false);
    setTitle("");
    setPosterPath(undefined);
    setDirector("");
    setYear("");
    setResults([]);
    setNoResults(false);
  }

  function resetForm() {
    setTitle("");
    setDirector("");
    setYear("");
    setRating(0);
    setNotes("");
    setWatchedAt(new Date());
    setTempDate(new Date());
    setShowDatePicker(false);
    setPosterPath(undefined);
    setConfirmed(false);
  }

  const submit = () => {
    const t = title.trim();
    if (!t) return;
    const y = year.trim() ? parseInt(year.trim(), 10) : undefined;
    addMovie({
      title: t,
      director: director.trim() || undefined,
      year: Number.isFinite(y) ? y : undefined,
      rating: rating > 0 ? rating : undefined,
      notes: notes.trim() || undefined,
      watchedAt: watchedAt.toISOString(),
      posterPath,
    });
    resetForm();
    router.push("/");
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.form}
      >
        {/* ── 검색 모드 ─────────────────────────── */}
        {!confirmed ? (
          <>
            <Text style={styles.label}>제목</Text>
            <View style={styles.searchRow}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="영화 제목 입력 또는 검색…"
                placeholderTextColor={colors.textTertiary}
                style={[styles.input, { flex: 1 }]}
                returnKeyType="search"
                autoCorrect={false}
                autoFocus
              />
              {searching && (
                <ActivityIndicator
                  color={colors.primary}
                  size="small"
                  style={styles.spinner}
                />
              )}
            </View>

            {results.length > 0 && (
              <View style={styles.dropdown}>
                {results.map((m, idx) => (
                  <Pressable
                    key={m.id}
                    onPress={() => selectMovie(m)}
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      idx < results.length - 1 && styles.dropdownItemBorder,
                      pressed && { backgroundColor: colors.surfaceElevated },
                    ]}
                  >
                    {m.poster_path ? (
                      <Image
                        source={{ uri: `https://image.tmdb.org/t/p/w200${m.poster_path}` }}
                        style={styles.poster}
                      />
                    ) : (
                      <View style={[styles.poster, styles.posterFallback]}>
                        <Text style={styles.posterFallbackText}>🎬</Text>
                      </View>
                    )}
                    <View style={styles.dropdownInfo}>
                      <Text style={styles.dropdownTitle} numberOfLines={1}>
                        {m.title}
                      </Text>
                      {m.release_date ? (
                        <Text style={styles.dropdownYear}>
                          {m.release_date.slice(0, 4)}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {noResults && title.trim().length > 0 && (
              <View style={styles.noResultsBox}>
                <Text style={styles.noResults}>검색 결과가 없어요.</Text>
                <Pressable
                  onPress={() => setConfirmed(true)}
                  style={({ pressed }) => [styles.registerBtn, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.registerBtnText}>"{title}" 직접 등록하기</Text>
                </Pressable>
              </View>
            )}
          </>
        ) : (
          /* ── 선택 완료 모드 ───────────────────── */
          <View style={styles.confirmedCard}>
            {posterPath ? (
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w342${posterPath}` }}
                style={styles.confirmedPoster}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.confirmedPoster, styles.confirmedPosterFallback]}>
                <Text style={{ fontSize: 36 }}>🎬</Text>
              </View>
            )}
            <View style={styles.confirmedInfo}>
              <Text style={styles.confirmedTitle} numberOfLines={2}>{title}</Text>
              {(director || year) ? (
                <Text style={styles.movieMeta}>{[director, year].filter(Boolean).join(" · ")}</Text>
              ) : null}
              <Pressable
                onPress={resetSearch}
                style={({ pressed }) => [styles.changeBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.changeBtnText}>영화 바꾸기</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── 별점 ──────────────────────────────── */}
        <Text style={styles.label}>별점</Text>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Pressable
              key={s}
              onPress={() => setRating(rating === s ? 0 : s)}
              style={styles.starBtn}
            >
              <Text style={[styles.star, s <= rating && styles.starFilled]}>★</Text>
            </Pressable>
          ))}
        </View>

        {/* ── 관람일 ─────────────────────────────── */}
        <Text style={styles.label}>관람일</Text>
        <Pressable
          onPress={() => { setTempDate(watchedAt); setShowDatePicker(true); }}
          style={({ pressed }) => [styles.dateBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.dateBtnText}>
            {watchedAt.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}
          </Text>
          <Text style={styles.dateBtnChevron}>›</Text>
        </Pressable>

        <Modal visible={showDatePicker} transparent animationType="slide">
          <Pressable style={styles.modalBackdrop} onPress={() => setShowDatePicker(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalToolbar}>
              <Pressable onPress={() => setShowDatePicker(false)}>
                <Text style={styles.modalCancel}>취소</Text>
              </Pressable>
              <Text style={styles.modalTitle}>관람일</Text>
              <Pressable onPress={() => { setWatchedAt(tempDate); setShowDatePicker(false); }}>
                <Text style={styles.modalDone}>완료</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              locale="ko-KR"
              maximumDate={new Date()}
              onChange={(_, date) => { if (date) setTempDate(date); }}
              style={styles.spinner}
            />
          </View>
        </Modal>

        {/* ── 한줄평 ─────────────────────────────── */}
        <Text style={styles.label}>한줄평 (선택)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="한 줄로 남기는 감상…"
          placeholderTextColor={colors.textTertiary}
          returnKeyType="done"
          style={styles.input}
        />

        <Pressable
          onPress={submit}
          style={({ pressed }) => [
            styles.submit,
            !title.trim() && styles.submitDisabled,
            pressed && title.trim() && styles.submitPressed,
          ]}
          disabled={!title.trim()}
        >
          <Text style={styles.submitText}>기록 저장</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(c: Colors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    form: { padding: spacing.md, paddingBottom: spacing.xl },

    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    spinner: { width: 20 },

    dropdown: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      marginTop: spacing.xs,
      overflow: "hidden",
    },
    dropdownItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
    },
    dropdownItemBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    poster: {
      width: 36,
      height: 54,
      borderRadius: radius.sm,
      marginRight: spacing.sm,
    },
    posterFallback: {
      backgroundColor: c.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    posterFallbackText: {
      fontSize: 18,
    },
    dropdownInfo: {
      flex: 1,
    },
    dropdownTitle: {
      ...typography.bodyLarge,
      color: c.text,
    },
    dropdownYear: {
      ...typography.body,
      color: c.textSecondary,
      marginTop: 2,
    },
    noResultsBox: {
      marginTop: spacing.sm,
      gap: spacing.sm,
    },
    noResults: {
      ...typography.body,
      color: c.textTertiary,
      paddingHorizontal: spacing.xs,
    },
    registerBtn: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      alignItems: "center",
    },
    registerBtnText: {
      ...typography.body,
      color: c.text,
    },

    confirmedCard: {
      flexDirection: "row",
      gap: spacing.md,
      marginTop: spacing.xs,
      marginBottom: spacing.sm,
    },
    confirmedPoster: {
      width: 90,
      height: 134,
      borderRadius: radius.md,
    },
    confirmedPosterFallback: {
      backgroundColor: c.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    confirmedInfo: {
      flex: 1,
      justifyContent: "center",
      gap: spacing.xs,
    },
    confirmedTitle: {
      ...typography.subtitle,
      color: c.text,
    },
    movieMeta: {
      ...typography.body,
      color: c.textSecondary,
    },
    changeBtn: {
      marginTop: spacing.xs,
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.sm,
      paddingVertical: 4,
      paddingHorizontal: spacing.sm,
    },
    changeBtnText: {
      ...typography.caption,
      color: c.textSecondary,
    },

    label: {
      ...typography.label,
      color: c.textSecondary,
      marginBottom: spacing.xs,
      marginTop: spacing.sm,
    },
    input: {
      ...typography.bodyLarge,
      color: c.text,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    dateBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    dateBtnText: {
      ...typography.bodyLarge,
      color: c.text,
    },
    dateBtnChevron: {
      fontSize: 18,
      color: c.textTertiary,
      fontWeight: "300",
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalSheet: {
      backgroundColor: c.surface,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingBottom: 34,
    },
    modalToolbar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    modalTitle: {
      ...typography.subtitle,
      color: c.text,
    },
    modalCancel: {
      ...typography.body,
      color: c.textSecondary,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    modalDone: {
      ...typography.body,
      color: c.primary,
      fontWeight: "600",
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    spinner: {
      width: "100%",
    },
    starRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    starBtn: { padding: 6 },
    star: { fontSize: 40, color: c.border },
    starFilled: { color: c.primary },

    submit: {
      marginTop: spacing.lg,
      backgroundColor: c.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      alignItems: "center",
    },
    submitDisabled: { opacity: 0.4 },
    submitPressed: { opacity: 0.85 },
    submitText: {
      ...typography.subtitle,
      color: c.primaryFg,
    },
  });
}
