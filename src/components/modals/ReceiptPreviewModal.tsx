import React from 'react';
import { X, Download } from 'lucide-react';

interface ReceiptPreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  imageUrl,
  onClose,
}) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative max-w-2xl w-full bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Foto Bukti Struk / Transaksi
          </span>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              download="bukti-transaksi.jpg"
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded"
              title="Download Gambar"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 flex items-center justify-center bg-slate-950/90 max-h-[75vh] overflow-auto">
          <img
            src={imageUrl}
            alt="Bukti Struk Transaksi"
            className="max-h-[70vh] w-auto object-contain rounded"
          />
        </div>
      </div>
    </div>
  );
};
