import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useColors, spacing, typography, radius } from "../constants/theme";
import { supabase } from "../lib/supabase";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "../constants/theme";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    try {
      const redirectTo = AuthSession.makeRedirectUri({ scheme: "cinelog" });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error || !data.url) throw error;

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === "success") {
        const url = result.url;
        const params = new URLSearchParams(url.split("#")[1] ?? url.split("?")[1] ?? "");
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        }
      }
    } catch (e) {
      console.error("Google 로그인 오류:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <Text style={styles.logo}>
          <Text style={styles.logoFilm}>film</Text>
          <Text style={styles.logoLog}>log</Text>
        </Text>
        <Text style={styles.tagline}>내 영화 기록을 한 곳에</Text>
      </View>

      <View style={styles.bottom}>
        <Pressable
          onPress={signInWithGoogle}
          disabled={loading}
          style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.85 }]}
        >
          {loading ? (
            <ActivityIndicator color="#1F1F1F" />
          ) : (
            <>
              <Image
                source={{ uri: "https://www.google.com/favicon.ico" }}
                style={styles.googleIcon}
              />
              <Text style={styles.googleBtnText}>Google로 계속하기</Text>
            </>
          )}
        </Pressable>
        <Text style={styles.hint}>로그인하면 영화 기록이 클라우드에 저장됩니다</Text>
      </View>
    </View>
  );
}

function makeStyles(c: Colors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: c.background,
      justifyContent: "space-between",
      paddingHorizontal: spacing.xl,
      paddingVertical: 80,
    },
    top: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: spacing.sm,
    },
    logo: {
      fontSize: 52,
      fontWeight: "800",
      letterSpacing: -1.5,
    },
    logoFilm: {
      color: c.text,
    },
    logoLog: {
      color: c.primary,
    },
    tagline: {
      ...typography.body,
      color: c.textSecondary,
      marginTop: spacing.xs,
    },
    bottom: {
      gap: spacing.md,
      alignItems: "center",
    },
    googleBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      backgroundColor: "#FFFFFF",
      borderRadius: radius.md,
      paddingVertical: 14,
      paddingHorizontal: spacing.xl,
      width: "100%",
      minHeight: 52,
    },
    googleIcon: {
      width: 20,
      height: 20,
    },
    googleBtnText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1F1F1F",
    },
    hint: {
      ...typography.caption,
      color: c.textTertiary,
      textAlign: "center",
    },
  });
}
