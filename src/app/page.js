'use client';

import { useState, useCallback } from 'react';
import Summary from '../components/Summary';
import TransactionList from '../components/TransactionList';
import ChartScreen from '../components/ChartScreen';
import SettingsScreen from '../components/SettingsScreen';
import BottomNav from '../components/BottomNav';
import AddFlow from '../components/AddFlow';

export default function Home() {
  const [tab, setTab] = useState('home');
  const [showAdd, setShowAdd] = useState(false);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const changeMonth = (dir) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleSaved = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-dark-bg relative">
      {/* Safe area top */}
      <div style={{ paddingTop: 'env(safe-area-inset-top)' }} />

      {/* Home tab */}
      {tab === 'home' && (
        <div className="pb-24 hide-scrollbar" key={refreshKey}>
          <div className="px-4 pt-4 pb-2">
            <h1 className="text-xl font-bold">💰 Thu Chi</h1>
          </div>
          <Summary
            month={month}
            onPrev={() => changeMonth(-1)}
            onNext={() => changeMonth(1)}
          />
          <TransactionList month={month} />
        </div>
      )}

      {/* Chart tab */}
      {tab === 'chart' && <ChartScreen key={refreshKey} />}

      {/* Settings tab */}
      {tab === 'settings' && <SettingsScreen />}

      {/* FAB - hidden on settings, higher on chart */}
      {tab !== 'settings' && (
        <button
          onClick={() => setShowAdd(true)}
          className={`fixed right-4 w-14 h-14 bg-accent rounded-full
                     flex items-center justify-center text-2xl shadow-lg shadow-accent/30
                     active:scale-90 transition-transform z-40 ${
                       tab === 'chart' ? 'bottom-32' : 'bottom-20'
                     }`}
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          ＋
        </button>
      )}

      {/* Bottom nav */}
      <BottomNav active={tab} onChange={setTab} />

      {/* Add flow modal */}
      {showAdd && (
        <AddFlow
          onClose={() => setShowAdd(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
