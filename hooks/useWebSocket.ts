import { useEffect, useRef } from 'react';

type UpdatePrice = (price: number) => void;
type SetError = (error: string | null) => void;
type SetIsConnected = (isConnected: boolean) => void;

const useWebSocket = (
  updatePrice: UpdatePrice,
  setError: SetError,
  setIsConnected: SetIsConnected
) => {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.p) {
            updatePrice(parseFloat(data.p));
          } else {
            throw new Error('Invalid data format');
          }
        } catch (err) {
          setError('Error processing price data');
        }
      };

      ws.onerror = () => {
        setError('Connection error. Please check your internet connection.');
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [updatePrice, setError, setIsConnected]);
};

export default useWebSocket;
