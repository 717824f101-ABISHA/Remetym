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

export const DhoTransferBarChart = ({ data }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const chartData = Array.isArray(data) ? data : [];
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
        No transfer activity found for your district.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="phcName" stroke={axisColor} fontSize={12} interval={0} angle={-10} textAnchor="end" />
          <YAxis stroke={axisColor} fontSize={12} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: isLight ? '#FFFFFF' : '#1E293B',
              borderColor: isLight ? '#E2E8F0' : '#334155',
              borderRadius: '8px',
              color: isLight ? '#0F172A' : '#F8FAFC',
              boxShadow: 'var(--shadow-md)'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Bar dataKey="pending" name="Pending Transfers" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          <Bar dataKey="approved" name="Approved Transfers" fill="#10B981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="rejected" name="Rejected Transfers" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
