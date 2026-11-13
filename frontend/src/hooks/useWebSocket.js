import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/appStore';

export function useWebSocket() {
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const setWsConnected = useAppStore((s) => s.setWsConnected);
  const setConversationState = useAppStore((s) => s.setConversationState);
  const setExtractedFields = useAppStore((s) => s.setExtractedFields);
  const setFieldConfidences = useAppStore((s) => s.setFieldConfidences);
  const setDangerSigns = useAppStore((s) => s.setDangerSigns);
  const setTiming = useAppStore((s) => s.setTiming);
  const setStats = useAppStore((s) => s.setStats);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsConnected(true);
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleMessage(msg);
        } catch {
          // ignore non-JSON messages
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch {
      reconnectTimer.current = setTimeout(connect, 3000);
    }
  }, []);

  const handleMessage = useCallback((msg) => {
    switch (msg.type) {
      case 'state_change':
        setConversationState(msg.state);
        break;
      case 'extraction':
        if (msg.fields) setExtractedFields(msg.fields);
        if (msg.confidences) setFieldConfidences(msg.confidences);
        if (msg.danger_signs) setDangerSigns(msg.danger_signs);
        break;
      case 'danger_alert':
        setDangerSigns(msg.danger_signs || []);
        break;
      case 'timing':
        setTiming(msg.timing || {});
        break;
      case 'stats':
        setStats(msg.stats || {});
        break;
      case 'readback':
        setConversationState('READBACK');
        break;
      case 'saved':
        setConversationState('SAVED');
        break;
      case 'error':
        console.error('WS error:', msg.message);
        break;
      default:
        break;
    }
  }, []);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { send, connected: useAppStore((s) => s.wsConnected) };
}
