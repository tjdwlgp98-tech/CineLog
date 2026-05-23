import { Colors, useColors, radius, spacing, typography } from "../constants/theme";
import { useMoviesStore } from "../store/movies";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

type Props = {
  visible: boolean;
  initialDate?: Date;
  onClose: () => void;
};

export function AddMovieSheet({ visible, initialDate, onClose }: Props) {
  const addMovie = useMoviesStore((s) => s.addMovie);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

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
  const [watchedAt, setWatchedAt] = useState(initialDate ?? new Date());
  const [tempDate, setTempDate] = useState(initialDate ?? new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [posterPath, setPosterPath] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (visible) {
      const d = initialDate ?? new Date();
      setWatchedAt(d);
      setTempDate(d);
    }
  }, [visible, initialDate]);

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
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
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
    const d = initialDate ?? new Date();
    setWatchedAt(d);
    setTempDate(d);
    setShowDatePicker(false);
    setPosterPath(undefined);
    setConfirmed(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function submit() {
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
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.sheetWrapper}
        >
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <View style={styles.handle} />

            {/* 헤더 */}
            <View style={styles.sheetHeader}>
              <Pressable onPress={handleClose} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>취소</Text>
              </Pressable>
              <Text style={styles.sheetTitle}>영화 추가</Text>
              <Pressable
                onPress={submit}
                disabled={!title.trim()}
                style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={[styles.saveText, !title.trim() && { opacity: 0.3 }]}>저장</Text>
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
              {/* 검색 / 선택 */}
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
                      <ActivityIndicator color={colors.primary} size="small" style={{ width: 20 }} />
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
                              <Text style={{ fontSize: 18 }}>🎬</Text>
                            </View>
                          )}
                          <View style={{ flex: 1 }}>
                            <Text style={styles.dropdownTitle} numberOfLines={1}>{m.title}</Text>
                            {m.release_date ? (
                              <Text style={styles.dropdownYear}>{m.release_date.slice(0, 4)}</Text>
                            ) : null}
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {noResults && title.trim().length > 0 && (
                    <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
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

              {/* 별점 */}
              <Text style={styles.label}>별점</Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Pressable key={s} onPress={() => setRating(rating === s ? 0 : s)} style={styles.starBtn}>
                    <Text style={[styles.star, s <= rating && styles.starFilled]}>★</Text>
                  </Pressable>
                ))}
              </View>

              {/* 관람일 */}
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
                    style={{ width: "100%" }}
                  />
                </View>
              </Modal>

              {/* 한줄평 */}
              <Text style={styles.label}>한줄평 (선택)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="한 줄로 남기는 감상…"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="done"
                style={styles.input}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function makeStyles(c: Colors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.55)",
    },
    sheetWrapper: {
      maxHeight: "90%",
    },
    sheet: {
      backgroundColor: c.surfaceElevated,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    handle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      marginBottom: spacing.sm,
    },
    sheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    sheetTitle: {
      ...typography.subtitle,
      color: c.text,
    },
    cancelBtn: { paddingVertical: spacing.xs, paddingHorizontal: spacing.xs },
    cancelText: { ...typography.body, color: c.textSecondary },
    saveBtn: { paddingVertical: spacing.xs, paddingHorizontal: spacing.xs },
    saveText: { ...typography.body, color: c.primary, fontWeight: "600" },

    form: { paddingBottom: spacing.lg },

    label: {
      ...typography.label,
      color: c.textSecondary,
      marginBottom: spacing.xs,
      marginTop: spacing.sm,
    },
    searchRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
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
    poster: { width: 36, height: 54, borderRadius: radius.sm, marginRight: spacing.sm },
    posterFallback: {
      backgroundColor: c.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    dropdownTitle: { ...typography.bodyLarge, color: c.text },
    dropdownYear: { ...typography.body, color: c.textSecondary, marginTop: 2 },
    noResults: { ...typography.body, color: c.textTertiary, paddingHorizontal: spacing.xs },
    registerBtn: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      alignItems: "center",
    },
    registerBtnText: { ...typography.body, color: c.text },

    confirmedCard: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xs, marginBottom: spacing.sm },
    confirmedPoster: { width: 90, height: 134, borderRadius: radius.md },
    confirmedPosterFallback: {
      backgroundColor: c.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    confirmedInfo: { flex: 1, justifyContent: "center", gap: spacing.xs },
    confirmedTitle: { ...typography.subtitle, color: c.text },
    movieMeta: { ...typography.body, color: c.textSecondary },
    changeBtn: {
      marginTop: spacing.xs,
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.sm,
      paddingVertical: 4,
      paddingHorizontal: spacing.sm,
    },
    changeBtnText: { ...typography.caption, color: c.textSecondary },

    starRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    starBtn: { padding: 6 },
    star: { fontSize: 40, color: c.border },
    starFilled: { color: c.primary },

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
    dateBtnText: { ...typography.bodyLarge, color: c.text },
    dateBtnChevron: { fontSize: 18, color: c.textTertiary, fontWeight: "300" },
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
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
    modalTitle: { ...typography.subtitle, color: c.text },
    modalCancel: { ...typography.body, color: c.textSecondary, paddingVertical: spacing.xs, paddingHorizontal: spacing.xs },
    modalDone: { ...typography.body, color: c.primary, fontWeight: "600", paddingVertical: spacing.xs, paddingHorizontal: spacing.xs },
  });
}
