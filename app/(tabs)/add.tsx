import { colors, radius, spacing, typography } from "../../constants/theme";
import { useMoviesStore } from "../../store/movies";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

function todayIsoDate(): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

export default function AddScreen() {
  const router = useRouter();
  const addMovie = useMoviesStore((s) => s.addMovie);
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [year, setYear] = useState("");
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");
  const [watchedAt, setWatchedAt] = useState(todayIsoDate());

  const submit = () => {
    const t = title.trim();
    if (!t) return;
    const y = year.trim() ? parseInt(year.trim(), 10) : undefined;
    const r = rating.trim() ? Math.min(5, Math.max(1, parseInt(rating.trim(), 10))) : undefined;
    addMovie({
      title: t,
      director: director.trim() || undefined,
      year: Number.isFinite(y) ? y : undefined,
      rating: Number.isFinite(r) ? r : undefined,
      notes: notes.trim() || undefined,
      watchedAt: watchedAt.trim() || todayIsoDate(),
    });
    setTitle("");
    setDirector("");
    setYear("");
    setRating("");
    setNotes("");
    setWatchedAt(todayIsoDate());
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
        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Film title"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <Text style={styles.label}>Director (optional)</Text>
        <TextInput
          value={director}
          onChangeText={setDirector}
          placeholder="Director"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <Text style={styles.label}>Year (optional)</Text>
        <TextInput
          value={year}
          onChangeText={setYear}
          placeholder="e.g. 2024"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          style={styles.input}
        />
        <Text style={styles.label}>Rating 1–5 (optional)</Text>
        <TextInput
          value={rating}
          onChangeText={setRating}
          placeholder="1 to 5"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          style={styles.input}
        />
        <Text style={styles.label}>Watched (ISO date)</Text>
        <TextInput
          value={watchedAt}
          onChangeText={setWatchedAt}
          placeholder={todayIsoDate()}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          style={styles.input}
        />
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Thoughts, venue, who with…"
          placeholderTextColor={colors.textMuted}
          multiline
          style={[styles.input, styles.inputMultiline]}
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
          <Text style={styles.submitText}>Save to log</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  form: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    ...typography.bodyLarge,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: spacing.sm,
  },
  submit: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  submitDisabled: {
    opacity: 0.45,
  },
  submitPressed: {
    opacity: 0.9,
  },
  submitText: {
    ...typography.subtitle,
    color: colors.background,
  },
});
