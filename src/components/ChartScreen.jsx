'use client';

import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { getCategoryById, expenseCategories, incomeCategories } from '../lib/categories';
import { formatMoney, formatMoneyShort, getMonthLabel } from '../lib/utils';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend
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

export default function ChartScreen() {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [viewType, setViewType] = useState('expense'); // expense | income
  const [chartTab, setChartTab] = useState('category'); // category | trend | compare

  const monthTxs = useLiveQuery(
    () => db.transactions.where('date').startsWith(month).toArray(),
    [month]
  );

  const allTxs = useLiveQuery(() => db.transactions.toArray());

  const months = useMemo(() => getRecentMonths(MONTHS_BACK), []);

  // --- Category breakdown ---
  const categoryData = useMemo(() => {
    if (!monthTxs) return [];
    const map = {};
    monthTxs
      .filter((tx) => tx.type === viewType)
      .forEach((tx) => {
        const cat = getCategoryById(tx.categoryId);
        const key = cat?.group || 'Khác';
        if (!map[key]) map[key] = { name: key, value: 0, color: cat?.color || '#888' };
        map[key].value += tx.amount;
      });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [monthTxs, viewType]);

  const categoryDetail = useMemo(() => {
    if (!monthTxs) return [];
    const map = {};
    monthTxs
      .filter((tx) => tx.type === viewType)
      .forEach((tx) => {
        const cat = getCategoryById(tx.categoryId);
        const key = tx.categoryId;
        if (!map[key]) map[key] = { id: key, name: cat?.name || 'Khác', icon: cat?.icon || '📝', value: 0, color: cat?.color || '#888' };
        map[key].value += tx.amount;
      });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [monthTxs, viewType]);

  const totalAmount = categoryData.reduce((s, d) => s + d.value, 0);

  // --- Trend data (6 months) ---
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

  // --- Daily spending in month ---
  const dailyData = useMemo(() => {
    if (!monthTxs) return [];
    const map = {};
    monthTxs
      .filter((tx) => tx.type === viewType)
      .forEach((tx) => {
        const day = parseInt(tx.date.split('-')[2]);
        map[day] = (map[day] || 0) + tx.amount;
      });
    const [y, m] = month.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const result = [];
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ name: d, value: map[d] || 0 });
    }
    return result;
  }, [monthTxs, viewType, month]);

  // --- Evaluation ---
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

    // Top spending categories
    const catMap = {};
    currentTxs.filter((t) => t.type === 'expense').forEach((tx) => {
      const cat = getCategoryById(tx.categoryId);
      const key = cat?.group || 'Khác';
      catMap[key] = (catMap[key] || 0) + tx.amount;
    });
    const topGroups = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

    // Daily average
    const daysWithTxs = new Set(currentTxs.filter((t) => t.type === 'expense').map((t) => t.date)).size;
    const dailyAvg = daysWithTxs > 0 ? curExpense / daysWithTxs : 0;

    return {
      curExpense, prevExpense, curIncome, prevIncome,
      expenseChange, incomeChange, savingRate,
      topGroups, dailyAvg, prevMonth: getMonthLabel(prevMonth),
    };
  }, [allTxs, month]);

  const changeMonth = (dir) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div className="pb-24 hide-scrollbar">
      {/* Month selector */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => changeMonth(-1)} className="p-2 press-scale text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-bold">{getMonthLabel(month)}</h2>
        <button onClick={() => changeMonth(1)} className="p-2 press-scale text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Chart tabs */}
      <div className="flex px-4 gap-2 mb-4">
        {[
          { key: 'category', label: 'Danh mục' },
          { key: 'trend', label: 'Xu hướng' },
          { key: 'daily', label: 'Theo ngày' },
          { key: 'eval', label: 'Đánh giá' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setChartTab(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors press-scale ${
              chartTab === tab.key
                ? 'bg-accent text-white'
                : 'bg-dark-card text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Type toggle for category/daily */}
      {(chartTab === 'category' || chartTab === 'daily') && (
        <div className="flex px-4 gap-2 mb-4">
          <button
            onClick={() => setViewType('expense')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewType === 'expense' ? 'bg-expense/20 text-expense border border-expense/40' : 'bg-dark-card text-gray-500'
            }`}
          >
            Chi tiêu
          </button>
          <button
            onClick={() => setViewType('income')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewType === 'income' ? 'bg-income/20 text-income border border-income/40' : 'bg-dark-card text-gray-500'
            }`}
          >
            Thu nhập
          </button>
        </div>
      )}

      {/* CATEGORY TAB */}
      {chartTab === 'category' && (
        <div className="fade-in">
          {categoryData.length > 0 ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <ResponsiveContainer width={220} height={220}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-gray-400">Tổng</span>
                    <span className="text-lg font-bold">{formatMoneyShort(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Category detail list */}
              <div className="px-4 space-y-2">
                {categoryDetail.map((cat) => (
                  <div key={cat.id} className="flex items-center bg-dark-card rounded-xl px-4 py-3">
                    <span className="text-xl mr-3">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium truncate">{cat.name}</span>
                        <span className="text-sm font-semibold">{formatMoney(cat.value)}₫</span>
                      </div>
                      <div className="w-full h-1.5 bg-dark-border rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(cat.value / totalAmount * 100).toFixed(0)}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 ml-3 w-10 text-right">
                      {(cat.value / totalAmount * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <span className="text-4xl block mb-3">📊</span>
              <p>Chưa có dữ liệu</p>
            </div>
          )}
        </div>
      )}

      {/* TREND TAB */}
      {chartTab === 'trend' && (
        <div className="fade-in px-2">
          <div className="bg-dark-card rounded-xl p-4 mx-2">
            <p className="text-xs text-gray-500 mb-3 text-center">Thu chi 6 tháng gần nhất</p>
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

          {/* Monthly summary table */}
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
      )}

      {/* DAILY TAB */}
      {chartTab === 'daily' && (
        <div className="fade-in px-2">
          <div className="bg-dark-card rounded-xl p-4 mx-2">
            <p className="text-xs text-gray-500 mb-3 text-center">
              {viewType === 'expense' ? 'Chi tiêu' : 'Thu nhập'} theo ngày
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#8B8BA7', fontSize: 9 }}
                  axisLine={false}
                  interval={4}
                />
                <YAxis tick={{ fill: '#8B8BA7', fontSize: 10 }} axisLine={false} tickFormatter={formatMoneyShort} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  name={viewType === 'expense' ? 'Chi' : 'Thu'}
                  fill={viewType === 'expense' ? '#FF6B6B' : '#00C897'}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* EVALUATION TAB */}
      {chartTab === 'eval' && evaluation && (
        <div className="fade-in px-4 space-y-3">
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

          {/* Expense change vs last month */}
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
                <li>• "{evaluation.topGroups[0][0]}" chiếm nhiều nhất - xem lại có cắt giảm được không</li>
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
  );
}
