"use client";

import { config } from "@/config";
import { useCallback, useEffect, useRef, useState } from "react";

const useSocket = (url: string = config.ws_url) => {
  const [isReady, setIsReady] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  console.log(url);

  useEffect(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log(`connected`);
      setIsReady(true);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsReady(false);
    };

    socket.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    return () => {
      socket.close();
    };
  }, [url]);

  const sendMessage = useCallback((msg: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const data = typeof msg === "string" ? msg : JSON.stringify(msg);
      socketRef.current.send(data);
    } else {
      console.warn("WebSocket not ready");
    }
  }, []);

  return {
    socket: socketRef.current,
    isReady,
    sendMessage,
  };
};

export default useSocket;
