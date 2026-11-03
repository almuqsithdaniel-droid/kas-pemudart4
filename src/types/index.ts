export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType; // 'income' = Kas Masuk, 'expense' = Kas Keluar
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  personName: string; // Nama orang yang bayar atau menerima kas
  personPhone?: string; // No WhatsApp / HP
  description: string; // Keterangan kas masuk / keluar
  notes?: string; // Catatan tambahan
  receiptImage?: string; // Foto bukti struk/nota pengeluaran/transfer
  receiptNumber: string; // No tanda terima otomatis
  createdAt: number;
}

export type ShortageStatus = 'unpaid' | 'partial' | 'paid';

export interface KasShortage {
  id: string;
  personName: string; // Nama pemuda/warga
  personPhone: string; // No WhatsApp
  period: string; // Periode / Acara kas (misal: Kas Oktober 2026, Kas 17-an)
  targetAmount: number; // Target yang harus disetor
  paidAmount: number; // Sudah disetor
  remainingAmount: number; // Kekurangan kas yang belum lunas
  status: ShortageStatus;
  dueDate?: string; // Batas akhir pembayaran
  notes?: string;
  createdAt: number;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt: number;
}

export interface KasProfile {
  organizationName: string;
  rtNumber: string;
  treasurerName: string;
  treasurerPhone: string;
  monthlyFee: number;
  receiptNote: string;
}
