import { useColorScheme } from "react-native";

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
  neutral50:  "#FAFAFA",
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
  red500:     "#EF4444",
  red600:     "#DC2626",
  redDark:    "#2D1414",
  redLight:   "#FEF2F2",
  green500:   "#22C55E",
  green600:   "#16A34A",
  greenDark:  "#0F2318",
  greenLight: "#F0FDF4",
} as const;

// ─── Color type ───────────────────────────────────────────────────────────────

export interface Colors {
  // Surfaces
  background:      string;
  surface:         string;
  surfaceElevated: string;
  // Borders
  border:       string;
  borderSubtle: string;
  // Text
  text:          string;
  textSecondary: string;
  textTertiary:  string;
  // Primary (yellow key color)
  primary:       string; // fill / background
  primaryText:   string; // text / icon — contrast-safe per mode
  primaryMuted:  string; // secondary accent
  primarySubtle: string; // very subtle tint bg
  primaryFg:     string; // text placed on top of primary fill
  // Status
  danger:        string;
  dangerSubtle:  string;
  success:       string;
  successSubtle: string;
}

// ─── Semantic tokens ──────────────────────────────────────────────────────────

export const colorTokens: { dark: Colors; light: Colors } = {
  dark: {
    background:      palette.neutral950,
    surface:         palette.neutral900,
    surfaceElevated: palette.neutral850,

    border:       palette.neutral800,
    borderSubtle: palette.neutral850,

    text:          palette.neutral50,
    textSecondary: palette.neutral400,
    textTertiary:  palette.neutral500,

    primary:       palette.yellow400,
    primaryText:   palette.yellow400, // bright yellow readable on dark
    primaryMuted:  palette.yellow500,
    primarySubtle: palette.yellowSubtle,
    primaryFg:     palette.neutral950,

    danger:        palette.red500,
    dangerSubtle:  palette.redDark,
    success:       palette.green500,
    successSubtle: palette.greenDark,
  },
  light: {
    background:      "#FFFFFF",
    surface:         "#F8F8F8",
    surfaceElevated: "#EEEEEE",

    border:       palette.neutral200,
    borderSubtle: palette.neutral100,

    text:          "#09090B",
    textSecondary: palette.neutral600,
    textTertiary:  palette.neutral400,

    primary:       palette.yellow400,  // fill stays bright yellow
    primaryText:   palette.yellow600,  // #B45309 — WCAG AA on white (4.6:1 contrast)
    primaryMuted:  palette.yellow500,
    primarySubtle: palette.yellow100,
    primaryFg:     "#09090B",

    danger:        palette.red600,
    dangerSubtle:  palette.redLight,
    success:       palette.green600,
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

export const typography = {
  title:    { fontSize: 22, fontWeight: "700" as const },
  subtitle: { fontSize: 17, fontWeight: "600" as const },
  body:     { fontSize: 16, fontWeight: "400" as const },
  caption:  { fontSize: 13, fontWeight: "400" as const },
} as const;
