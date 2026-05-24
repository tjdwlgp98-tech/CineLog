import { Colors, useColors, radius, spacing, typography } from "../constants/theme";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth";
import { useMoviesStore } from "../store/movies";
import { useMemo } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function MyProfileSheet({ visible, onClose }: Props) {
  const movies = useMoviesStore((s) => s.movies);
  const session = useAuthStore((s) => s.session);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const userName = session?.user.user_metadata?.full_name
    ?? session?.user.email
    ?? "My filmlog";
  const userInitial = userName.charAt(0).toUpperCase();

  const stats = useMemo(() => {
    const total = movies.length;
    const rated = movies.filter((m) => m.rating != null);
    const avgRating =
      rated.length > 0
        ? (rated.reduce((s, m) => s + (m.rating ?? 0), 0) / rated.length).toFixed(1)
        : "-";
    const now = new Date();
    const thisMonth = movies.filter((m) => {
      const d = new Date(m.watchedAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    return { total, avgRating, thisMonth };
  }, [movies]);

  function handleSignOut() {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          onClose();
          await supabase.auth.signOut();
        },
      },
    ]);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <View style={styles.handle} />

          {/* 프로필 */}
          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
              <Text style={styles.userSub} numberOfLines={1}>
                {session?.user.email ?? "영화를 기록 중"}
              </Text>
            </View>
          </View>

          {/* 통계 */}
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

          {/* 로그아웃 */}
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.signOutText}>로그아웃</Text>
          </Pressable>
        </View>
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
      marginBottom: spacing.lg,
    },

    profile: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 22,
      fontWeight: "700",
      color: c.primaryFg,
    },
    userName: {
      ...typography.subtitle,
      color: c.text,
    },
    userSub: {
      ...typography.caption,
      color: c.textSecondary,
      marginTop: 2,
    },

    statsRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.lg,
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

    signOutBtn: {
      borderWidth: 1,
      borderColor: c.danger,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      alignItems: "center",
    },
    signOutText: {
      ...typography.bodyLarge,
      color: c.danger,
      fontWeight: "600",
    },
  });
}
