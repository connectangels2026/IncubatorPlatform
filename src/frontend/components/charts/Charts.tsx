'use client';

import React from 'react';

export function ResponsiveContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`w-full overflow-hidden ${className}`}>{children}</div>;
}

interface BarChartItem {
  label: string;
  value: number;
  color?: string;
}

export function BarChart({ data, height = 180 }: { data: BarChartItem[]; height?: number }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <ResponsiveContainer>
      <div className="flex items-end gap-3 pt-6 pb-2" style={{ height }}>
        {data.map((item, idx) => {
          const pct = Math.round((item.value / maxVal) * 100);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition">
                {item.value}
              </div>
              <div
                className={`w-full rounded-lg transition-all duration-300 ${
                  item.color || 'bg-blue-600 hover:bg-blue-700'
                }`}
                style={{ height: `${pct}%` }}
              />
              <span className="text-[10px] font-medium text-slate-400 truncate max-w-full">{item.label}</span>
            </div>
          );
        })}
      </div>
    </ResponsiveContainer>
  );
}

interface LineChartPoint {
  label: string;
  value: number;
}

export function LineChart({ data, height = 180 }: { data: LineChartPoint[]; height?: number }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = Math.min(...data.map((d) => d.value), 0);
  const range = maxVal - minVal || 1;

  const points = data
    .map((d, idx) => {
      const x = (idx / (data.length - 1)) * 300;
      const y = 140 - ((d.value - minVal) / range) * 120;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <ResponsiveContainer>
      <div className="flex flex-col justify-end" style={{ height }}>
        <svg viewBox="0 0 300 150" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Fill area */}
          <polygon
            points={`0,140 ${points} 300,140`}
            fill="url(#lineGrad)"
          />
          {/* Stroke line */}
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
        <div className="flex justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
          {data.map((d, idx) => (
            <span key={idx}>{d.label}</span>
          ))}
        </div>
      </div>
    </ResponsiveContainer>
  );
}

interface PieChartSlice {
  label: string;
  value: number;
  color: string;
}

export function PieChart({ data }: { data: PieChartSlice[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let accumulated = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-28 h-28 shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {data.map((slice, idx) => {
            const pct = (slice.value / total) * 100;
            const strokeDasharray = `${pct} ${100 - pct}`;
            const strokeDashoffset = -accumulated;
            accumulated += pct;

            return (
              <circle
                key={idx}
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke={slice.color}
                strokeWidth="4"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
      </div>

      <div className="space-y-1.5 flex-1">
        {data.map((slice, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="text-slate-600 font-medium">{slice.label}</span>
            </div>
            <span className="font-bold text-slate-800">{Math.round((slice.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
