// src/hooks/useChatSocket.js
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * useChatSocket
 * - conversationId: numeric or string id used in your backend route
 * - onMessage: callback(data) when a message/typing arrives
 * - options: { autoReconnect: true, maxReconnectAttempts: 8 }
 */
export default function useChatSocket(conversationId, onMessage, options = {}) {
  const { autoReconnect = true, maxReconnectAttempts = 8 } = options;
  const wsRef = useRef(null);
  const attemptsRef = useRef(0);
  const reconnectTimer = useRef(null);
  const [connected, setConnected] = useState(false);
  const [lastError, setLastError] = useState(null);

  const buildUrl = () => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    return `${protocol}://${window.location.host}/ws/chat/${conversationId}/`;
  };

  const connect = useCallback(() => {
    if (!conversationId) return;
    const url = buildUrl();
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        attemptsRef.current = 0;
        setConnected(true);
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (onMessage) onMessage(data);
        } catch (err) {
          // ignore bad JSON
        }
      };

      ws.onclose = (ev) => {
        setConnected(false);
        // try reconnect
        if (autoReconnect && attemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * 2 ** attemptsRef.current, 30000);
          attemptsRef.current += 1;
          reconnectTimer.current = setTimeout(() => connect(), delay);
        }
      };

      ws.onerror = (err) => {
        setLastError(err);
        // close will trigger reconnect logic
      };
    } catch (err) {
      setLastError(err);
    }
  }, [conversationId, onMessage, autoReconnect, maxReconnectAttempts]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      try {
        wsRef.current && wsRef.current.close();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connect]);

  const send = useCallback((obj) => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(obj));
        return true;
      }
    } catch (e) {
      // ignore
    }
    return false;
  }, []);

  // debounced typing
  const typingTimeout = useRef(null);
  const sendTyping = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    send({ type: "typing" });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    // prevent spamming typing events: only send again after 2s
    typingTimeout.current = setTimeout(() => {
      typingTimeout.current = null;
    }, 2000);
  }, [send]);

  return {
    send,
    sendTyping,
    connected,
    lastError,
  };
}
