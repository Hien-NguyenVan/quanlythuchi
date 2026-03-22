'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { formatMoney, getMonthLabel } from '../lib/utils';

export default function Summary({ month, onPrev, onNext }) {
  const stats = useLiveQuery(async () => {
    const txs = await db.transactions.where('date').startsWith(month).toArray();
    let income = 0;
    let expense = 0;
    txs.forEach((tx) => {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    });
    return { income, expense, balance: income - expense, count: txs.length };
  }, [month]);

  if (!stats) return null;

  return (
    <div className="px-4 pt-2 pb-4">
      {/* Month selector */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onPrev} className="p-2 press-scale text-gray-400 active:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-bold">{getMonthLabel(month)}</h2>
        <button onClick={onNext} className="p-2 press-scale text-gray-400 active:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-dark-card rounded-xl p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Thu nhập</p>
          <p className="text-sm font-bold text-income">+{formatMoney(stats.income)}</p>
        </div>
        <div className="bg-dark-card rounded-xl p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Chi tiêu</p>
          <p className="text-sm font-bold text-expense">-{formatMoney(stats.expense)}</p>
        </div>
        <div className="bg-dark-card rounded-xl p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Số dư</p>
          <p className={`text-sm font-bold ${stats.balance >= 0 ? 'text-income' : 'text-expense'}`}>
            {stats.balance >= 0 ? '+' : ''}{formatMoney(stats.balance)}
          </p>
        </div>
      </div>
    </div>
  );
}
