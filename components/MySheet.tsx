import { Colors, useColors, radius, spacing, typography } from "../constants/theme";
import { ReactNode, useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MySheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  rightAction?: ReactNode;
  children: ReactNode;
};

export function MySheet({ visible, onClose, title, rightAction, children }: MySheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const maxHeight = Math.min(height * 0.88, height - insets.top - spacing.md);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, spacing.md),
              maxHeight,
            },
          ]}
        >
          <View style={styles.handle} />
          {(title || rightAction) ? (
            <View style={styles.titleRow}>
              <Text style={[typography.subtitle, styles.titleText]}>{title ?? ""}</Text>
              {rightAction ?? null}
            </View>
          ) : null}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
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
      marginBottom: spacing.md,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    titleText: {
      color: c.text,
      flex: 1,
    },
  });
}
