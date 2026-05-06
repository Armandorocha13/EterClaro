'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: { name: string; value: number }[];
  color: string;
}

export default function BarChartComponent({ data, color }: Props) {
  const safeData = (data ?? []).map((d: any) => ({
    name: (d?.name ?? '').length > 18 ? (d?.name ?? '').substring(0, 16) + '...' : (d?.name ?? ''),
    fullName: d?.name ?? '',
    value: d?.value ?? 0,
  }));

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
