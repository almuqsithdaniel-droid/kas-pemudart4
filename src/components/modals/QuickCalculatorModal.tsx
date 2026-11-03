import React, { useState } from 'react';
import { formatRupiah } from '../../utils/formatters';
import { X, Calculator, Delete } from 'lucide-react';

interface QuickCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyResult?: (result: number) => void;
}

export const QuickCalculatorModal: React.FC<QuickCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyResult,
}) => {
  const [display, setDisplay] = useState<string>('0');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [clearOnNext, setClearOnNext] = useState<boolean>(false);

  // Cash change helper
  const [totalBill, setTotalBill] = useState<number>(0);
  const [cashTendered, setCashTendered] = useState<number>(0);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (display === '0' || clearOnNext) {
      setDisplay(digit);
      setClearOnNext(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    if (prevVal === null) {
      setPrevVal(current);
    } else if (operation) {
      const result = calculate(prevVal, current, operation);
      setPrevVal(result);
      setDisplay(String(result));
    }
    setOperation(op);
    setClearOnNext(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  };

  const handleEqual = () => {
    if (prevVal !== null && operation) {
      const current = parseFloat(display);
      const result = calculate(prevVal, current, operation);
      setDisplay(String(result));
      setPrevVal(null);
      setOperation(null);
      setClearOnNext(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevVal(null);
    setOperation(null);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const currentDisplayNum = parseFloat(display) || 0;
  const changeDue = Math.max(0, cashTendered - totalBill);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Kalkulator Kasir & Kembalian
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calculator Display */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 text-right">
          <div className="text-[11px] font-mono text-slate-400 h-4">
            {prevVal !== null ? `${prevVal} ${operation}` : ''}
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white overflow-x-auto">
            {display}
          </div>
          <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            ≈ {formatRupiah(currentDisplayNum)}
          </div>
        </div>

        {/* Calculator Keypad */}
        <div className="p-4 grid grid-cols-4 gap-2">
          <button
            onClick={handleClear}
            className="p-3 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg hover:bg-rose-100 transition-colors"
          >
            C
          </button>
          <button
            onClick={handleBackspace}
            className="p-3 flex items-center justify-center text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOperation('÷')}
            className="p-3 text-sm font-bold text-emerald-600 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
          >
            ÷
          </button>
          <button
            onClick={() => handleOperation('×')}
            className="p-3 text-sm font-bold text-emerald-600 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
          >
            ×
          </button>

          {['7', '8', '9'].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="p-3 text-base font-semibold font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleOperation('-')}
            className="p-3 text-sm font-bold text-emerald-600 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
          >
            -
          </button>

          {['4', '5', '6'].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="p-3 text-base font-semibold font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleOperation('+')}
            className="p-3 text-sm font-bold text-emerald-600 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
          >
            +
          </button>

          {['1', '2', '3'].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="p-3 text-base font-semibold font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {d}
            </button>
          ))}
          <button
            onClick={handleEqual}
            className="row-span-2 p-3 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center transition-colors shadow-xs"
          >
            =
          </button>

          <button
            onClick={() => handleDigit('0')}
            className="p-3 text-base font-semibold font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 rounded-lg hover:bg-slate-100"
          >
            0
          </button>
          <button
            onClick={() => handleDigit('000')}
            className="p-3 text-xs font-semibold font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 rounded-lg hover:bg-slate-100"
          >
            000
          </button>
          <button
            onClick={() => {
              if (!display.includes('.')) handleDigit('.');
            }}
            className="p-3 text-base font-semibold font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 rounded-lg hover:bg-slate-100"
          >
            .
          </button>
        </div>

        {/* Cashier Change Calculator Helper */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
            Hitung Uang Kembalian Cepat:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Total Belanja:</span>
              <button
                type="button"
                onClick={() => setTotalBill(currentDisplayNum)}
                className="w-full text-left font-mono font-bold px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
              >
                {formatRupiah(totalBill)}
              </button>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Uang Diterima:</span>
              <button
                type="button"
                onClick={() => setCashTendered(currentDisplayNum)}
                className="w-full text-left font-mono font-bold px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-emerald-600 dark:text-emerald-400"
              >
                {formatRupiah(cashTendered)}
              </button>
            </div>
          </div>
          {totalBill > 0 && cashTendered > 0 && (
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-800 flex justify-between items-center text-xs">
              <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                Kembalian:
              </span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                {formatRupiah(changeDue)}
              </span>
            </div>
          )}
        </div>

        {onApplyResult && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => {
                onApplyResult(currentDisplayNum);
                onClose();
              }}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            >
              Gunakan Hasil ({formatRupiah(currentDisplayNum)})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
