import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

export interface AnomalyAlert {
  id: string;
  type: 'anomaly_alert';
  patient_id: string;
  patient_name?: string;
  vital_type: string;
  value: number;
  severity: 'high' | 'critical' | 'emergency';
  priority?: 'low' | 'normal' | 'high' | 'emergency';
  message: string;
  timestamp: string;
  created_at: string;
  acknowledged?: boolean;
}

export const useAlertSocket = (onAlertReceived?: (alert: AnomalyAlert) => void): void => {
  const { accessToken, currentUser } = useAuthStore();
  const { showToast } = useToastStore();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const backoffRef = useRef<number>(1000);

  useEffect(() => {
    if (!currentUser || !accessToken) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    const getWsUrl = (): string => {
      const metaEnv = (import.meta as any)?.env;
      const apiUrl = metaEnv?.VITE_API_URL || (typeof process !== 'undefined' ? process.env.REACT_APP_API_URL : '') || 'http://localhost:8000/api';
      const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
      const host = apiUrl.replace(/^https?:\/\//, '');
      return `${wsProtocol}://${host}/ws/alerts?token=${accessToken}`;
    };

    let isSubscribed = true;

    const connectWebSocket = () => {
      try {
        const wsUrl = getWsUrl();
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          backoffRef.current = 1000;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.type === 'anomaly_alert') {
              showToast(data.message || `Alert for ${data.patient_name || 'patient'}!`, 'error');
              if (onAlertReceived) {
                onAlertReceived(data);
              }
            }
          } catch (err) {
            console.warn('Error parsing WebSocket message:', err);
          }
        };

        ws.onerror = (error) => {
          console.warn('WebSocket error:', error);
        };

        ws.onclose = () => {
          if (!isSubscribed) return;
          const nextBackoff = Math.min(backoffRef.current * 2, 30000);
          backoffRef.current = nextBackoff;
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connectWebSocket();
          }, nextBackoff);
        };
      } catch (e) {
        console.warn('Failed to establish WebSocket connection:', e);
      }
    };

    connectWebSocket();

    return () => {
      isSubscribed = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [accessToken, currentUser, onAlertReceived, showToast]);
};
