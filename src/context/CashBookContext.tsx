import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Transaction, KasShortage, Member, KasProfile, TransactionType } from '../types';
import { initialTransactions, initialShortages, initialMembers, initialProfile } from '../data/initialData';
import { playCashChime } from '../utils/formatters';

interface CashBookContextType {
  // Theme & Audio
  isDark: boolean;
  toggleTheme: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;

  // Transactions (Kas Masuk & Kas Keluar)
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'receiptNumber'>) => Transaction;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Catatan Kekurangan Kas (Tunggakan Kas)
  shortages: KasShortage[];
  addShortage: (s: Omit<KasShortage, 'id' | 'createdAt' | 'remainingAmount' | 'status'>) => void;
  payShortage: (shortageId: string, paymentAmount: number, autoRecordCash?: boolean) => void;
  deleteShortage: (id: string) => void;

  // Daftar Nama Orang yang Kas (Anggota Pemuda)
  members: Member[];
  addMember: (m: Omit<Member, 'id' | 'createdAt'>) => void;
  updateMember: (id: string, m: Partial<Member>) => void;
  deleteMember: (id: string) => void;

  // Profil Kas Pemuda RT 04
  profile: KasProfile;
  updateProfile: (p: Partial<KasProfile>) => void;

  // Data Management
  clearAllData: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => boolean;

  // Summary Metrics
  summary: {
    totalIncome: number; // Kas Masuk
    totalExpense: number; // Kas Keluar
    currentBalance: number; // Saldo Kas Saat Ini
    totalShortage: number; // Total Kekurangan Kas Belum Lunas
  };
}

const CashBookContext = createContext<CashBookContextType | undefined>(undefined);

// Storage keys dedicated for Kas Pemuda RT 04
const STORAGE_KEYS = {
  TRANSACTIONS: 'kaspemuda_rt04_transactions_v1',
  SHORTAGES: 'kaspemuda_rt04_shortages_v1',
  MEMBERS: 'kaspemuda_rt04_members_v1',
  PROFILE: 'kaspemuda_rt04_profile_v1',
  THEME: 'kaspemuda_rt04_theme_v1',
  SOUND: 'kaspemuda_rt04_sound_v1',
};

// Purge any old trial keys
try {
  ['kaspintar_transactions_v1', 'kaspintar_transactions_v2', 'kaspintar_wallets_v1', 'kaspintar_debts_v1'].forEach((k) => {
    localStorage.removeItem(k);
  });
} catch {
  // Ignore
}

export const CashBookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved !== null) return saved === 'dark';
    return false; // Default clean light mode
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND, String(soundEnabled));
  }, [soundEnabled]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Core Data States (starts completely from 0)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [shortages, setShortages] = useState<KasShortage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHORTAGES);
    return saved ? JSON.parse(saved) : initialShortages;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return saved ? JSON.parse(saved) : initialMembers;
  });

  const [profile, setProfile] = useState<KasProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : initialProfile;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHORTAGES, JSON.stringify(shortages));
  }, [shortages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  // Computed Summary
  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of transactions) {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        totalExpense += t.amount;
      }
    }

    const totalShortage = shortages
      .filter((s) => s.status !== 'paid')
      .reduce((sum, s) => sum + s.remainingAmount, 0);

    return {
      totalIncome,
      totalExpense,
      currentBalance: totalIncome - totalExpense,
      totalShortage,
    };
  }, [transactions, shortages]);

  // Transaction Actions
  const addTransaction = (
    tx: Omit<Transaction, 'id' | 'createdAt' | 'receiptNumber'>
  ): Transaction => {
    const now = new Date();
    const prefix = tx.type === 'income' ? 'KM' : 'KK';
    const dateNum = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(100 + Math.random() * 900);
    const receiptNumber = `${prefix}-RT04-${dateNum}-${rand}`;

    const newTx: Transaction = {
      ...tx,
      id: `trx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      receiptNumber,
      createdAt: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Also auto-add person as a member if not already in member list
    if (tx.personName && tx.personName.trim()) {
      const cleanName = tx.personName.trim();
      setMembers((prevMembers) => {
        const exists = prevMembers.some(
          (m) => m.name.toLowerCase() === cleanName.toLowerCase()
        );
        if (!exists) {
          return [
            ...prevMembers,
            {
              id: `mem-${Date.now()}`,
              name: cleanName,
              phone: tx.personPhone || '',
              createdAt: Date.now(),
            },
          ];
        }
        return prevMembers;
      });
    }

    if (soundEnabled) {
      playCashChime();
    }

    return newTx;
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Shortage (Kekurangan Kas) Actions
  const addShortage = (
    s: Omit<KasShortage, 'id' | 'createdAt' | 'remainingAmount' | 'status'>
  ) => {
    const remaining = Math.max(0, s.targetAmount - s.paidAmount);
    const status = remaining === 0 ? 'paid' : s.paidAmount > 0 ? 'partial' : 'unpaid';

    const newShortage: KasShortage = {
      ...s,
      id: `sht-${Date.now()}`,
      remainingAmount: remaining,
      status,
      createdAt: Date.now(),
    };

    setShortages((prev) => [newShortage, ...prev]);

    // Auto add to members if new
    if (s.personName && s.personName.trim()) {
      const cleanName = s.personName.trim();
      setMembers((prevMembers) => {
        const exists = prevMembers.some(
          (m) => m.name.toLowerCase() === cleanName.toLowerCase()
        );
        if (!exists) {
          return [
            ...prevMembers,
            {
              id: `mem-${Date.now()}`,
              name: cleanName,
              phone: s.personPhone || '',
              createdAt: Date.now(),
            },
          ];
        }
        return prevMembers;
      });
    }

    if (soundEnabled) {
      playCashChime();
    }
  };

  const payShortage = (
    shortageId: string,
    paymentAmount: number,
    autoRecordCash = true
  ) => {
    let updatedShortage: KasShortage | undefined;

    setShortages((prev) =>
      prev.map((s) => {
        if (s.id !== shortageId) return s;
        const newPaid = s.paidAmount + paymentAmount;
        const newRemaining = Math.max(0, s.targetAmount - newPaid);
        const newStatus = newRemaining === 0 ? 'paid' : 'partial';

        updatedShortage = {
          ...s,
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          status: newStatus,
        };
        return updatedShortage;
      })
    );

    // If auto record, insert income transaction
    if (autoRecordCash && updatedShortage) {
      addTransaction({
        type: 'income',
        amount: paymentAmount,
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toTimeString().slice(0, 5),
        personName: updatedShortage.personName,
        personPhone: updatedShortage.personPhone,
        description: `Pelunasan kekurangan kas (${updatedShortage.period})`,
        notes: `Pelunasan kekurangan kas dari ${updatedShortage.personName}`,
      });
    }
  };

  const deleteShortage = (id: string) => {
    setShortages((prev) => prev.filter((s) => s.id !== id));
  };

  // Member Actions
  const addMember = (m: Omit<Member, 'id' | 'createdAt'>) => {
    const newMember: Member = {
      ...m,
      id: `mem-${Date.now()}`,
      createdAt: Date.now(),
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const updateMember = (id: string, m: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...m } : item))
    );
  };

  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // Profile Action
  const updateProfile = (p: Partial<KasProfile>) => {
    setProfile((prev) => ({ ...prev, ...p }));
  };

  // Clear all data to fresh zero
  const clearAllData = () => {
    setTransactions([]);
    setShortages([]);
    setMembers([]);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.SHORTAGES);
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
  };

  // Backup & Restore
  const exportBackupJSON = () => {
    const data = {
      appName: 'Kas Pemuda RT 04',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      transactions,
      shortages,
      members,
      profile,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kas-pemuda-rt04-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackupJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (Array.isArray(data.shortages)) setShortages(data.shortages);
      if (Array.isArray(data.members)) setMembers(data.members);
      if (data.profile) setProfile(data.profile);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <CashBookContext.Provider
      value={{
        isDark,
        toggleTheme,
        soundEnabled,
        setSoundEnabled,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        shortages,
        addShortage,
        payShortage,
        deleteShortage,
        members,
        addMember,
        updateMember,
        deleteMember,
        profile,
        updateProfile,
        clearAllData,
        exportBackupJSON,
        importBackupJSON,
        summary,
      }}
    >
      {children}
    </CashBookContext.Provider>
  );
};

export const useCashBook = () => {
  const context = useContext(CashBookContext);
  if (!context) {
    throw new Error('useCashBook must be used within a CashBookProvider');
  }
  return context;
};
