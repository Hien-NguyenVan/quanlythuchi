'use client';

const mainTabs = [
  { id: 'home', label: 'Tổng quan', icon: '🏠' },
  { id: 'chart', label: 'Biểu đồ', icon: '📊' },
  { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
];

const chartTabs = [
  { key: 'category', label: 'Danh mục', icon: '📋' },
  { key: 'trend', label: 'Xu hướng', icon: '📈' },
  { key: 'daily', label: 'Theo ngày', icon: '📅' },
  { key: 'eval', label: 'Đánh giá', icon: '⭐' },
];

export default function BottomNav({ active, onChange, chartTab, onChartTabChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border z-40"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-lg mx-auto">
        {/* Chart sub-tabs - only when on chart screen */}
        {active === 'chart' && (
          <>
            <div className="flex px-2 pt-1.5 pb-1.5 gap-1">
              {chartTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => onChartTabChange?.(tab.key)}
                  className={`flex-1 flex flex-col items-center py-1.5 rounded-xl transition-colors press-scale ${
                    chartTab === tab.key
                      ? 'bg-accent/20 text-accent'
                      : 'text-gray-500 active:bg-dark-border'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="text-[9px] mt-0.5 font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="border-t border-dark-border/50" />
          </>
        )}

        {/* Main tabs */}
        <div className="flex">
          {mainTabs.map((tab) => (
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
    </div>
  );
}
