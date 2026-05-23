import { Colors, useColors, radius, spacing, typography } from "../constants/theme";
import { useMoviesStore } from "../store/movies";
import { useMemo } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const USER_NAME = "My filmlog";
const USER_INITIAL = "F";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function MyProfileSheet({ visible, onClose }: Props) {
  const movies = useMoviesStore((s) => s.movies);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

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

  const menuItems = [
    { label: "나의 통계 보기" },
    { label: "SNS 연결하기" },
    { label: "설정" },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <View style={styles.handle} />

          {/* 프로필 */}
          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{USER_INITIAL}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{USER_NAME}</Text>
              <Text style={styles.userSub}>영화를 기록 중</Text>
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

          {/* 메뉴 */}
          <View style={styles.menu}>
            {menuItems.map((item, i) => (
              <View key={item.label}>
                {i > 0 && <View style={styles.divider} />}
                <Pressable
                  style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.6 }]}
                >
                  <View style={styles.menuIcon} />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </Pressable>
              </View>
            ))}
          </View>
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

    menu: {
      backgroundColor: c.surface,
      borderRadius: radius.md,
      overflow: "hidden",
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.border,
      marginHorizontal: spacing.md,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      gap: spacing.md,
    },
    menuIcon: {
      width: 18,
      height: 18,
      borderWidth: 1.5,
      borderColor: c.textSecondary,
      borderRadius: 3,
    },
    menuLabel: {
      ...typography.bodyLarge,
      color: c.text,
    },
  });
}
