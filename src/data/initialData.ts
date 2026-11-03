import { Transaction, KasShortage, Member, KasProfile } from '../types';

// Everything starts 100% fresh from 0 for personal private usage by the user
export const initialTransactions: Transaction[] = [];
export const initialShortages: KasShortage[] = [];
export const initialMembers: Member[] = [];

export const initialProfile: KasProfile = {
  organizationName: 'Kas Pemuda RT 04',
  rtNumber: 'RT 04',
  treasurerName: 'Bendahara Pemuda',
  treasurerPhone: '',
  monthlyFee: 15000,
  receiptNote: 'Simpan tanda terima ini sebagai bukti sah pembayaran kas Pemuda RT 04.',
};
