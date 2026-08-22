import { useEffect, useRef } from 'react';

export const useWebSocket = (endpoint, onMessageReceived) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
    const socket = new WebSocket(`${wsUrl}${endpoint}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        onMessageReceived(JSON.parse(event.data));
      } catch (e) {
        onMessageReceived(event.data);
      }
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) socket.close();
    };
  }, [endpoint, onMessageReceived]);

  const sendMessage = (msg) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  };

  return { sendMessage };
};