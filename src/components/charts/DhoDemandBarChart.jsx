import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export const DhoDemandBarChart = ({ data }) => {
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
        No PHC medicine demand data available for your assigned district.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 350 }}>
      {/* Visual Legend */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          justifyContent: 'flex-end',
          marginBottom: '0.875rem',
          fontSize: '0.8125rem',
          fontWeight: 600,
          flexWrap: 'wrap'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#10B981' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
          Safe Stock
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#F59E0B' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block' }}></span>
          Low Stock / Procurement Warning
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#EF4444' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }}></span>
          Critical / Expiry Risk
        </span>
      </div>

      <ResponsiveContainer width="100%" height="86%">
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="phcName" stroke={axisColor} fontSize={12} interval={0} angle={-15} textAnchor="end" />
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
          <Bar dataKey="predictedDemand" name="Predicted Medicine Demand" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#10B981'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
