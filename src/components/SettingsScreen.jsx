'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { getCategoryById } from '../lib/categories';
import { getSheetUrl, setSheetUrl, syncToSheet, fetchFromSheet } from '../lib/sheets';

export default function SettingsScreen() {
  const [sheetUrl, setSheetUrlState] = useState('');
  const [syncStatus, setSyncStatus] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    setSheetUrlState(getSheetUrl() || '');
  }, []);

  const handleSaveUrl = () => {
    setSheetUrl(sheetUrl);
    setSyncStatus('✅ Đã lưu URL');
    setTimeout(() => setSyncStatus(''), 2000);
  };

  const handleDisconnect = () => {
    setSheetUrl(null);
    setSheetUrlState('');
    setSyncStatus('Đã ngắt kết nối');
    setTimeout(() => setSyncStatus(''), 2000);
  };

  const handleSyncUp = async () => {
    if (!getSheetUrl()) {
      setSyncStatus('⚠️ Chưa cài URL Google Sheets');
      return;
    }
    setSyncStatus('⏳ Đang đẩy dữ liệu lên...');
    const txs = await db.transactions.toArray();
    const result = await syncToSheet(txs);
    if (result?.error) {
      setSyncStatus('❌ Lỗi: ' + result.error);
    } else {
      setSyncStatus(`✅ Đã đẩy lên! (${result?.added || 0} mới)`);
    }
    setTimeout(() => setSyncStatus(''), 3000);
  };

  const handleSyncDown = async () => {
    if (!getSheetUrl()) {
      setSyncStatus('⚠️ Chưa cài URL Google Sheets');
      return;
    }
    setSyncStatus('⏳ Đang tải về...');
    const result = await fetchFromSheet();
    if (result?.error) {
      setSyncStatus('❌ Lỗi: ' + result.error);
      return;
    }
    const txs = result?.transactions || [];
    if (txs.length === 0) {
      setSyncStatus('📭 Sheet trống, không có gì để tải');
      setTimeout(() => setSyncStatus(''), 3000);
      return;
    }
    // Merge into local DB
    let added = 0;
    for (const tx of txs) {
      const exists = await db.transactions.get(tx.id);
      if (!exists) {
        await db.transactions.put(tx);
        added++;
      }
    }
    setSyncStatus(`✅ Đã tải về! (${added} mới, tổng ${txs.length})`);
    setTimeout(() => setSyncStatus(''), 3000);
  };

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

  const handleClearAll = async () => {
    if (confirm('Bạn có chắc muốn XÓA TẤT CẢ dữ liệu? Hành động này không thể hoàn tác!')) {
      if (confirm('Thật sự xóa hết?')) {
        await db.transactions.clear();
        alert('Đã xóa tất cả dữ liệu!');
      }
    }
  };

  const isConnected = !!getSheetUrl();

  return (
    <div className="pb-24 px-4 hide-scrollbar">
      <h2 className="text-lg font-bold py-4">Cài đặt</h2>

      <div className="space-y-3">
        {/* Google Sheets Section */}
        <div className="bg-dark-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📗</span>
              <div>
                <p className="text-sm font-medium">Google Sheets</p>
                <p className={`text-xs ${isConnected ? 'text-income' : 'text-gray-500'}`}>
                  {isConnected ? '● Đã kết nối' : '○ Chưa kết nối'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSetup(!showSetup)}
              className="text-xs text-accent px-3 py-1 rounded-full bg-accent/10 press-scale"
            >
              {showSetup ? 'Ẩn' : 'Cài đặt'}
            </button>
          </div>

          {showSetup && (
            <div className="space-y-3 mt-3 pt-3 border-t border-dark-border fade-in">
              <p className="text-xs text-gray-400 leading-relaxed">
                Lưu data lên Google Sheets để không bao giờ mất.
                Xem file <span className="text-accent">google-apps-script.js</span> trong repo để biết cách cài đặt.
              </p>

              {/* Steps summary */}
              <div className="bg-dark-bg rounded-lg p-3 space-y-2 text-xs text-gray-400">
                <p>1️⃣ Tạo Google Sheet mới</p>
                <p>2️⃣ Sheet tên "transactions", header: id, type, categoryId, amount, date, createdAt</p>
                <p>3️⃣ Extensions → Apps Script → paste code</p>
                <p>4️⃣ Deploy → Web app → Anyone → Copy URL</p>
                <p>5️⃣ Dán URL vào ô bên dưới</p>
              </div>

              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrlState(e.target.value)}
                placeholder="Paste URL Apps Script vào đây..."
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5
                           text-sm text-white placeholder-gray-600 outline-none focus:border-accent"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleSaveUrl}
                  className="flex-1 bg-accent text-white text-sm py-2 rounded-lg press-scale active:opacity-80"
                >
                  Lưu URL
                </button>
                {isConnected && (
                  <button
                    onClick={handleDisconnect}
                    className="px-4 bg-dark-border text-gray-400 text-sm py-2 rounded-lg press-scale"
                  >
                    Ngắt
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Sync buttons - always visible if connected */}
          {isConnected && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-dark-border">
              <button
                onClick={handleSyncUp}
                className="flex-1 bg-income/15 border border-income/30 text-income text-xs py-2.5 rounded-lg press-scale active:opacity-80"
              >
                ⬆️ Đẩy lên Sheet
              </button>
              <button
                onClick={handleSyncDown}
                className="flex-1 bg-accent/15 border border-accent/30 text-accent text-xs py-2.5 rounded-lg press-scale active:opacity-80"
              >
                ⬇️ Tải về máy
              </button>
            </div>
          )}

          {syncStatus && (
            <p className="text-xs text-center mt-2 text-gray-300 fade-in">{syncStatus}</p>
          )}
        </div>

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
            <p>• Dữ liệu lưu trên thiết bị + Google Sheets</p>
            <p>• Mỗi lần thêm giao dịch tự đẩy lên Sheet</p>
            <p>• Đổi máy → kết nối Sheet → Tải về máy</p>
            <p>• Sheet cũng là bản backup vĩnh viễn</p>
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
            <p className="text-xs text-gray-500">Chỉ xóa trên máy, Sheet không ảnh hưởng</p>
          </div>
        </button>
      </div>

      <p className="text-center text-xs text-gray-600 mt-8">
        Quản Lý Thu Chi v1.0
      </p>
    </div>
  );
}
