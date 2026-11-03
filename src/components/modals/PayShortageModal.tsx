import React, { useState } from 'react';
import { useCashBook } from '../../context/CashBookContext';
import { KasShortage } from '../../types';
import { formatRupiah, parseNumberInput } from '../../utils/formatters';
import { X, CheckCircle, DollarSign } from 'lucide-react';

interface PayShortageModalProps {
  shortage: KasShortage | null;
  onClose: () => void;
}

export const PayShortageModal: React.FC<PayShortageModalProps> = ({ shortage, onClose }) => {
  const { payShortage } = useCashBook();

  const [paymentAmountStr, setPaymentAmountStr] = useState<string>(
    shortage ? String(shortage.remainingAmount) : ''
  );
  const [autoRecord, setAutoRecord] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!shortage) return null;

  const paymentAmount = parseNumberInput(paymentAmountStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) {
      setErrorMsg('Nominal bayar harus lebih dari Rp 0');
      return;
    }

    if (paymentAmount > shortage.remainingAmount) {
      setErrorMsg(`Nominal melebihi sisa kekurangan (${formatRupiah(shortage.remainingAmount)})`);
      return;
    }

    payShortage(shortage.id, paymentAmount, autoRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden transition-all">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Bayar Kekurangan Kas
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-2.5 text-xs text-rose-700 bg-rose-50 rounded-lg border border-rose-200">
              {errorMsg}
            </div>
          )}

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Nama Anggota:</span>
              <span className="font-bold text-slate-900 dark:text-white">{shortage.personName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Keperluan / Periode:</span>
              <span className="text-slate-800 dark:text-slate-200">{shortage.period}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Sisa Kekurangan:</span>
              <span className="font-mono text-amber-600 dark:text-amber-400">
                {formatRupiah(shortage.remainingAmount)}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                Nominal Yang Disetor Sekarang (Rp) *
              </label>
              <button
                type="button"
                onClick={() => setPaymentAmountStr(String(shortage.remainingAmount))}
                className="text-[11px] text-emerald-600 hover:underline font-semibold"
              >
                Bayar Lunas
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={paymentAmountStr ? Number(paymentAmountStr).toLocaleString('id-ID') : ''}
                onChange={(e) => setPaymentAmountStr(String(parseNumberInput(e.target.value)))}
                placeholder="0"
                className="w-full pl-11 pr-4 py-2 text-sm font-bold font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <label className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRecord}
              onChange={(e) => setAutoRecord(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-[11px] text-emerald-900 dark:text-emerald-300 font-medium">
              Otomatis catat uang ini ke <strong>Kas Masuk</strong> buku kas
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              Simpan Pembayaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
