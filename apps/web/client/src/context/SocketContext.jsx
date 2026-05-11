import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { auth } from "../services/firebase";

const SocketContext = createContext(null);

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const userRef = useRef(user);
  const socketRef = useRef(null);
  const [socketState, setSocketState] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("idle");
  const [connectionError, setConnectionError] = useState(null);
  const [connectCount, setConnectCount] = useState(0);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const getToken = useCallback(async () => {
    const currentUser = userRef.current;
    try {
      if (typeof currentUser?.getIdToken === "function") {
        return await currentUser.getIdToken(false);
      }

      if (auth.currentUser?.getIdToken) {
        return await auth.currentUser.getIdToken(false);
      }

      if (currentUser?.token) {
        return currentUser.token;
      }

      return localStorage.getItem("auth_token");
    } catch {
      return currentUser?.token || localStorage.getItem("auth_token");
    }
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocketState(null);
      setConnected(false);
      setConnectionStatus("idle");
      setConnectionError(null);
      setConnectCount(0);
      return;
    }

    if (socketRef.current) return;

    let cancelled = false;

    const initSocket = async () => {
      setConnectionStatus("connecting");
      setConnectionError(null);
      const token = await getToken();
      if (!token || cancelled) {
        if (!cancelled) {
          setConnectionStatus("error");
          setConnectionError("No auth token available for realtime messaging");
        }
        return;
      }

      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 20,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 15000,
        randomizationFactor: 0.3,
        timeout: 20000,
        autoConnect: false,
      });

      socket.on("connect", () => {
        if (cancelled) return;
        setConnected(true);
        setConnectionStatus("connected");
        setConnectionError(null);
        setConnectCount((n) => n + 1);
      });

      socket.on("disconnect", () => {
        if (cancelled) return;
        setConnected(false);
        setConnectionStatus("reconnecting");
      });

      socket.on("connect_error", async (err) => {
        if (!cancelled) {
          setConnected(false);
          setConnectionStatus("error");
          setConnectionError(err.message || "Realtime connection failed");
        }

        if (
          err.message?.includes("Authentication") ||
          err.message?.includes("Invalid") ||
          err.message?.includes("token")
        ) {
          const fresh = await getToken();
          if (fresh && !cancelled) socket.auth = { token: fresh };
        }
      });

      socketRef.current = socket;
      if (!cancelled) setSocketState(socket);
      socket.connect();
    };

    initSocket();

    return () => {
      cancelled = true;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocketState(null);
      setConnected(false);
      setConnectionStatus("idle");
      setConnectionError(null);
      setConnectCount(0);
    };
  }, [getToken, user?.token, user?.uid]);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(async () => {
      const token = await getToken();
      if (token && socketRef.current) {
        socketRef.current.auth = { token };
        socketRef.current.disconnect().connect();
      }
    }, 55 * 60 * 1000);
    return () => clearInterval(id);
  }, [user, getToken]);

  const value = {
    socketRef,
    socketState,
    connected,
    connectionStatus,
    connectionError,
    connectCount,
    getSocket: () => socketRef.current,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocketContext must be used inside SocketProvider");
  return ctx;
};
