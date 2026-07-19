import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocketContext } from "../context/SocketContext.jsx";
import { api, API_BASE_URL } from "../services/api.js";

const STATUS = { IDLE: "idle", CHECKING: "checking", OK: "ok", FAIL: "fail" };

const StatusRow = ({ label, status, detail }) => {
  const color =
    status === STATUS.OK ? "#1a7f37" : status === STATUS.FAIL ? "#c0392b" : "#888";
  const symbol =
    status === STATUS.OK ? "✓" : status === STATUS.FAIL ? "✕" : status === STATUS.CHECKING ? "…" : "•";

  return (
    <View style={styles.row}>
      <Text style={[styles.symbol, { color }]}>{symbol}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
    </View>
  );
};

export default function ConnectionTest() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { connectionStatus } = useSocketContext();

  const [serverStatus, setServerStatus] = useState(STATUS.IDLE);
  const [serverDetail, setServerDetail] = useState("");
  const [dbStatus, setDbStatus] = useState(STATUS.IDLE);
  const [dbDetail, setDbDetail] = useState("");
  const [authCheckStatus, setAuthCheckStatus] = useState(STATUS.IDLE);
  const [authCheckDetail, setAuthCheckDetail] = useState("");

  const runHealthCheck = useCallback(async () => {
    setServerStatus(STATUS.CHECKING);
    setDbStatus(STATUS.CHECKING);
    try {
      const data = await api("/api/health");
      setServerStatus(STATUS.OK);
      setServerDetail(API_BASE_URL);

      if (data?.database === "connected") {
        setDbStatus(STATUS.OK);
        setDbDetail(data.databaseName || "connected");
      } else {
        setDbStatus(STATUS.FAIL);
        setDbDetail(`mongoose state: ${data?.database || "unknown"}`);
      }
    } catch (err) {
      setServerStatus(STATUS.FAIL);
      setServerDetail(err.message || "Could not reach server");
      setDbStatus(STATUS.FAIL);
      setDbDetail("Skipped — server unreachable");
    }
  }, []);

  const runAuthCheck = useCallback(async () => {
    if (!isAuthenticated) {
      setAuthCheckStatus(STATUS.IDLE);
      setAuthCheckDetail("Sign in to test this");
      return;
    }
    setAuthCheckStatus(STATUS.CHECKING);
    try {
      const data = await api("/api/health/auth", { auth: true });
      setAuthCheckStatus(STATUS.OK);
      setAuthCheckDetail(`Verified as ${data.email || data.uid}`);
    } catch (err) {
      setAuthCheckStatus(STATUS.FAIL);
      setAuthCheckDetail(err.message || "Token verification failed");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  useEffect(() => {
    if (!authLoading) runAuthCheck();
  }, [authLoading, runAuthCheck]);

  const socketDisplayStatus =
    connectionStatus === "connected"
      ? STATUS.OK
      : connectionStatus === "error"
        ? STATUS.FAIL
        : connectionStatus === "idle"
          ? STATUS.IDLE
          : STATUS.CHECKING;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Connection Test</Text>
      <Text style={styles.subtitle}>ListnRent mobile → backend</Text>

      <View style={styles.card}>
        <StatusRow label="Server reachable" status={serverStatus} detail={serverDetail} />
        <StatusRow label="MongoDB connected" status={dbStatus} detail={dbDetail} />
        <StatusRow
          label="Socket.io"
          status={socketDisplayStatus}
          detail={
            connectionStatus === "idle" ? "Not signed in — socket only connects for authed users" : connectionStatus
          }
        />
        <StatusRow
          label="Firebase auth round-trip"
          status={authCheckStatus}
          detail={authCheckDetail}
        />
      </View>

      <Pressable style={styles.button} onPress={() => { runHealthCheck(); runAuthCheck(); }}>
        <Text style={styles.buttonText}>Re-run checks</Text>
      </Pressable>

      <View style={styles.debugBlock}>
        <Text style={styles.debugTitle}>Debug info</Text>
        <Text style={styles.debugLine}>API base: {API_BASE_URL}</Text>
        <Text style={styles.debugLine}>Signed in: {String(isAuthenticated)}</Text>
        <Text style={styles.debugLine}>User: {user?.email || user?.uid || "none"}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 60, gap: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 8 },
  card: { backgroundColor: "#f5f5f5", borderRadius: 12, padding: 16, gap: 14 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  symbol: { fontSize: 16, fontWeight: "700", width: 18 },
  label: { fontSize: 15, fontWeight: "600", color: "#222" },
  detail: { fontSize: 12, color: "#777", marginTop: 2 },
  button: {
    backgroundColor: "#124033",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  debugBlock: { marginTop: 8, gap: 4 },
  debugTitle: { fontSize: 12, fontWeight: "700", color: "#999", textTransform: "uppercase" },
  debugLine: { fontSize: 12, color: "#888" },
});