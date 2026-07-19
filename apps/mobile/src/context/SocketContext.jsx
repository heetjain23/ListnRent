import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";
import { auth } from "../services/firebase.js";
import { API_BASE_URL } from "../services/api.js";

/**
 * Mirrors apps/web/client/src/context/SocketContext.jsx, with one addition
 * that has no web equivalent: React Native suspends the JS runtime (and
 * the socket connection with it) when the app is backgrounded, and doesn't
 * reliably fire socket "disconnect" events on resume. So we listen to
 * AppState and force a reconnect check whenever the app comes back to
 * the foreground.
 */
const SocketContext = createContext(null);

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || API_BASE_URL;

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const userRef = useRef(user);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("idle");

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const getToken = useCallback(async () => {
    try {
      if (auth.currentUser?.getIdToken) {
        return await auth.currentUser.getIdToken(false);
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      setConnectionStatus("idle");
      return;
    }

    if (socketRef.current) return;

    let cancelled = false;

    const initSocket = async () => {
      setConnectionStatus("connecting");
      const token = await getToken();
      if (!token || cancelled) {
        if (!cancelled) setConnectionStatus("error");
        return;
      }

      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 20,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 15000,
        timeout: 20000,
        autoConnect: false,
      });

      socket.on("connect", () => {
        if (cancelled) return;
        setConnected(true);
        setConnectionStatus("connected");
      });

      socket.on("disconnect", () => {
        if (cancelled) return;
        setConnected(false);
        setConnectionStatus("reconnecting");
      });

      socket.on("connect_error", async () => {
        if (cancelled) return;
        setConnected(false);
        setConnectionStatus("error");
        const fresh = await getToken();
        if (fresh) socket.auth = { token: fresh };
      });

      socketRef.current = socket;
      socket.connect();
    };

    initSocket();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      setConnectionStatus("idle");
    };
  }, [getToken, user?.uid]);

  // Force a reconnect check when the app returns from the background.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active" && socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect();
      }
    });
    return () => subscription.remove();
  }, []);

  const value = {
    connected,
    connectionStatus,
    getSocket: () => socketRef.current,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocketContext must be used inside SocketProvider");
  return ctx;
};
