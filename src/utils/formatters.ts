import { Transaction, KasShortage } from '../types';

export const formatRupiah = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
};

export const parseNumberInput = (value: string): number => {
  const clean = value.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${parseInt(day, 10)} ${months[mIndex] || month} ${year}`;
};

export const formatDateLong = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
};

/**
 * Format WhatsApp reminder for unpaid or shortage of kas
 */
export const generateShortageWhatsAppLink = (
  shortage: KasShortage,
  orgName: string,
  treasurerName: string
): string => {
  const phone = (shortage.personPhone || '').replace(/[^0-9]/g, '');
  const formattedPhone = phone.startsWith('0') ? '62' + phone.substring(1) : phone.startsWith('62') ? phone : '62' + phone;

  const msg =
    `Halo *${shortage.personName}*, salam hangat dari pengurus *${orgName}*.\n\n` +
    `Mengingatkan mengenai catatan iuran kas:\n` +
    `• Keperluan / Periode: *${shortage.period}*\n` +
    `• Target Iuran: ${formatRupiah(shortage.targetAmount)}\n` +
    `• Sudah Dibayar: ${formatRupiah(shortage.paidAmount)}\n` +
    `• *Sisa Kekurangan Kas: ${formatRupiah(shortage.remainingAmount)}*\n` +
    (shortage.dueDate ? `• Batas Waktu: ${formatDate(shortage.dueDate)}\n` : '') +
    `\nMohon konfirmasi atau melakukan pelunasan ke bendahara (${treasurerName}). Terima kasih atas partisipasinya! 🙏`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
};

/**
 * Format WhatsApp receipt / proof of cash in/out
 */
export const generateReceiptWhatsAppLink = (
  trx: Transaction,
  orgName: string,
  treasurerName: string
): string => {
  const phone = (trx.personPhone || '').replace(/[^0-9]/g, '');
  const formattedPhone = phone.startsWith('0') ? '62' + phone.substring(1) : phone.startsWith('62') ? phone : '62' + phone;

  const isIncome = trx.type === 'income';

  const msg =
    `*BUKTI TANDA TERIMA KAS - ${orgName.toUpperCase()}*\n` +
    `----------------------------------------\n` +
    `No. Bukti : *${trx.receiptNumber}*\n` +
    `Tanggal   : ${formatDate(trx.date)} ${trx.time ? `(${trx.time} WIB)` : ''}\n` +
    `Jenis     : *${isIncome ? 'KAS MASUK (Iuran/Pemasukan)' : 'KAS KELUAR (Pengeluaran)'}*\n` +
    `Nama      : *${trx.personName}*\n` +
    `Jumlah    : *${formatRupiah(trx.amount)}*\n` +
    `Keterangan: ${trx.description}\n` +
    (trx.notes ? `Catatan   : ${trx.notes}\n` : '') +
    `----------------------------------------\n` +
    `Status    : *TERCATAT RESMI DI BUKU KAS*\n` +
    `Bendahara : ${treasurerName || 'Pengurus RT 04'}\n\n` +
    `Terima kasih atas kerjasamanya! 🙏`;

  if (!formattedPhone) return '';
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
};

/**
 * Export transactions to CSV file
 */
export const exportKasToCSV = (transactions: Transaction[], orgName: string): void => {
  const headers = ['No Bukti', 'Tanggal', 'Waktu', 'Jenis Kas', 'Nama Orang', 'Nomor HP', 'Keterangan Kas', 'Nominal (Rp)', 'Catatan'];

  const rows = transactions.map((t) => [
    t.receiptNumber,
    t.date,
    t.time || '',
    t.type === 'income' ? 'Kas Masuk' : 'Kas Keluar',
    `"${(t.personName || '').replace(/"/g, '""')}"`,
    t.personPhone || '',
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.amount,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `buku-kas-pemuda-rt04-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const playCashChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12); // G5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.32);
  } catch {
    // Ignore audio failures
  }
};
