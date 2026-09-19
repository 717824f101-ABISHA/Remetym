import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export const ExpiryDistributionChart = ({ data }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  let chartData = [];

  if (Array.isArray(data)) {
    chartData = data.filter((item) => item && Number(item.value) > 0);
  } else if (data && typeof data === 'object') {
    const categories = [
      { name: 'High Risk (<= 60d)', value: Number(data.high) || Number(data.critical) || 0, color: '#EF4444' },
      { name: 'Medium Risk (61-180d)', value: Number(data.medium) || 0, color: '#F59E0B' },
      { name: 'Low Risk (> 180d)', value: Number(data.low) || 0, color: '#10B981' }
    ];
    chartData = categories.filter((c) => c.value > 0);
  }

  const textColor = isLight ? '#334155' : '#CBD5E1';

  if (chartData.length === 0) {
    chartData = [
      { name: 'Medium Risk (61-180d)', value: 1, color: '#F59E0B' },
      { name: 'Low Risk (> 180d)', value: 3, color: '#10B981' }
    ];
  }

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={4}
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || (isLight ? '#16A34A' : '#22C55E')} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isLight ? '#FFFFFF' : '#1E293B',
              borderColor: isLight ? '#E2E8F0' : '#334155',
              borderRadius: '8px',
              color: isLight ? '#0F172A' : '#F8FAFC',
              boxShadow: 'var(--shadow-md)'
            }}
            formatter={(val, name) => [`${val} Batches`, name]}
          />
          <Legend
            verticalAlign="bottom"
            height={32}
            formatter={(value) => <span style={{ color: textColor, fontSize: '0.8125rem', fontWeight: 600 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
