'use client';

const tabs = [
  { id: 'home', label: 'Tổng quan', icon: '🏠' },
  { id: 'chart', label: 'Biểu đồ', icon: '📊' },
  { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
];

export default function BottomNav({ active, onChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border z-40"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex max-w-lg mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex flex-col items-center py-2 transition-colors press-scale ${
              active === tab.id ? 'text-accent' : 'text-gray-500'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] mt-0.5">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
