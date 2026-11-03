import React from 'react';
import { Transaction } from '../../types';
import { useCashBook } from '../../context/CashBookContext';
import {
  formatRupiah,
  formatDate,
  generateReceiptWhatsAppLink,
} from '../../utils/formatters';
import { X, Printer, Send, Edit2 } from 'lucide-react';

interface ReceiptDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onEditTransaction?: (tx: Transaction) => void;
}

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({
  transaction,
  onClose,
  onEditTransaction,
}) => {
  const { profile } = useCashBook();

  if (!transaction) return null;

  const isIncome = transaction.type === 'income';
  const waLink = generateReceiptWhatsAppLink(
    transaction,
    profile.organizationName,
    profile.treasurerName
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden transition-all">
        {/* Modal Top Bar */}
        <div className="no-print flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Bukti Struk Kas
          </span>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Struk Body */}
        <div className="p-5 font-mono text-xs text-slate-800 dark:text-slate-100">
          {/* Organization Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
            <h3 className="font-bold text-sm tracking-tight uppercase text-slate-900 dark:text-white">
              {profile.organizationName}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Rukun Tetangga 04 · Pembukuan Kas Pemuda
            </p>
            <div className="mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {isIncome ? 'TANDA TERIMA KAS MASUK' : 'BUKTI KAS KELUAR'}
            </div>
          </div>

          {/* Metadata */}
          <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">No. Bukti:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {transaction.receiptNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal:</span>
              <span>
                {formatDate(transaction.date)} {transaction.time || ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">
                {isIncome ? 'Diterima Dari:' : 'Diberikan Kepada:'}
              </span>
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[170px]">
                {transaction.personName}
              </span>
            </div>
            {transaction.personPhone && (
              <div className="flex justify-between">
                <span className="text-slate-500">No. Kontak:</span>
                <span>{transaction.personPhone}</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-1.5">
            <div>
              <span className="text-[10px] text-slate-500 block">Keterangan Kas:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {transaction.description}
              </span>
            </div>
            {transaction.notes && (
              <div>
                <span className="text-[10px] text-slate-500 block">Catatan:</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300">
                  {transaction.notes}
                </span>
              </div>
            )}
          </div>

          {/* Total Amount */}
          <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between">
            <span className="font-bold text-xs uppercase">
              {isIncome ? 'JUMLAH DITERIMA:' : 'JUMLAH DIKELUARKAN:'}
            </span>
            <span
              className={`text-base font-bold font-mono ${
                isIncome
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatRupiah(transaction.amount)}
            </span>
          </div>

          {/* Photo attachment if available */}
          {transaction.receiptImage && (
            <div className="pt-2 pb-1">
              <span className="text-[10px] text-slate-400 block mb-1">
                Foto Bukti Transaksi:
              </span>
              <img
                src={transaction.receiptImage}
                alt="Bukti Struk"
                className="max-h-36 w-full object-contain rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          )}

          {/* Footer Signature */}
          <div className="pt-4 text-center text-[10px] text-slate-500 space-y-1">
            <p>{profile.receiptNote || 'Bukti sah pembukuan Kas Pemuda RT 04'}</p>
            <p className="font-bold text-slate-700 dark:text-slate-300 pt-1">
              Bendahara: {profile.treasurerName || 'Pengurus RT 04'}
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="no-print p-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {onEditTransaction && (
            <button
              onClick={() => {
                onClose();
                onEditTransaction(transaction);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-100/80 hover:bg-amber-200 dark:bg-amber-950/60 rounded-lg transition-colors"
              title="Perbaiki jika ada salah ketik nama atau nominal pada struk ini"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Perbaiki Typo</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {transaction.personPhone && waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim WA</span>
              </a>
            ) : (
              <div className="text-[10px] text-slate-400">
                (No. WA tidak tertera)
              </div>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Struk</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
