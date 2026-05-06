'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: { date: string; count: number }[];
}

export default function LineChartComponent({ data }: Props) {
  const safeData = (data ?? []).map((d: any) => ({
    date: (d?.date ?? '').substring(5) || (d?.date ?? ''),
    fullDate: d?.date ?? '',
    count: d?.count ?? 0,
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={safeData} margin={{ top: 5, right: 10, left: 10, bottom: 40 }}>
          <XAxis
            dataKey="date"
            tickLine={false}
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            interval="preserveStartEnd"
            height={50}
          />
          <YAxis tickLine={false} tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{ fontSize: 11 }}
            labelFormatter={(label: any, payload: any) => payload?.[0]?.payload?.fullDate ?? label}
          />
          <Line type="monotone" dataKey="count" stroke="#A19AD3" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
