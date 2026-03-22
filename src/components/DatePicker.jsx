'use client';

import { toDateStr } from '../lib/utils';

export default function DatePicker({ value, onSelect }) {
  const today = new Date();
  const dates = [];

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const str = toDateStr(d);
    let label;
    if (i === 0) label = 'Hôm nay';
    else if (i === 1) label = 'Hôm qua';
    else if (i === 2) label = 'Hôm kia';
    else {
      label = d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
    }
    dates.push({ str, label, day: d.getDate(), weekday: d.toLocaleDateString('vi-VN', { weekday: 'short' }) });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 text-center">
        <p className="text-sm text-gray-400">Chọn ngày</p>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
        <div className="grid grid-cols-5 gap-2">
          {dates.map((d) => (
            <button
              key={d.str}
              onClick={() => onSelect(d.str)}
              className={`flex flex-col items-center py-3 rounded-xl transition-colors press-scale ${
                value === d.str
                  ? 'bg-accent text-white'
                  : 'bg-dark-card text-gray-300 active:bg-dark-border'
              }`}
            >
              <span className="text-xs opacity-60">{d.weekday}</span>
              <span className="text-lg font-bold">{d.day}</span>
              {d.str === toDateStr(new Date()) && (
                <span className="text-[9px] opacity-60">nay</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSelect(value)}
        className="h-14 bg-accent text-white text-lg font-semibold active:opacity-80 transition-opacity"
      >
        XONG ✓
      </button>
    </div>
  );
}
