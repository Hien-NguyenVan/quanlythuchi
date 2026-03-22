'use client';

import { formatMoney } from '../lib/utils';

export default function NumberPad({ value, onChange, onNext, type }) {
  const handlePress = (key) => {
    if (key === 'del') {
      onChange(value.slice(0, -1));
    } else if (key === '000') {
      if (value.length > 0 && value.length < 12) onChange(value + '000');
    } else {
      if (value.length < 12) onChange(value + key);
    }
  };

  const amount = parseInt(value || '0', 10);
  const isValid = amount > 0;
  const isIncome = type === 'income';

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'del'];

  return (
    <div className="flex flex-col h-full">
      {/* Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
        <p className="text-sm text-gray-400 mb-2">
          {isIncome ? 'Số tiền thu' : 'Số tiền chi'}
        </p>
        <div className="text-4xl font-bold tracking-tight">
          <span className={isIncome ? 'text-income' : 'text-expense'}>
            {isIncome ? '+' : '-'}
          </span>
          <span className="text-white ml-1">
            {formatMoney(amount)}
          </span>
          <span className="text-gray-500 text-2xl ml-1">₫</span>
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-[1px] bg-dark-border">
        {keys.map((key) => (
          <button
            key={key}
            onClick={() => handlePress(key)}
            className="bg-dark-card h-14 flex items-center justify-center text-xl font-medium
                       active:bg-dark-border transition-colors press-scale"
          >
            {key === 'del' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414A2 2 0 0110.828 5H21a1 1 0 011 1v12a1 1 0 01-1 1H10.828a2 2 0 01-1.414-.586L3 12z" />
              </svg>
            ) : (
              <span className="text-white">{key}</span>
            )}
          </button>
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={onNext}
        disabled={!isValid}
        className={`h-14 text-lg font-semibold transition-all ${
          isValid
            ? (isIncome ? 'bg-income' : 'bg-expense') + ' text-white active:opacity-80'
            : 'bg-dark-border text-gray-600'
        }`}
      >
        TIẾP TỤC →
      </button>
    </div>
  );
}
