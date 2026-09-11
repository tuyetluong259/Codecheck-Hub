import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';

export const useWebSocket = (topic, onMessageReceived) => {
  const clientRef = useRef(null);
  const callbackRef = useRef(onMessageReceived);

  useEffect(() => {
    callbackRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    // Bypass Gateway to debug
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8085/ws';
    
    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('STOMP Connected to ' + topic);
      client.subscribe(topic, (message) => {
        if (message.body) {
          try {
            callbackRef.current(JSON.parse(message.body));
          } catch (e) {
            callbackRef.current(message.body);
          }
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    if (topic) {
        client.activate();
    }
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [topic]);

  const sendMessage = (destination, msg) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({ destination, body: JSON.stringify(msg) });
    }
  };

  return { sendMessage };
};