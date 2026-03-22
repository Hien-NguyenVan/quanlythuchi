'use client';

import { db } from '../lib/db';
import { getCategoryById } from '../lib/categories';

export default function SettingsScreen() {
  const handleExportCSV = async () => {
    const txs = await db.transactions.orderBy('date').reverse().toArray();
    if (txs.length === 0) {
      alert('Chưa có dữ liệu để xuất!');
      return;
    }

    const header = 'Ngày,Loại,Danh mục,Nhóm,Số tiền\n';
    const rows = txs.map((tx) => {
      const cat = getCategoryById(tx.categoryId);
      return `${tx.date},${tx.type === 'income' ? 'Thu' : 'Chi'},${cat?.name || 'Khác'},${cat?.group || ''},${tx.amount}`;
    }).join('\n');

    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thuchi_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = async () => {
    if (confirm('Bạn có chắc muốn XÓA TẤT CẢ dữ liệu? Hành động này không thể hoàn tác!')) {
      if (confirm('Thật sự xóa hết?')) {
        await db.transactions.clear();
        alert('Đã xóa tất cả dữ liệu!');
      }
    }
  };

  const handleExportJSON = async () => {
    const txs = await db.transactions.toArray();
    const blob = new Blob([JSON.stringify(txs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thuchi_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!Array.isArray(data)) throw new Error('Invalid');
        await db.transactions.bulkPut(data);
        alert(`Đã nhập ${data.length} giao dịch!`);
      } catch {
        alert('File không hợp lệ!');
      }
    };
    input.click();
  };

  return (
    <div className="pb-24 px-4">
      <h2 className="text-lg font-bold py-4">Cài đặt</h2>

      <div className="space-y-3">
        {/* Export CSV */}
        <button
          onClick={handleExportCSV}
          className="w-full bg-dark-card rounded-xl p-4 flex items-center press-scale active:bg-dark-border transition-colors"
        >
          <span className="text-2xl mr-4">📊</span>
          <div className="text-left">
            <p className="text-sm font-medium">Xuất file CSV</p>
            <p className="text-xs text-gray-500">Mở được bằng Excel, Google Sheets</p>
          </div>
        </button>

        {/* Backup JSON */}
        <button
          onClick={handleExportJSON}
          className="w-full bg-dark-card rounded-xl p-4 flex items-center press-scale active:bg-dark-border transition-colors"
        >
          <span className="text-2xl mr-4">💾</span>
          <div className="text-left">
            <p className="text-sm font-medium">Sao lưu dữ liệu</p>
            <p className="text-xs text-gray-500">Xuất file JSON để backup</p>
          </div>
        </button>

        {/* Import JSON */}
        <button
          onClick={handleImportJSON}
          className="w-full bg-dark-card rounded-xl p-4 flex items-center press-scale active:bg-dark-border transition-colors"
        >
          <span className="text-2xl mr-4">📥</span>
          <div className="text-left">
            <p className="text-sm font-medium">Khôi phục dữ liệu</p>
            <p className="text-xs text-gray-500">Nhập file JSON đã backup</p>
          </div>
        </button>

        {/* Info */}
        <div className="bg-dark-card rounded-xl p-4">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-4">ℹ️</span>
            <p className="text-sm font-medium">Thông tin</p>
          </div>
          <div className="text-xs text-gray-500 space-y-1 pl-12">
            <p>• Dữ liệu lưu trên thiết bị của bạn</p>
            <p>• Không gửi lên server nào</p>
            <p>• Nhớ sao lưu thường xuyên</p>
            <p>• Xóa cache trình duyệt sẽ mất dữ liệu</p>
          </div>
        </div>

        {/* Clear */}
        <button
          onClick={handleClearAll}
          className="w-full bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center press-scale"
        >
          <span className="text-2xl mr-4">🗑️</span>
          <div className="text-left">
            <p className="text-sm font-medium text-red-400">Xóa tất cả dữ liệu</p>
            <p className="text-xs text-gray-500">Không thể hoàn tác</p>
          </div>
        </button>
      </div>

      <p className="text-center text-xs text-gray-600 mt-8">
        Quản Lý Thu Chi v1.0 • Made with ❤️
      </p>
    </div>
  );
}
