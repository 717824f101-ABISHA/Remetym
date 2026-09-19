import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export const TransferActivityChart = ({ data }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const chartData = Array.isArray(data) && data.length > 0 ? data : [];
  const axisColor = isLight ? '#475569' : '#94A3B8';
  const gridColor = isLight ? '#E2E8F0' : '#334155';
  const textColor = isLight ? '#334155' : '#CBD5E1';

  if (chartData.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          height: 260,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: textColor,
          fontSize: '0.875rem'
        }}
      >
        No transfer activity recorded.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="week" stroke={axisColor} fontSize={12} />
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
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: '10px' }}
            formatter={(value) => <span style={{ color: textColor, fontSize: '0.8125rem', fontWeight: 500 }}>{value}</span>}
          />
          <Bar dataKey="Pending" fill={isLight ? '#D97706' : '#F59E0B'} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Approved" fill={isLight ? '#16A34A' : '#22C55E'} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Rejected" fill={isLight ? '#DC2626' : '#EF4444'} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
