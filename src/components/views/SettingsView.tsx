import React, { useState } from 'react';
import { useCashBook } from '../../context/CashBookContext';
import { parseNumberInput } from '../../utils/formatters';
import {
  Settings,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  Building,
  User,
  Phone,
  DollarSign,
  FileText,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    clearAllData,
    exportBackupJSON,
    importBackupJSON,
  } = useCashBook();

  const [orgName, setOrgName] = useState(profile.organizationName);
  const [rtNumber, setRtNumber] = useState(profile.rtNumber);
  const [treasurerName, setTreasurerName] = useState(profile.treasurerName);
  const [treasurerPhone, setTreasurerPhone] = useState(profile.treasurerPhone);
  const [monthlyFeeStr, setMonthlyFeeStr] = useState(String(profile.monthlyFee || 15000));
  const [receiptNote, setReceiptNote] = useState(profile.receiptNote);
  const [isSaved, setIsSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      organizationName: orgName.trim(),
      rtNumber: rtNumber.trim(),
      treasurerName: treasurerName.trim(),
      treasurerPhone: treasurerPhone.trim(),
      monthlyFee: parseNumberInput(monthlyFeeStr),
      receiptNote: receiptNote.trim(),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const [importStatus, setImportStatus] = useState<{ success: boolean; msg: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJSON(content);
      if (success) {
        setImportStatus({ success: true, msg: 'Data cadangan berhasil dipulihkan!' });
      } else {
        setImportStatus({ success: false, msg: 'Format file JSON tidak sesuai.' });
      }
      setTimeout(() => setImportStatus(null), 3500);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pengaturan Kas Pemuda RT 04
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur informasi kepengurusan RT, nominal iuran standar, struk, dan cadangan data.
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Building className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Identitas Kas & Kepengurusan
          </h2>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Nama Organisasi / Kas
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Nomor RT / Wilayah
              </label>
              <input
                type="text"
                value={rtNumber}
                onChange={(e) => setRtNumber(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Nama Bendahara
              </label>
              <input
                type="text"
                value={treasurerName}
                onChange={(e) => setTreasurerName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Nomor WhatsApp Bendahara
              </label>
              <input
                type="tel"
                value={treasurerPhone}
                onChange={(e) => setTreasurerPhone(e.target.value)}
                placeholder="081234567xxx"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Besaran Iuran Bulanan Standar (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={monthlyFeeStr ? Number(monthlyFeeStr).toLocaleString('id-ID') : ''}
              onChange={(e) => setMonthlyFeeStr(String(parseNumberInput(e.target.value)))}
              className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Catatan Kaki Tanda Terima / Struk Kas
            </label>
            <input
              type="text"
              value={receiptNote}
              onChange={(e) => setReceiptNote(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {isSaved && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Pengaturan berhasil disimpan!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>

      {/* Backup & Data Reset */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Pencadangan Data & Reset
        </h2>
        <p className="text-xs text-slate-500">
          Data Anda disimpan dengan aman dan privat di browser perangkat Anda.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportBackupJSON}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download Cadangan Data (JSON)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg cursor-pointer">
            <Upload className="w-4 h-4 text-indigo-500" />
            <span>Pulihkan Cadangan (Restore)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Kosongkan Semua Data
            </h3>
            <p className="text-[11px] text-slate-400">
              Menghapus semua transaksi kas dan daftar anggota untuk memulai dari 0.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan ke 0</span>
          </button>
        </div>

        {importStatus && (
          <div
            className={`p-3 text-xs rounded-lg flex items-center gap-1.5 ${
              importStatus.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{importStatus.msg}</span>
          </div>
        )}

        {clearSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Semua data kas dan anggota telah dikosongkan ke 0!</span>
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Kosongkan Semua Data?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tindakan ini akan menghapus semua riwayat transaksi kas masuk, kas keluar, dan daftar anggota. Data akan kembali bersih ke Rp 0.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllData();
                  setShowClearConfirm(false);
                  setClearSuccess(true);
                  setTimeout(() => setClearSuccess(false), 3000);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Ya, Kosongkan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
