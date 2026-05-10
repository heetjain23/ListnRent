import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

/**
 * SocketContext
 *
 * Single socket instance shared across the entire app.
 * - Creates socket only when a user is logged in
 * - Destroys socket on logout / unmount
 * - Reconnects automatically with exponential back-off (socket.io default)
 * - Exposes `socket`, `connected`, and helper methods
 */

const SocketContext = createContext(null);

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  const getToken = useCallback(async () => {
    if (!user) return null;
    try {
      // Firebase refreshes the token automatically if expired
      return await user.getIdToken();
    } catch {
      return null;
    }
  }, [user]);

  useEffect(() => {
    if (!user?.uid) {
      // Not logged in — destroy any existing socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    // Already connected as this user
    if (socketRef.current?.connected) return;

    let isMounted = true;

    const connect = async () => {
      const token = await getToken();
      if (!token || !isMounted) return;

      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 30000, // cap at 30s
        randomizationFactor: 0.5,
        timeout: 20000,
      });

      socket.on("connect", () => {
        if (isMounted) setConnected(true);
        console.log("[Socket] Connected:", socket.id);
      });

      socket.on("disconnect", (reason) => {
        if (isMounted) setConnected(false);
        console.log("[Socket] Disconnected:", reason);
      });

      socket.on("connect_error", async (err) => {
        console.error("[Socket] Connection error:", err.message);
        // If auth failed, refresh token and retry once
        if (err.message.includes("Authentication") || err.message.includes("Invalid")) {
          const freshToken = await getToken();
          if (freshToken && socket) {
            socket.auth = { token: freshToken };
            socket.connect();
          }
        }
      });

      socketRef.current = socket;
    };

    connect();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
    };
  }, [user?.uid, getToken]);

  // Re-auth with fresh token before token expires (~55 min, Firebase tokens last 60)
  useEffect(() => {
    if (!user) return;
    const REFRESH_INTERVAL = 55 * 60 * 1000; // 55 minutes

    const interval = setInterval(async () => {
      const token = await getToken();
      if (token && socketRef.current) {
        socketRef.current.auth = { token };
        // Force reconnect so the new token is sent in the handshake
        if (socketRef.current.connected) {
          socketRef.current.disconnect().connect();
        }
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [user, getToken]);

  const value = {
    socket: socketRef.current,
    connected,
    // Stable ref accessor so hooks don't need the socket in deps
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