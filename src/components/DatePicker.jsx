'use client';

import { useState } from 'react';
import { toDateStr } from '../lib/utils';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export default function DatePicker({ value, onSelect }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-based

  const todayStr = toDateStr(today);

  // Get days in this month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // Day of week for 1st of month (0=Sun, convert to Mon-based: 0=Mon)
  const firstDayRaw = new Date(viewYear, viewMonth, 1).getDay();
  const firstDay = firstDayRaw === 0 ? 6 : firstDayRaw - 1; // Mon=0, Sun=6

  // Build calendar grid
  const cells = [];
  // Empty cells before 1st
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(viewYear, viewMonth, d);
    cells.push({
      day: d,
      str: toDateStr(dateObj),
      isFuture: dateObj > today,
    });
  }

  const monthLabel = `Tháng ${viewMonth + 1}/${viewYear}`;

  const changeMonth = (dir) => {
    let m = viewMonth + dir;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => changeMonth(-1)} className="p-2 press-scale text-gray-400 active:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-base font-bold">{monthLabel}</h3>
        <button onClick={() => changeMonth(1)} className="p-2 press-scale text-gray-400 active:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-6">
        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((wd, i) => (
            <div key={wd} className={`text-center text-xs font-medium py-1 ${i === 6 ? 'text-red-400' : 'text-gray-500'}`}>
              {wd}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) {
              return <div key={`empty-${i}`} />;
            }

            const isSelected = value === cell.str;
            const isToday = cell.str === todayStr;
            const isSunday = (i % 7) === 6;

            return (
              <button
                key={cell.str}
                onClick={() => !cell.isFuture && onSelect(cell.str)}
                disabled={cell.isFuture}
                className={`flex flex-col items-center py-2.5 rounded-xl transition-colors press-scale ${
                  isSelected
                    ? 'bg-accent text-white'
                    : cell.isFuture
                      ? 'text-gray-700'
                      : isSunday
                        ? 'bg-dark-card text-red-400 active:bg-dark-border'
                        : 'bg-dark-card text-gray-300 active:bg-dark-border'
                }`}
              >
                <span className="text-base font-bold">{cell.day}</span>
                {isToday && (
                  <span className={`text-[8px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-accent'}`}>nay</span>
                )}
              </button>
            );
          })}
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
