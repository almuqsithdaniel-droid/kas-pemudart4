/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CashBookProvider } from './context/CashBookContext';
import { Navbar } from './components/Navbar';
import { LedgerView } from './components/views/LedgerView';
import { ShortagesView } from './components/views/ShortagesView';
import { MembersView } from './components/views/MembersView';
import { SettingsView } from './components/views/SettingsView';

import { TransactionModal } from './components/modals/TransactionModal';
import { ShortageModal } from './components/modals/ShortageModal';
import { PayShortageModal } from './components/modals/PayShortageModal';
import { ReceiptDetailModal } from './components/modals/ReceiptDetailModal';
import { QuickCalculatorModal } from './components/modals/QuickCalculatorModal';
import { ReceiptPreviewModal } from './components/modals/ReceiptPreviewModal';

import { Transaction, TransactionType, KasShortage } from './types';
import {
  Wallet,
  AlertCircle,
  Users,
  Settings,
  Plus,
} from 'lucide-react';

function KasPemudaApp() {
  const [activeTab, setActiveTab] = useState<string>('ledger');

  // Modal States
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState<TransactionType>('income');
  const [prefilledPerson, setPrefilledPerson] = useState<{ name: string; phone?: string } | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [shortageModalOpen, setShortageModalOpen] = useState(false);
  const [payShortageTarget, setPayShortageTarget] = useState<KasShortage | null>(null);

  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null);
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  // Handlers
  const handleOpenNewTransaction = (type: TransactionType = 'income') => {
    setEditingTransaction(null);
    setPrefilledPerson(null);
    setTransactionModalType(type);
    setTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setPrefilledPerson(null);
    setTransactionModalType(tx.type);
    setTransactionModalOpen(true);
  };

  const handlePayForMember = (memberName: string, memberPhone?: string) => {
    setEditingTransaction(null);
    setPrefilledPerson({ name: memberName, phone: memberPhone });
    setTransactionModalType('income');
    setTransactionModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={() => handleOpenNewTransaction('income')}
        onOpenCalculator={() => setCalculatorOpen(true)}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {activeTab === 'ledger' && (
          <LedgerView
            onOpenTransaction={handleOpenNewTransaction}
            onEditTransaction={handleEditTransaction}
            onViewReceipt={(tx) => setActiveReceipt(tx)}
            onViewPhoto={(url) => setActivePhotoUrl(url)}
            onNavigateToShortages={() => setActiveTab('shortages')}
          />
        )}

        {activeTab === 'shortages' && (
          <ShortagesView
            onOpenNewShortage={() => setShortageModalOpen(true)}
            onOpenPayModal={(shortage) => setPayShortageTarget(shortage)}
          />
        )}

        {activeTab === 'members' && (
          <MembersView onPayForMember={handlePayForMember} />
        )}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 shadow-lg">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex flex-col items-center p-1.5 text-[10px] font-medium ${
              activeTab === 'ledger'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500'
            }`}
          >
            <Wallet className="w-5 h-5 mb-0.5" />
            <span>Buku Kas</span>
          </button>

          <button
            onClick={() => setActiveTab('shortages')}
            className={`flex flex-col items-center p-1.5 text-[10px] font-medium ${
              activeTab === 'shortages'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500'
            }`}
          >
            <AlertCircle className="w-5 h-5 mb-0.5" />
            <span>Kekurangan</span>
          </button>

          {/* Quick Floating Button */}
          <button
            onClick={() => handleOpenNewTransaction('income')}
            className="flex items-center justify-center w-11 h-11 -mt-4 rounded-full bg-emerald-600 text-white shadow-lg active:scale-95 transition-transform"
            title="Catat Kas Baru"
          >
            <Plus className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`flex flex-col items-center p-1.5 text-[10px] font-medium ${
              activeTab === 'members'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span>Anggota</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center p-1.5 text-[10px] font-medium ${
              activeTab === 'settings'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500'
            }`}
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span>Pengaturan</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={transactionModalOpen}
        onClose={() => {
          setTransactionModalOpen(false);
          setEditingTransaction(null);
          setPrefilledPerson(null);
        }}
        initialType={transactionModalType}
        initialPersonName={prefilledPerson?.name || ''}
        initialPersonPhone={prefilledPerson?.phone || ''}
        editingTransaction={editingTransaction}
        onSuccessCreated={(tx) => setActiveReceipt(tx)}
      />

      <ShortageModal
        isOpen={shortageModalOpen}
        onClose={() => setShortageModalOpen(false)}
      />

      <PayShortageModal
        shortage={payShortageTarget}
        onClose={() => setPayShortageTarget(null)}
      />

      <ReceiptDetailModal
        transaction={activeReceipt}
        onClose={() => setActiveReceipt(null)}
        onEditTransaction={(tx) => {
          setActiveReceipt(null);
          handleEditTransaction(tx);
        }}
      />

      <QuickCalculatorModal
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />

      <ReceiptPreviewModal
        imageUrl={activePhotoUrl}
        onClose={() => setActivePhotoUrl(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <CashBookProvider>
      <KasPemudaApp />
    </CashBookProvider>
  );
}
