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

export const typography = {
  title: { fontSize: 22, fontWeight: "700" as const },
  subtitle: { fontSize: 17, fontWeight: "600" as const },
  body: { fontSize: 16, fontWeight: "400" as const },
  caption: { fontSize: 13, fontWeight: "400" as const },
} as const;
