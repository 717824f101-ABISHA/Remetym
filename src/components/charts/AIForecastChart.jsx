import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export const AIForecastChart = ({ data }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const rawList = Array.isArray(data) ? data : [];

  // Find index of the last historical data point (e.g. Jun 2026)
  let lastHistIdx = -1;
  rawList.forEach((item, idx) => {
    if (item && item.historicalDemand !== undefined && item.historicalDemand !== null) {
      lastHistIdx = idx;
    }
  });

  const chartData = rawList.map((item, idx) => {
    if (!item) return null;

    let label = item.month || item.displayDate || item.date || item.period || 'Month';
    let hist = item.historicalDemand !== undefined && item.historicalDemand !== null ? Number(item.historicalDemand) : null;
    let pred = item.predictedDemand !== undefined && item.predictedDemand !== null ? Number(item.predictedDemand) : null;

    // Bridge point: Connect predicted line smoothly from the last historical point (Jun 2026)
    if (idx === lastHistIdx && hist !== null) {
      pred = hist;
    }

    return {
      label,
      historicalDemand: hist,
      predictedDemand: pred
    };
  }).filter(Boolean);

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
        No forecasting data available for live inventory.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="label" stroke={axisColor} fontSize={12} />
          <YAxis stroke={axisColor} fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: isLight ? '#FFFFFF' : '#1E293B',
              borderColor: isLight ? '#E2E8F0' : '#334155',
              borderRadius: '8px',
              color: isLight ? '#0F172A' : '#F8FAFC',
              boxShadow: 'var(--shadow-md)'
            }}
            formatter={(value, name) => [value !== null ? `${value} units` : 'N/A', name]}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: '10px' }}
            formatter={(value) => (
              <span style={{ color: textColor, fontSize: '0.8125rem', fontWeight: 600 }}>
                {value}
              </span>
            )}
          />
          <Line
            type="monotone"
            dataKey="historicalDemand"
            stroke="#2563EB"
            strokeWidth={3}
            dot={{ r: 4, fill: '#2563EB' }}
            activeDot={{ r: 6 }}
            name="Historical Monthly Consumption"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="predictedDemand"
            stroke="#F59E0B"
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ r: 4, fill: '#F59E0B' }}
            activeDot={{ r: 6 }}
            name="XGBoost Predicted Demand"
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
