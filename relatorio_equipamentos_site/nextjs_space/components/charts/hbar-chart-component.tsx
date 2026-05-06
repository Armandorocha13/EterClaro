'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: { name: string; value: number }[];
  color: string;
}

export default function HBarChartComponent({ data, color }: Props) {
  const safeData = [...(data ?? [])].reverse().map((d: any) => ({
    name: (d?.name ?? '').length > 22 ? (d?.name ?? '').substring(0, 20) + '...' : (d?.name ?? ''),
    fullName: d?.name ?? '',
    value: d?.value ?? 0,
  }));

  const height = Math.max(300, (safeData?.length ?? 0) * 28);

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={safeData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <XAxis type="number" tickLine={false} tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="name" tickLine={false} tick={{ fontSize: 10 }} width={130} />
          <Tooltip
            contentStyle={{ fontSize: 11 }}
            formatter={(val: any, _name: any, props: any) => [val, props?.payload?.fullName ?? 'Valor']}
          />
          <Bar dataKey="value" fill={color ?? '#60B5FF'} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
