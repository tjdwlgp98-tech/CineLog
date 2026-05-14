import { MovieDetailSheet } from "../../components/MovieDetailSheet";
import { Colors, useColors, radius, spacing, typography } from "../../constants/theme";
import type { Movie } from "../../store/movies";
import { useMoviesStore } from "../../store/movies";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function ArchiveScreen() {
  const movies = useMoviesStore((s) => s.movies);
  const [selected, setSelected] = useState<Movie | null>(null);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const archived = useMemo(
    () =>
      [...movies]
        .filter((m) => m.archived)
        .sort(
          (a, b) =>
            new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime(),
        ),
    [movies],
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={archived}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nothing archived. Open a film and choose "Move to archive".
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelected(item)}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>{formatDate(item.watchedAt)}</Text>
          </Pressable>
        )}
      />
      <MovieDetailSheet movie={selected} onClose={() => setSelected(null)} />
    </View>
  );
}

function makeStyles(c: Colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: c.background,
    },
    list: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
      flexGrow: 1,
    },
    empty: {
      ...typography.body,
      color: c.textSecondary,
      textAlign: "center",
      marginTop: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    cardPressed: {
      opacity: 0.9,
    },
    cardTitle: {
      ...typography.subtitle,
      color: c.text,
      marginBottom: spacing.xs,
    },
    cardMeta: {
      ...typography.caption,
      color: c.textSecondary,
    },
  });
}
