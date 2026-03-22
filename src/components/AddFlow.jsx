'use client';

import { useState } from 'react';
import { db } from '../lib/db';
import { toDateStr, formatMoney } from '../lib/utils';
import { getCategoryById } from '../lib/categories';
import { syncToSheet } from '../lib/sheets';
import NumberPad from './NumberPad';
import CategoryGrid from './CategoryGrid';
import DatePicker from './DatePicker';

export default function AddFlow({ onClose, onSaved }) {
  const [step, setStep] = useState(0); // 0=type, 1=amount, 2=category, 3=date
  const [type, setType] = useState(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(null);
  const [date, setDate] = useState(toDateStr(new Date()));

  const handleTypeSelect = (t) => {
    setType(t);
    setStep(1);
  };

  const handleAmountNext = () => {
    setStep(2);
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setStep(3);
  };

  const handleDateSelect = async (d) => {
    setDate(d);
    // Save locally
    const tx = {
      type,
      amount: parseInt(amount, 10),
      categoryId: category.id,
      date: d,
      createdAt: Date.now(),
    };
    const id = await db.transactions.add(tx);
    // Sync to Google Sheets in background
    syncToSheet([{ ...tx, id }]).catch(() => {});
    onSaved?.();
    onClose();
  };

  const handleBack = () => {
    if (step === 0) onClose();
    else setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark-bg slide-up flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-dark-card">
        <button onClick={handleBack} className="text-gray-400 press-scale p-2">
          {step === 0 ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>
        <span className="text-sm text-gray-400">
          {step === 0 && 'Thêm giao dịch'}
          {step === 1 && 'Nhập số tiền'}
          {step === 2 && 'Chọn danh mục'}
          {step === 3 && 'Chọn ngày'}
        </span>
        {/* Step indicators */}
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full ${
                s <= step ? 'bg-accent' : 'bg-dark-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 fade-in">
            <p className="text-gray-400 text-lg">Bạn muốn ghi gì?</p>
            <button
              onClick={() => handleTypeSelect('expense')}
              className="w-full py-6 rounded-2xl bg-gradient-to-r from-red-500/20 to-red-600/20
                         border-2 border-expense/40 press-scale active:border-expense
                         flex flex-col items-center gap-2 transition-all"
            >
              <span className="text-4xl">💸</span>
              <span className="text-2xl font-bold text-expense">CHI TIÊU</span>
              <span className="text-sm text-gray-400">Tiền ra</span>
            </button>
            <button
              onClick={() => handleTypeSelect('income')}
              className="w-full py-6 rounded-2xl bg-gradient-to-r from-green-500/20 to-green-600/20
                         border-2 border-income/40 press-scale active:border-income
                         flex flex-col items-center gap-2 transition-all"
            >
              <span className="text-4xl">💰</span>
              <span className="text-2xl font-bold text-income">THU NHẬP</span>
              <span className="text-sm text-gray-400">Tiền vào</span>
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="flex-1 flex flex-col fade-in">
            <NumberPad
              value={amount}
              onChange={setAmount}
              onNext={handleAmountNext}
              type={type}
            />
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col fade-in overflow-hidden">
            <CategoryGrid type={type} onSelect={handleCategorySelect} />
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col fade-in overflow-hidden">
            <DatePicker value={date} onSelect={handleDateSelect} />
          </div>
        )}
      </div>
    </div>
  );
}
