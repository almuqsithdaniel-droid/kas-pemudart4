import React, { useState } from 'react';
import { useCashBook } from '../../context/CashBookContext';
import { parseNumberInput } from '../../utils/formatters';
import { X, AlertCircle, User, Phone, Calendar, DollarSign, FileText } from 'lucide-react';

interface ShortageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortageModal: React.FC<ShortageModalProps> = ({ isOpen, onClose }) => {
  const { members, addShortage, profile } = useCashBook();

  const [personName, setPersonName] = useState<string>('');
  const [personPhone, setPersonPhone] = useState<string>('');
  const [period, setPeriod] = useState<string>(
    `Iuran Kas ${new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date())}`
  );
  const [targetAmountStr, setTargetAmountStr] = useState<string>(
    String(profile.monthlyFee || 15000)
  );
  const [paidAmountStr, setPaidAmountStr] = useState<string>('0');
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const targetAmount = parseNumberInput(targetAmountStr);
  const paidAmount = parseNumberInput(paidAmountStr);
  const remaining = Math.max(0, targetAmount - paidAmount);

  const handleSelectMember = (name: string) => {
    setPersonName(name);
    const m = members.find((item) => item.name.toLowerCase() === name.toLowerCase());
    if (m && m.phone) {
      setPersonPhone(m.phone);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) {
      setErrorMsg('Nama orang wajib diisi');
      return;
    }

    if (targetAmount <= 0) {
      setErrorMsg('Target iuran kas harus lebih dari Rp 0');
      return;
    }

    addShortage({
      personName: personName.trim(),
      personPhone: personPhone.trim(),
      period: period.trim(),
      targetAmount,
      paidAmount,
      dueDate,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Catat Kekurangan / Tunggakan Kas
              </h2>
              <p className="text-[11px] text-slate-500">
                Pencatatan yang belum atau kurang bayar kas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200">
              {errorMsg}
            </div>
          )}

          {/* Nama Orang */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Nama Anggota / Warga *</span>
            </label>
            <input
              type="text"
              required
              list="shortage-members-datalist"
              value={personName}
              onChange={(e) => handleSelectMember(e.target.value)}
              placeholder="Ketik nama anggota..."
              className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <datalist id="shortage-members-datalist">
              {members.map((m) => (
                <option key={m.id} value={m.name} />
              ))}
            </datalist>
          </div>

          {/* WhatsApp */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>No. WhatsApp (Untuk Pengingat Kas)</span>
            </label>
            <input
              type="tel"
              value={personPhone}
              onChange={(e) => setPersonPhone(e.target.value)}
              placeholder="Contoh: 081234567xxx"
              className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Periode Kas */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Periode / Keterangan Iuran *</span>
            </label>
            <input
              type="text"
              required
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="Contoh: Kas Bulan Oktober 2026, Iuran Acara Futsal..."
              className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Target Amount & Already Paid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Target Iuran (Rp) *
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={targetAmountStr ? Number(targetAmountStr).toLocaleString('id-ID') : ''}
                onChange={(e) => setTargetAmountStr(String(parseNumberInput(e.target.value)))}
                className="w-full px-3 py-2 text-xs font-bold font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Sudah Disetor (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={paidAmountStr ? Number(paidAmountStr).toLocaleString('id-ID') : '0'}
                onChange={(e) => setPaidAmountStr(String(parseNumberInput(e.target.value)))}
                className="w-full px-3 py-2 text-xs font-bold font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Live Remaining Calculation */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900/40 flex items-center justify-between text-xs">
            <span className="font-medium text-amber-900 dark:text-amber-200">
              Sisa Kekurangan Kas:
            </span>
            <span className="font-bold font-mono text-amber-700 dark:text-amber-300 text-sm">
              Rp {remaining.toLocaleString('id-ID')}
            </span>
          </div>

          {/* Batas Waktu */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Batas Waktu Pembayaran (Opsional)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Catatan Khusus (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan..."
              className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
            >
              Simpan Catatan Kekurangan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
