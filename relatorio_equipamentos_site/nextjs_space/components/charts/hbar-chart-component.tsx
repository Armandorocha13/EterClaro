'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: { name: string; value: number }[];
  color: string;
}

export default function HBarChartComponent({ data, color }: Props) {
  const safeData = [...(data ?? [])].reverse().map((d: any) => {
    const parts = (d?.name ?? '').trim().split(/\s+/);
    const shortName = (parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]}` : (d?.name ?? '')).toUpperCase();
    return {
      name: shortName,
      fullName: (d?.name ?? '').toUpperCase(),
      value: d?.value ?? 0,
    };
  });

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
