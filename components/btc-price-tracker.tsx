"use client";

import { useEffect, useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bitcoin } from 'lucide-react';
import useWebSocket from '@/hooks/useWebSocket';

interface PriceData {
  timestamp: number;
  price: number;
}

export default function BTCPriceTracker() {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePrice = useCallback((price: number) => {
    setCurrentPrice(price);
    setPriceHistory(prev => {
      const newHistory = [...prev, { timestamp: Date.now(), price }];
      // Keep last 50 data points
      return newHistory.slice(-50);
    });

    if (priceHistory.length > 0) {
      const previousPrice = priceHistory[priceHistory.length - 1].price;
      const change = ((price - previousPrice) / previousPrice) * 100;
      setPriceChange(change);
    }
  }, [priceHistory]);



  useWebSocket(updatePrice, setError, setIsConnected);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Bitcoin className="w-12 h-12 text-yellow-500" />
          <h1 className="text-4xl font-bold">Bitcoin Price Tracker</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-300">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Current Price</h2>
          <div className="flex items-baseline gap-4">
            <span className="text-5xl font-bold">
              {currentPrice ? formatPrice(currentPrice) : '---'}
            </span>
            {priceChange !== 0 && (
              <span className={`text-lg ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange >= 0 ? '↑' : '↓'} {Math.abs(priceChange).toFixed(2)}%
              </span>
            )}
          </div>
        </div>

        <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">24h Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Samples</p>
              <p className="text-2xl font-semibold">{priceHistory.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Price Change</p>
              <p className={`text-2xl font-semibold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
        <h2 className="text-xl font-semibold mb-6">Price History</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                stroke="#9CA3AF"
              />
              <YAxis
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                stroke="#9CA3AF"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
                labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#EAB308"
                strokeWidth={2}
                dot={false}
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}