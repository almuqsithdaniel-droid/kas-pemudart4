import React, { useState, useMemo } from 'react';
import { useCashBook } from '../../context/CashBookContext';
import { KasShortage } from '../../types';
import {
  formatRupiah,
  formatDate,
  generateShortageWhatsAppLink,
} from '../../utils/formatters';
import {
  Search,
  Plus,
  Send,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Trash2,
  Calendar,
  Phone,
  User,
} from 'lucide-react';

interface ShortagesViewProps {
  onOpenNewShortage: () => void;
  onOpenPayModal: (shortage: KasShortage) => void;
}

export const ShortagesView: React.FC<ShortagesViewProps> = ({
  onOpenNewShortage,
  onOpenPayModal,
}) => {
  const { shortages, deleteShortage, profile } = useCashBook();

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('unpaid');
  const [shortageToDelete, setShortageToDelete] = useState<KasShortage | null>(null);

  // Filtered shortages (with instant name search)
  const filteredShortages = useMemo(() => {
    return shortages.filter((s) => {
      if (statusFilter === 'unpaid' && s.status === 'paid') return false;
      if (statusFilter === 'paid' && s.status !== 'paid') return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const nameMatch = s.personName.toLowerCase().includes(q);
        const periodMatch = s.period.toLowerCase().includes(q);
        const phoneMatch = s.personPhone.includes(q);
        if (!nameMatch && !periodMatch && !phoneMatch) return false;
      }
      return true;
    });
  }, [shortages, statusFilter, search]);

  const unpaidTotal = useMemo(
    () => shortages.filter((s) => s.status !== 'paid').reduce((sum, s) => sum + s.remainingAmount, 0),
    [shortages]
  );

  const paidTotal = useMemo(
    () => shortages.reduce((sum, s) => sum + s.paidAmount, 0),
    [shortages]
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Pengawasan Iuran
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500">{profile.organizationName}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Catatan Kekurangan Kas Seseorang
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daftar anggota yang belum membayar atau masih memiliki kekurangan iuran kas.
          </p>
        </div>

        <button
          onClick={onOpenNewShortage}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Kekurangan Kas</span>
        </button>
      </div>

      {/* 2 KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 block">Total Kekurangan Kas Belum Lunas</span>
          <span className="text-xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400 block mt-1">
            {formatRupiah(unpaidTotal)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            Uang kas yang masih tertahan
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 block">Sudah Dilunasi / Disetor</span>
          <span className="text-xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 block mt-1">
            {formatRupiah(paidTotal)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            Pelunasan yang sudah masuk kas
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 block">Orang yang Masih Kurang Kas</span>
          <span className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-white block mt-1">
            {shortages.filter((s) => s.status !== 'paid').length} Orang
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            Dapat diingatkan via WhatsApp
          </span>
        </div>
      </div>

      {/* Filter Toolbar & Live Name Search */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search by person name */}
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama anggota / orang yang kurang kas..."
            className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Status switcher */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('unpaid')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-md font-medium transition-colors ${
              statusFilter === 'unpaid'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Belum Lunas ({shortages.filter((s) => s.status !== 'paid').length})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-md font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Semua Catatan
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-md font-medium transition-colors ${
              statusFilter === 'paid'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Sudah Lunas
          </button>
        </div>
      </div>

      {/* Shortage Cards List */}
      <div className="space-y-3">
        {filteredShortages.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-10 text-center border border-slate-200 dark:border-slate-800">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {shortages.length === 0
                ? 'Tidak ada catatan kekurangan kas (Bersih)'
                : 'Semua iuran kas yang dicari sudah lunas!'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {shortages.length === 0
                ? 'Jika ada anggota yang belum melunasi iuran kas, Anda dapat mencatatnya di sini.'
                : 'Tidak ada tunggakan kas dengan filter yang dipilih.'}
            </p>
            <button
              onClick={onOpenNewShortage}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Kekurangan Kas Baru</span>
            </button>
          </div>
        ) : (
          filteredShortages.map((s) => {
            const isPaid = s.status === 'paid';
            const waLink = generateShortageWhatsAppLink(
              s,
              profile.organizationName,
              profile.treasurerName
            );

            return (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {s.personName}
                    </span>
                    {s.personPhone && (
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {s.personPhone}
                      </span>
                    )}
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : s.status === 'partial'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}
                    >
                      {isPaid ? 'Lunas' : s.status === 'partial' ? 'Dicicil Sebagian' : 'Belum Bayar'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Keperluan: {s.period}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                    <span>Target: {formatRupiah(s.targetAmount)}</span>
                    <span>·</span>
                    <span>Sudah Bayar: {formatRupiah(s.paidAmount)}</span>
                    {s.dueDate && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Batas: {formatDate(s.dueDate)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Sisa & Actions */}
                <div className="flex items-center gap-4 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-400 block">Kekurangan:</span>
                    <span
                      className={`text-base font-bold font-mono ${
                        isPaid
                          ? 'text-emerald-600'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {formatRupiah(s.remainingAmount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* WhatsApp Reminder Button */}
                    {!isPaid && s.personPhone && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg transition-colors"
                        title="Kirim pengingat tagihan iuran via WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim WA</span>
                      </a>
                    )}

                    {/* Pay Shortage */}
                    {!isPaid && (
                      <button
                        onClick={() => onOpenPayModal(s)}
                        className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Bayar Kas</span>
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setShortageToDelete(s)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Hapus Catatan Kekurangan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal Dialog */}
      {shortageToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Hapus Catatan Kekurangan Kas?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Apakah Anda yakin ingin menghapus catatan kekurangan iuran untuk &ldquo;<strong className="text-slate-900 dark:text-white">{shortageToDelete.personName}</strong>&rdquo; ({shortageToDelete.period})?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShortageToDelete(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteShortage(shortageToDelete.id);
                  setShortageToDelete(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-xs transition-colors"
              >
                Hapus Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
