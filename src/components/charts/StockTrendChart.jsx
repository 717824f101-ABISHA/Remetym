import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export const StockTrendChart = ({ data }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const chartData = Array.isArray(data) && data.length > 0 ? data : [];
  const primaryColor = isLight ? '#16A34A' : '#22C55E';
  const axisColor = isLight ? '#475569' : '#94A3B8';
  const gridColor = isLight ? '#E2E8F0' : '#334155';
  const textColor = isLight ? '#334155' : '#CBD5E1';

  if (chartData.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: textColor,
          fontSize: '0.875rem'
        }}
      >
        No stock trend metrics available.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorTransfers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="month" stroke={axisColor} fontSize={12} />
          <YAxis stroke={axisColor} fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: isLight ? '#FFFFFF' : '#1E293B',
              borderColor: isLight ? '#E2E8F0' : '#334155',
              borderRadius: '8px',
              color: isLight ? '#0F172A' : '#F8FAFC',
              boxShadow: 'var(--shadow-md)'
            }}
          />
          <Area
            type="monotone"
            dataKey="stockLevel"
            stroke={primaryColor}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorStock)"
            name="Total Stock (Units)"
          />
          <Area
            type="monotone"
            dataKey="transfers"
            stroke="#0EA5E9"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTransfers)"
            name="Transferred Units"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
