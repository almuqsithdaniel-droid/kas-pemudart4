import React, { useState, useMemo } from 'react';
import { useCashBook } from '../../context/CashBookContext';
import { Transaction, TransactionType } from '../../types';
import { formatRupiah, formatDate, exportKasToCSV } from '../../utils/formatters';
import {
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Printer,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Wallet,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface LedgerViewProps {
  onOpenTransaction: (type: TransactionType) => void;
  onEditTransaction: (tx: Transaction) => void;
  onViewReceipt: (tx: Transaction) => void;
  onViewPhoto: (photoUrl: string) => void;
  onNavigateToShortages: () => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  onOpenTransaction,
  onEditTransaction,
  onViewReceipt,
  onViewPhoto,
  onNavigateToShortages,
}) => {
  const { transactions, summary, deleteTransaction, profile } = useCashBook();

  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [deleteConfirmTx, setDeleteConfirmTx] = useState<Transaction | null>(null);

  // Filtered transactions (with live person name search)
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const nameMatch = (t.personName || '').toLowerCase().includes(q);
        const descMatch = (t.description || '').toLowerCase().includes(q);
        const notesMatch = (t.notes || '').toLowerCase().includes(q);
        const receiptMatch = (t.receiptNumber || '').toLowerCase().includes(q);
        if (!nameMatch && !descMatch && !notesMatch && !receiptMatch) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, search]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Kas Utama */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Saldo Kas Pemuda
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              {formatRupiah(summary.currentBalance)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Kas bersih saat ini
            </p>
          </div>
        </div>

        {/* Kas Masuk */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Kas Masuk
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatRupiah(summary.totalIncome)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Iuran & sumbangan masuk
            </p>
          </div>
        </div>

        {/* Kas Keluar */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Kas Keluar
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400">
              {formatRupiah(summary.totalExpense)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Belanja keperluan & kegiatan
            </p>
          </div>
        </div>

        {/* Kekurangan Kas */}
        <div
          onClick={onNavigateToShortages}
          className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Kekurangan Kas
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400">
              {formatRupiah(summary.totalShortage)}
            </div>
            <p className="text-[11px] text-amber-600 hover:underline mt-0.5">
              {summary.totalShortage > 0 ? 'Lihat catatan yang belum bayar →' : 'Semua iuran kas lunas'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Banner with 2 Big Buttons */}
      <div className="no-print bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Pencatatan Kas Masuk & Kas Keluar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih untuk menambahkan uang iuran masuk atau mencatat pengeluaran uang kas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onOpenTransaction('income')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Kas Masuk (Tambah Uang)</span>
          </button>

          <button
            onClick={() => onOpenTransaction('expense')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-xs transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>- Kas Keluar (Pengeluaran Uang)</span>
          </button>
        </div>
      </div>

      {/* Filter and Live Search by Name */}
      <div className="no-print bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Instant Search Bar for Person Name */}
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama orang yang bayar kas / keterangan..."
            className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Types & Print/Export */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                typeFilter === 'income'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Kas Masuk
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                typeFilter === 'expense'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Kas Keluar
            </button>
          </div>

          <button
            onClick={() => exportKasToCSV(transactions, profile.organizationName)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Download file Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </button>

          <button
            onClick={handlePrint}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Cetak Buku Kas"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Printable Heading (Only visible in Print) */}
      <div className="print-only hidden p-4 border-b border-slate-300 mb-4">
        <h1 className="text-xl font-bold uppercase">{profile.organizationName}</h1>
        <p className="text-xs text-slate-600">Laporan Buku Kas Masuk & Kas Keluar</p>
        <p className="text-xs text-slate-500">Saldo Akhir: {formatRupiah(summary.currentBalance)}</p>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {transactions.length === 0
                ? 'Buku Kas Masih Kosong (Mulai dari 0)'
                : 'Tidak ada transaksi dengan nama atau kata kunci tersebut'}
            </p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {transactions.length === 0
                ? 'Semua data transaksi bersih untuk kegunaan pribadi Anda. Mulai catat iuran kas pemuda atau pengeluaran pertama Anda sekarang.'
                : 'Coba ubah kata kunci pencarian nama atau filter jenis transaksi.'}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => onOpenTransaction('income')}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Catat Kas Masuk</span>
              </button>
              <button
                onClick={() => onOpenTransaction('expense')}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>- Catat Kas Keluar</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                  <th className="py-3 px-4">Tanggal & Waktu</th>
                  <th className="py-3 px-4">Jenis</th>
                  <th className="py-3 px-4">Nama Orang</th>
                  <th className="py-3 px-4">Keterangan Kas</th>
                  <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                  <th className="no-print py-3 px-4 text-center">Struk & Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Tanggal & Waktu */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 dark:text-white font-mono">
                          {formatDate(tx.date)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {tx.time || '-'}
                        </div>
                      </td>

                      {/* Jenis Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isIncome ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            Kas Masuk
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            Kas Keluar
                          </span>
                        )}
                      </td>

                      {/* Nama Orang */}
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        <div>{tx.personName}</div>
                        {tx.personPhone && (
                          <div className="text-[10px] font-mono text-slate-400">
                            {tx.personPhone}
                          </div>
                        )}
                      </td>

                      {/* Keterangan */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          {tx.description}
                        </div>
                        {tx.notes && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {tx.notes}
                          </div>
                        )}
                      </td>

                      {/* Nominal */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                        </span>
                      </td>

                      {/* Aksi & Struk */}
                      <td className="no-print py-3 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Struk Button */}
                          <button
                            onClick={() => onViewReceipt(tx)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-md transition-colors"
                            title="Lihat / Cetak Struk Bukti Kas"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>Struk</span>
                          </button>

                          {/* Foto thumbnail if uploaded */}
                          {tx.receiptImage && (
                            <button
                              onClick={() => onViewPhoto(tx.receiptImage!)}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded"
                              title="Lihat Foto Bukti"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 rounded-md transition-colors"
                            title="Perbaiki salah ketik (typo) nama, nominal, atau keterangan"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit Typo</span>
                          </button>

                          <button
                            onClick={() => setDeleteConfirmTx(tx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                            title="Hapus Catatan Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Hapus Catatan Kas?
            </h3>
            <p className="text-xs text-slate-500">
              Hapus catatan &ldquo;{deleteConfirmTx.description}&rdquo; ({deleteConfirmTx.personName}) senilai{' '}
              <strong className="font-mono text-slate-900 dark:text-white">
                {formatRupiah(deleteConfirmTx.amount)}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmTx(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteTransaction(deleteConfirmTx.id);
                  setDeleteConfirmTx(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
