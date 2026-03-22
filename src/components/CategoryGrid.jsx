'use client';

import { getGroupedCategories } from '../lib/categories';

export default function CategoryGrid({ type, onSelect }) {
  const groups = getGroupedCategories(type);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 text-center">
        <p className="text-sm text-gray-400">Chọn danh mục</p>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-6 px-3">
        {Object.entries(groups).map(([groupName, cats]) => (
          <div key={groupName} className="mb-4">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider px-2 mb-2">
              {groupName}
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {cats.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelect(cat)}
                  className="flex flex-col items-center py-3 px-1 rounded-xl
                             bg-dark-card active:bg-dark-border transition-colors press-scale"
                >
                  <span className="text-2xl mb-1">{cat.icon}</span>
                  <span className="text-[10px] text-gray-300 leading-tight text-center truncate w-full">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
