'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: { name: string; value: number }[];
  color: string;
  isTechnician?: boolean;
}

export default function BarChartComponent({ data, color, isTechnician }: Props) {
  const safeData = (data ?? []).map((d: any) => {
    let displayName = d?.name ?? '';
    if (isTechnician) {
      const parts = displayName.trim().split(/\s+/);
      displayName = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]}` : displayName;
      displayName = displayName.toUpperCase();
    } else {
      // For models, just keep it as is or truncation logic
      if (displayName.length > 18) {
        displayName = displayName.substring(0, 16) + '...';
      }
    }
    
    return {
      name: displayName,
      fullName: (d?.name ?? '').toUpperCase(),
      value: d?.value ?? 0,
    };
  });

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={safeData} margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
          <XAxis
            dataKey="name"
            tickLine={false}
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis tickLine={false} tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{ fontSize: 11 }}
            formatter={(val: any, _name: any, props: any) => [val, props?.payload?.fullName ?? 'Valor']}
          />
          <Bar dataKey="value" fill={color ?? '#60B5FF'} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
