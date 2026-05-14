import { Platform, useColorScheme } from "react-native";

// ─── Primitive palette ────────────────────────────────────────────────────────

const palette = {
  // Yellow / Amber scale
  yellow100: "#FEF3C7",
  yellow300: "#FCD34D",
  yellow400: "#F5C518", // brand yellow
  yellow500: "#D97706",
  yellow600: "#B45309",
  yellowSubtle: "#1C1810", // dark-mode tint background

  // Neutral scale
  neutral50: "#FAFAFA",
  neutral100: "#F4F4F5",
  neutral200: "#E4E4E7",
  neutral400: "#A1A1AA",
  neutral500: "#71717A",
  neutral600: "#52525B",
  neutral800: "#27272A",
  neutral850: "#1E1E26",
  neutral900: "#16161C",
  neutral950: "#0C0C0F",

  // Status
  red500: "#EF4444",
  red600: "#DC2626",
  redDark: "#2D1414",
  redLight: "#FEF2F2",
  green500: "#22C55E",
  green600: "#16A34A",
  greenDark: "#0F2318",
  greenLight: "#F0FDF4",
} as const;

// ─── Color type ───────────────────────────────────────────────────────────────

export interface Colors {
  // Surfaces
  background: string;
  surface: string;
  surfaceElevated: string;
  // Borders
  border: string;
  borderSubtle: string;
  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  // Primary (yellow key color)
  primary: string;
  primaryText: string;
  primaryMuted: string;
  primarySubtle: string;
  primaryFg: string;
  // Status
  danger: string;
  dangerSubtle: string;
  success: string;
  successSubtle: string;
}

// ─── Semantic tokens ──────────────────────────────────────────────────────────

export const colorTokens: { dark: Colors; light: Colors } = {
  dark: {
    background: palette.neutral950,
    surface: palette.neutral900,
    surfaceElevated: palette.neutral850,

    border: palette.neutral800,
    borderSubtle: palette.neutral850,

    text: palette.neutral50,
    textSecondary: palette.neutral400,
    textTertiary: palette.neutral500,

    primary: palette.yellow400,
    primaryText: palette.yellow400,
    primaryMuted: palette.yellow500,
    primarySubtle: palette.yellowSubtle,
    primaryFg: palette.neutral950,

    danger: palette.red500,
    dangerSubtle: palette.redDark,
    success: palette.green500,
    successSubtle: palette.greenDark,
  },
  light: {
    background: "#FFFFFF",
    surface: "#F8F8F8",
    surfaceElevated: "#EEEEEE",

    border: palette.neutral200,
    borderSubtle: palette.neutral100,

    text: "#09090B",
    textSecondary: palette.neutral600,
    textTertiary: palette.neutral400,

    primary: palette.yellow400,
    primaryText: palette.yellow600,
    primaryMuted: palette.yellow500,
    primarySubtle: palette.yellow100,
    primaryFg: "#09090B",

    danger: palette.red600,
    dangerSubtle: palette.redLight,
    success: palette.green600,
    successSubtle: palette.greenLight,
  },
};

export function useColors(): Colors {
  const scheme = useColorScheme() ?? "dark";
  return colorTokens[scheme];
}

// ─── Other tokens ─────────────────────────────────────────────────────────────

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
