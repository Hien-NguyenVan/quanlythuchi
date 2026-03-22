'use client';

import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { getCategoryById } from '../lib/categories';
import { formatMoney, formatMoneyShort, getMonthLabel, toDateStr, getDateLabel } from '../lib/utils';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip,
} from 'recharts';

const MONTHS_BACK = 6;

function getRecentMonths(count) {
  const months = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.unshift(m);
  }
  return months;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-xs">
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-400">{p.name}:</span>
          <span className="text-white font-medium">{formatMoney(p.value)}₫</span>
        </div>
      ))}
    </div>
  );
}

function ArrowLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function ChartScreen() {
  const todayStr = toDateStr(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [chartTab, setChartTab] = useState('category');
  const [selectedDailyDate, setSelectedDailyDate] = useState(todayStr);

  // All transactions for various computations
  const allTxs = useLiveQuery(() => db.transactions.toArray());
  const monthTxs = useLiveQuery(
    () => db.transactions.where('date').startsWith(month).toArray(),
    [month]
  );

  const months = useMemo(() => getRecentMonths(MONTHS_BACK), []);

  // --- Helpers ---
  const changeDate = (dir) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + dir);
    const newStr = toDateStr(d);
    if (newStr > todayStr) return;
    setSelectedDate(newStr);
    // Update month if crossed month boundary
    const newMonth = newStr.slice(0, 7);
    if (newMonth !== month) setMonth(newMonth);
  };

  const changeMonth = (dir) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const selectedDateLabel = useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    const weekday = d.toLocaleDateString('vi-VN', { weekday: 'long' });
    const label = getDateLabel(selectedDate);
    const dateFormatted = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return { weekday, label, dateFormatted };
  }, [selectedDate]);

  // ==========================================
  // CATEGORY TAB - per day
  // ==========================================
  const dayTxs = useMemo(() => {
    if (!allTxs) return [];
    return allTxs
      .filter((tx) => tx.date === selectedDate)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [allTxs, selectedDate]);

  const dayIncome = dayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const dayExpense = dayTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const dayGroupData = useMemo(() => {
    const map = {};
    dayTxs.forEach((tx) => {
      const cat = getCategoryById(tx.categoryId);
      const key = cat?.group || 'Khác';
      if (!map[key]) map[key] = { name: key, value: 0, color: cat?.color || '#888' };
      map[key].value += tx.amount;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [dayTxs]);

  const dayTotal = dayTxs.reduce((s, t) => s + t.amount, 0);

  // ==========================================
  // TREND TAB - 6 months
  // ==========================================
  const trendData = useMemo(() => {
    if (!allTxs) return [];
    return months.map((m) => {
      let income = 0;
      let expense = 0;
      allTxs.filter((tx) => tx.date.startsWith(m)).forEach((tx) => {
        if (tx.type === 'income') income += tx.amount;
        else expense += tx.amount;
      });
      const [, mm] = m.split('-');
      return { name: `T${parseInt(mm)}`, income, expense };
    });
  }, [allTxs, months]);

  // ==========================================
  // DAILY TAB - heatmap calendar + detail
  // ==========================================
  const dailyMap = useMemo(() => {
    if (!monthTxs) return {};
    const map = {};
    monthTxs.forEach((tx) => {
      const dateStr = tx.date;
      if (!map[dateStr]) map[dateStr] = { income: 0, expense: 0, txs: [] };
      if (tx.type === 'income') map[dateStr].income += tx.amount;
      else map[dateStr].expense += tx.amount;
      map[dateStr].txs.push(tx);
    });
    return map;
  }, [monthTxs]);

  const maxDailyExpense = useMemo(() => {
    let max = 0;
    Object.values(dailyMap).forEach((d) => { if (d.expense > max) max = d.expense; });
    return max;
  }, [dailyMap]);

  const dailyCalendar = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const firstDayRaw = new Date(y, m - 1, 1).getDay();
    const firstDay = firstDayRaw === 0 ? 6 : firstDayRaw - 1;
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${month}-${String(d).padStart(2, '0')}`;
      const data = dailyMap[dateStr];
      cells.push({ day: d, dateStr, expense: data?.expense || 0, income: data?.income || 0, hasTx: !!data });
    }
    return cells;
  }, [month, dailyMap]);

  const selectedDayData = useMemo(() => {
    const data = dailyMap[selectedDailyDate];
    if (!data) return null;
    return {
      ...data,
      txs: data.txs.sort((a, b) => b.createdAt - a.createdAt),
    };
  }, [dailyMap, selectedDailyDate]);

  // ==========================================
  // EVAL TAB
  // ==========================================
  const evaluation = useMemo(() => {
    if (!allTxs) return null;
    const currentTxs = allTxs.filter((tx) => tx.date.startsWith(month));
    const [y, m] = month.split('-').map(Number);
    const prevMonth = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
    const prevTxs = allTxs.filter((tx) => tx.date.startsWith(prevMonth));

    const curExpense = currentTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const prevExpense = prevTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const curIncome = currentTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const prevIncome = prevTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

    const expenseChange = prevExpense > 0 ? ((curExpense - prevExpense) / prevExpense * 100) : 0;
    const incomeChange = prevIncome > 0 ? ((curIncome - prevIncome) / prevIncome * 100) : 0;
    const savingRate = curIncome > 0 ? ((curIncome - curExpense) / curIncome * 100) : 0;

    const catMap = {};
    currentTxs.filter((t) => t.type === 'expense').forEach((tx) => {
      const cat = getCategoryById(tx.categoryId);
      const key = cat?.group || 'Khác';
      catMap[key] = (catMap[key] || 0) + tx.amount;
    });
    const topGroups = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

    const daysWithTxs = new Set(currentTxs.filter((t) => t.type === 'expense').map((t) => t.date)).size;
    const dailyAvg = daysWithTxs > 0 ? curExpense / daysWithTxs : 0;

    return {
      curExpense, prevExpense, curIncome, prevIncome,
      expenseChange, incomeChange, savingRate,
      topGroups, dailyAvg, prevMonth: getMonthLabel(prevMonth),
    };
  }, [allTxs, month]);

  return (
    <div className="hide-scrollbar" style={{ paddingBottom: 'calc(120px + env(safe-area-inset-bottom))' }}>
      {/* ======================== CONTENT ======================== */}

      {/* CATEGORY TAB - per day */}
      {chartTab === 'category' && (
        <div className="fade-in">
          {/* Day navigator */}
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => changeDate(-1)} className="p-2 press-scale text-gray-400 active:text-white">
              <ArrowLeft />
            </button>
            <div className="text-center">
              <p className="text-base font-bold">{selectedDateLabel.label}</p>
              <p className="text-xs text-gray-500">{selectedDateLabel.weekday}, {selectedDateLabel.dateFormatted}</p>
            </div>
            <button
              onClick={() => changeDate(1)}
              disabled={selectedDate >= todayStr}
              className={`p-2 press-scale ${selectedDate >= todayStr ? 'text-gray-700' : 'text-gray-400 active:text-white'}`}
            >
              <ArrowRight />
            </button>
          </div>

          {/* Day summary */}
          <div className="flex px-4 gap-3 mb-4">
            <div className="flex-1 bg-dark-card rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase">Thu</p>
              <p className="text-sm font-bold text-income">+{formatMoney(dayIncome)}</p>
            </div>
            <div className="flex-1 bg-dark-card rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase">Chi</p>
              <p className="text-sm font-bold text-expense">-{formatMoney(dayExpense)}</p>
            </div>
            <div className="flex-1 bg-dark-card rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase">Tổng</p>
              <p className={`text-sm font-bold ${dayIncome - dayExpense >= 0 ? 'text-income' : 'text-expense'}`}>
                {dayIncome - dayExpense >= 0 ? '+' : ''}{formatMoney(dayIncome - dayExpense)}
              </p>
            </div>
          </div>

          {/* Pie chart (if has data) */}
          {dayGroupData.length > 0 && (
            <div className="flex justify-center mb-4">
              <div className="relative">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={dayGroupData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {dayGroupData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-gray-400">{dayTxs.length} GD</span>
                  <span className="text-sm font-bold">{formatMoneyShort(dayTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Transaction list for that day */}
          {dayTxs.length > 0 ? (
            <div className="px-4 space-y-2">
              {dayTxs.map((tx) => {
                const cat = getCategoryById(tx.categoryId);
                const isIncome = tx.type === 'income';
                return (
                  <div key={tx.id} className="flex items-center bg-dark-card rounded-xl px-4 py-3">
                    <span className="text-xl mr-3">{cat?.icon || '📝'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cat?.name || 'Khác'}</p>
                      <p className="text-xs text-gray-500">{cat?.group}</p>
                    </div>
                    <span className={`text-sm font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
                      {isIncome ? '+' : '-'}{formatMoney(tx.amount)}₫
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl block mb-3">📭</span>
              <p>Không có giao dịch ngày này</p>
            </div>
          )}
        </div>
      )}

      {/* TREND TAB */}
      {chartTab === 'trend' && (
        <div className="fade-in">
          <div className="px-4 py-3 text-center">
            <h2 className="text-base font-bold">Thu chi 6 tháng gần nhất</h2>
          </div>
          <div className="px-2">
            <div className="bg-dark-card rounded-xl p-4 mx-2">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={trendData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
                  <XAxis dataKey="name" tick={{ fill: '#8B8BA7', fontSize: 12 }} axisLine={false} />
                  <YAxis tick={{ fill: '#8B8BA7', fontSize: 10 }} axisLine={false} tickFormatter={formatMoneyShort} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" name="Thu" fill="#00C897" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Chi" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 px-2">
              {trendData.map((d, i) => (
                <div key={i} className="flex items-center bg-dark-card rounded-lg px-4 py-3 mb-2">
                  <span className="text-sm font-medium w-8 text-gray-400">{d.name}</span>
                  <div className="flex-1 flex justify-end gap-4">
                    <span className="text-xs text-income">+{formatMoneyShort(d.income)}</span>
                    <span className="text-xs text-expense">-{formatMoneyShort(d.expense)}</span>
                    <span className={`text-xs font-semibold w-16 text-right ${d.income - d.expense >= 0 ? 'text-income' : 'text-expense'}`}>
                      {formatMoneyShort(d.income - d.expense)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DAILY TAB - Heatmap calendar + detail */}
      {chartTab === 'daily' && (
        <div className="fade-in">
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => changeMonth(-1)} className="p-2 press-scale text-gray-400 active:text-white">
              <ArrowLeft />
            </button>
            <h2 className="text-base font-bold">{getMonthLabel(month)}</h2>
            <button onClick={() => changeMonth(1)} className="p-2 press-scale text-gray-400 active:text-white">
              <ArrowRight />
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-3 px-4 mb-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-700" />
              <span className="text-[10px] text-gray-500">Không chi</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-red-900/60" />
              <span className="text-[10px] text-gray-500">Ít</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-red-500" />
              <span className="text-[10px] text-gray-500">Nhiều</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm border border-income" />
              <span className="text-[10px] text-gray-500">Có thu</span>
            </div>
          </div>

          {/* Heatmap calendar */}
          <div className="px-4 mb-4">
            <div className="bg-dark-card rounded-xl p-3">
              {/* Weekday header */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((wd, i) => (
                  <div key={wd} className={`text-center text-[10px] font-medium py-0.5 ${i === 6 ? 'text-red-400' : 'text-gray-500'}`}>
                    {wd}
                  </div>
                ))}
              </div>
              {/* Calendar cells */}
              <div className="grid grid-cols-7 gap-1">
                {dailyCalendar.map((cell, i) => {
                  if (!cell) return <div key={`e-${i}`} />;
                  const intensity = maxDailyExpense > 0 ? cell.expense / maxDailyExpense : 0;
                  const isSelected = selectedDailyDate === cell.dateStr;
                  const isFuture = cell.dateStr > todayStr;

                  let bgColor;
                  if (isFuture) bgColor = 'rgba(42,42,62,0.3)';
                  else if (cell.expense === 0) bgColor = 'rgba(42,42,62,0.8)';
                  else {
                    const r = Math.round(80 + intensity * 175);
                    const g = Math.round(30 + (1 - intensity) * 20);
                    const b = Math.round(30 + (1 - intensity) * 20);
                    bgColor = `rgba(${r},${g},${b},${0.4 + intensity * 0.6})`;
                  }

                  return (
                    <button
                      key={cell.dateStr}
                      onClick={() => !isFuture && setSelectedDailyDate(cell.dateStr)}
                      disabled={isFuture}
                      className={`relative flex flex-col items-center justify-center py-2 rounded-lg transition-all press-scale ${
                        isSelected ? 'ring-2 ring-accent scale-105' : ''
                      } ${isFuture ? 'opacity-30' : ''}`}
                      style={{ backgroundColor: bgColor }}
                    >
                      <span className={`text-xs font-bold ${isSelected ? 'text-white' : isFuture ? 'text-gray-600' : 'text-gray-200'}`}>
                        {cell.day}
                      </span>
                      {cell.expense > 0 && (
                        <span className="text-[8px] text-gray-300 mt-0.5">
                          {formatMoneyShort(cell.expense)}
                        </span>
                      )}
                      {cell.income > 0 && (
                        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-income" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected day detail */}
          <div className="px-4">
            {(() => {
              const d = new Date(selectedDailyDate + 'T00:00:00');
              const weekday = d.toLocaleDateString('vi-VN', { weekday: 'long' });
              const formatted = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
              return (
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold">{getDateLabel(selectedDailyDate)}</p>
                    <p className="text-xs text-gray-500">{weekday}, {formatted}</p>
                  </div>
                  {selectedDayData && (
                    <div className="text-right">
                      {selectedDayData.income > 0 && (
                        <span className="text-xs text-income mr-2">+{formatMoneyShort(selectedDayData.income)}</span>
                      )}
                      <span className="text-xs text-expense">-{formatMoneyShort(selectedDayData.expense)}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {selectedDayData && selectedDayData.txs.length > 0 ? (
              <div className="space-y-2">
                {selectedDayData.txs.map((tx) => {
                  const cat = getCategoryById(tx.categoryId);
                  const isIncome = tx.type === 'income';
                  return (
                    <div key={tx.id} className="flex items-center bg-dark-card rounded-xl px-4 py-3">
                      <span className="text-xl mr-3">{cat?.icon || '📝'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{cat?.name || 'Khác'}</p>
                        <p className="text-xs text-gray-500">{cat?.group}</p>
                      </div>
                      <span className={`text-sm font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
                        {isIncome ? '+' : '-'}{formatMoney(tx.amount)}₫
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-3xl block mb-2">📭</span>
                <p className="text-sm">Không có giao dịch</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EVALUATION TAB */}
      {chartTab === 'eval' && (
        <div className="fade-in">
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => changeMonth(-1)} className="p-2 press-scale text-gray-400 active:text-white">
              <ArrowLeft />
            </button>
            <h2 className="text-base font-bold">{getMonthLabel(month)}</h2>
            <button onClick={() => changeMonth(1)} className="p-2 press-scale text-gray-400 active:text-white">
              <ArrowRight />
            </button>
          </div>
          {evaluation && (
            <div className="px-4 space-y-3">
              {/* Saving rate */}
              <div className="bg-dark-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Tỷ lệ tiết kiệm</span>
                  <span className={`text-2xl font-bold ${evaluation.savingRate >= 0 ? 'text-income' : 'text-expense'}`}>
                    {evaluation.savingRate.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-dark-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${evaluation.savingRate >= 0 ? 'bg-income' : 'bg-expense'}`}
                    style={{ width: `${Math.min(Math.abs(evaluation.savingRate), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {evaluation.savingRate >= 20
                    ? '🎉 Tuyệt vời! Bạn tiết kiệm tốt'
                    : evaluation.savingRate >= 0
                      ? '⚠️ Cố gắng tiết kiệm nhiều hơn nhé'
                      : '🚨 Chi nhiều hơn thu! Cần cắt giảm'}
                </p>
              </div>

              {/* vs last month */}
              <div className="bg-dark-card rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-3">So với {evaluation.prevMonth}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Chi tiêu</p>
                    <p className={`text-lg font-bold ${evaluation.expenseChange <= 0 ? 'text-income' : 'text-expense'}`}>
                      {evaluation.expenseChange > 0 ? '↑' : '↓'} {Math.abs(evaluation.expenseChange).toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {evaluation.expenseChange <= 0 ? 'Giảm chi 👍' : 'Tăng chi 😅'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Thu nhập</p>
                    <p className={`text-lg font-bold ${evaluation.incomeChange >= 0 ? 'text-income' : 'text-expense'}`}>
                      {evaluation.incomeChange >= 0 ? '↑' : '↓'} {Math.abs(evaluation.incomeChange).toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {evaluation.incomeChange >= 0 ? 'Tăng thu 👍' : 'Giảm thu 😅'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Daily average */}
              <div className="bg-dark-card rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-1">Chi trung bình / ngày</p>
                <p className="text-2xl font-bold text-expense">{formatMoney(Math.round(evaluation.dailyAvg))}₫</p>
              </div>

              {/* Top spending */}
              <div className="bg-dark-card rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-3">Top chi tiêu nhiều nhất</p>
                {evaluation.topGroups.length > 0 ? (
                  <div className="space-y-2">
                    {evaluation.topGroups.map(([name, amount], i) => (
                      <div key={name} className="flex items-center">
                        <span className="text-lg mr-2">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                        </span>
                        <span className="flex-1 text-sm">{name}</span>
                        <span className="text-sm font-semibold text-expense">{formatMoney(amount)}₫</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Chưa có dữ liệu</p>
                )}
              </div>

              {/* Tips */}
              <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                <p className="text-sm font-medium text-accent mb-2">💡 Gợi ý</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  {evaluation.savingRate < 20 && (
                    <li>• Cố gắng tiết kiệm ít nhất 20% thu nhập</li>
                  )}
                  {evaluation.topGroups[0] && (
                    <li>• &quot;{evaluation.topGroups[0][0]}&quot; chiếm nhiều nhất - xem lại có cắt giảm được không</li>
                  )}
                  {evaluation.expenseChange > 10 && (
                    <li>• Chi tiêu tăng so với tháng trước, nên kiểm soát hơn</li>
                  )}
                  {evaluation.savingRate >= 20 && (
                    <li>• Bạn đang quản lý tài chính rất tốt, hãy duy trì!</li>
                  )}
                  <li>• Ghi chép đều đặn mỗi ngày để theo dõi chính xác hơn</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================== TAB BAR - FIXED AT BOTTOM ======================== */}
      <div
        className="fixed left-0 right-0 z-30 bg-dark-bg border-t border-dark-border"
        style={{ bottom: 'calc(52px + env(safe-area-inset-bottom))' }}
      >
        <div className="flex max-w-lg mx-auto px-2 py-2 gap-1">
          {[
            { key: 'category', label: 'Danh mục', icon: '📋' },
            { key: 'trend', label: 'Xu hướng', icon: '📈' },
            { key: 'daily', label: 'Theo ngày', icon: '📅' },
            { key: 'eval', label: 'Đánh giá', icon: '⭐' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setChartTab(tab.key)}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-colors press-scale ${
                chartTab === tab.key
                  ? 'bg-accent/20 text-accent'
                  : 'text-gray-500 active:bg-dark-card'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
