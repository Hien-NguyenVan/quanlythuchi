'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { getCategoryById } from '../lib/categories';
import { formatMoney, getDateLabel } from '../lib/utils';
import { deleteFromSheet } from '../lib/sheets';

export default function TransactionList({ month }) {
  const transactions = useLiveQuery(async () => {
    const all = await db.transactions
      .where('date')
      .startsWith(month)
      .reverse()
      .sortBy('date');
    return all.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  }, [month]);

  const handleDelete = async (id) => {
    await db.transactions.delete(id);
    deleteFromSheet(id).catch(() => {});
  };

  if (!transactions) return null;

  // Group by date
  const grouped = {};
  transactions.forEach((tx) => {
    if (!grouped[tx.date]) grouped[tx.date] = [];
    grouped[tx.date].push(tx);
  });

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <span className="text-5xl mb-4">📭</span>
        <p>Chưa có giao dịch nào</p>
        <p className="text-sm mt-1">Nhấn + để thêm</p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4">
      {Object.entries(grouped).map(([date, txs]) => {
        const dayTotal = txs.reduce((sum, tx) => {
          return sum + (tx.type === 'income' ? tx.amount : -tx.amount);
        }, 0);

        return (
          <div key={date} className="mb-4">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-xs text-gray-500 font-medium">{getDateLabel(date)}</span>
              <span className={`text-xs font-medium ${dayTotal >= 0 ? 'text-income' : 'text-expense'}`}>
                {dayTotal >= 0 ? '+' : ''}{formatMoney(dayTotal)}₫
              </span>
            </div>
            <div className="bg-dark-card rounded-xl overflow-hidden divide-y divide-dark-border">
              {txs.map((tx) => {
                const cat = getCategoryById(tx.categoryId);
                const isIncome = tx.type === 'income';

                return (
                  <div
                    key={tx.id}
                    className="flex items-center px-4 py-3 active:bg-dark-border transition-colors"
                    onClick={() => {
                      if (confirm('Xóa giao dịch này?')) handleDelete(tx.id);
                    }}
                  >
                    <span className="text-2xl mr-3">{cat?.icon || '📝'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {cat?.name || 'Khác'}
                      </p>
                      <p className="text-xs text-gray-500">{cat?.group}</p>
                    </div>
                    <span className={`text-sm font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
                      {isIncome ? '+' : '-'}{formatMoney(tx.amount)}₫
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
