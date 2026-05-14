import { Platform } from "react-native";

export const colors = {
  background: "#0c0c0f",
  surface: "#16161c",
  surfaceElevated: "#1e1e26",
  border: "#2a2a34",
  text: "#f4f4f5",
  textMuted: "#a1a1aa",
  accent: "#e8b84a",
  accentMuted: "#c49a32",
  danger: "#ef4444",
  success: "#22c55e",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

// iOS: Apple SD Gothic Neo (system font, no file embedding needed)
// Android: system sans-serif fallback
export const fonts = {
  light: Platform.select({
    ios: "AppleSDGothicNeo-Light",
    android: "sans-serif-light",
    default: "System",
  }) as string,
  regular: Platform.select({
    ios: "AppleSDGothicNeo-Regular",
    android: "sans-serif",
    default: "System",
  }) as string,
  medium: Platform.select({
    ios: "AppleSDGothicNeo-Medium",
    android: "sans-serif-medium",
    default: "System",
  }) as string,
  semiBold: Platform.select({
    ios: "AppleSDGothicNeo-SemiBold",
    android: "sans-serif-medium",
    default: "System",
  }) as string,
  bold: Platform.select({
    ios: "AppleSDGothicNeo-Bold",
    android: "sans-serif",
    default: "System",
  }) as string,
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
} as const;

export const lineHeights = {
  xs: 16,
  sm: 18,
  md: 22,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 38,
} as const;

export const typography = {
  displayLarge: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxxl,
    lineHeight: lineHeights.xxxl,
    fontWeight: "700" as const,
  },
  display: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxl,
    lineHeight: lineHeights.xxl,
    fontWeight: "700" as const,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl,
    fontWeight: "700" as const,
  },
  subtitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: "600" as const,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: "600" as const,
  },
  bodyMedium: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    fontWeight: "500" as const,
  },
  bodyLarge: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    fontWeight: "400" as const,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: "400" as const,
  },
  caption: {
    fontFamily: fonts.light,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: "300" as const,
  },
} as const;
