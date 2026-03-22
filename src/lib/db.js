import Dexie from 'dexie';

export const db = new Dexie('ThuChiDB');

db.version(1).stores({
  transactions: '++id, type, categoryId, date, amount, createdAt',
});
