import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/OverviewDashboard';
import { ContractManager } from './components/ContractManager';
import { RecoveryLedger } from './components/RecoveryLedger';
import { CustomersAndGuarantors } from './components/CustomersAndGuarantors';
import { AssetInventory } from './components/AssetInventory';
import { WhatsAppLegalCenter } from './components/WhatsAppLegalCenter';
import { ERPArchitectPlanner } from './components/ERPArchitectPlanner';
import { DeploymentCenter } from './components/DeploymentCenter';
import { NewContractModal } from './components/NewContractModal';
import { ReceiptModal } from './components/ReceiptModal';
import {
  INITIAL_CONTRACTS,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_RECOVERY_OFFICERS,
} from './data/mockData';
import { Customer, InstallmentContract, InstallmentMonth, PaymentMethod, ProductItem } from './types';
import { cacheContractsLocally } from './utils/offlineDb';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [contracts, setContracts] = useState<InstallmentContract[]>(INITIAL_CONTRACTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [recoveryOfficers, setRecoveryOfficers] = useState(INITIAL_RECOVERY_OFFICERS);

  // Automatically cache contracts in IndexedDB for field offline usage
  useEffect(() => {
    cacheContractsLocally(contracts);
  }, [contracts]);

  // Modals state
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<InstallmentContract | null>(null);
  const [receiptData, setReceiptData] = useState<{
    contract: InstallmentContract;
    installment: InstallmentMonth;
  } | null>(null);

  // Quick metrics
  const totalActive = contracts.filter((c) => c.status === 'active').length;
  const overdueCount = contracts.filter(
    (c) => c.status === 'defaulter' || c.status === 'legal_action' || c.schedule.some((s) => s.status === 'overdue')
  ).length;

  // Calculate today's recovered amount
  const totalRecoveredToday = contracts.reduce((sum, c) => {
    return (
      sum +
      c.schedule
        .filter((s) => s.status === 'paid' && s.paidDate && s.paidDate.startsWith('2026-09'))
        .reduce((sSum, s) => sSum + s.amountPaid, 0)
    );
  }, 0);

  // Payment Recording Handler
  const handleRecordPayment = (
    contractId: string,
    installmentNo: number,
    amount: number,
    method: PaymentMethod,
    ref?: string,
    officerName?: string
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const receiptNum = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    let targetContract: InstallmentContract | null = null;
    let targetInstallment: InstallmentMonth | null = null;

    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;

        let installmentFound: InstallmentMonth | null = null;
        const updatedSchedule = c.schedule.map((s) => {
          if (s.installmentNo !== installmentNo) return s;

          installmentFound = {
            ...s,
            amountPaid: amount,
            paidDate: todayStr,
            paymentMethod: method,
            transactionRef: ref || undefined,
            receiptNo: receiptNum,
            collectedBy: officerName || c.recoveryOfficerName,
            status: 'paid' as const,
            lateFine: 0,
          };
          return installmentFound;
        });

        // Recalculate remaining balance
        const paidSoFar = updatedSchedule
          .filter((s) => s.status === 'paid')
          .reduce((sum, s) => sum + s.amountPaid, 0);
        const newBalance = Math.max(0, c.totalContractPrice - c.advancePaid - paidSoFar);

        // Check if fully completed
        const isAllPaid = updatedSchedule.every((s) => s.status === 'paid');

        targetContract = {
          ...c,
          remainingBalance: newBalance,
          status: isAllPaid ? 'completed' : c.status === 'defaulter' ? 'active' : c.status,
          schedule: updatedSchedule,
        };
        targetInstallment = installmentFound;

        return targetContract;
      })
    );

    // Update Recovery Officer Cash in Hand if cash was collected
    if (method === 'Cash' && officerName) {
      setRecoveryOfficers((prev) =>
        prev.map((off) => {
          if (off.name === officerName) {
            return {
              ...off,
              cashInHandToday: off.cashInHandToday + amount,
              collectedThisMonth: off.collectedThisMonth + amount,
            };
          }
          return off;
        })
      );
    }

    // Launch Receipt Modal
    if (targetContract && targetInstallment) {
      setReceiptData({
        contract: targetContract,
        installment: targetInstallment,
      });
    }
  };

  const handleCreateContract = (newContract: InstallmentContract) => {
    setContracts((prev) => [newContract, ...prev]);

    // Update product inventory status if matched
    setProducts((prev) =>
      prev.map((p) => (p.id === newContract.productId ? { ...p, status: 'Contract Assigned' } : p))
    );
  };

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
  };

  const handleAddProduct = (newProduct: ProductItem) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleViewReceipt = (contract: InstallmentContract, installment: InstallmentMonth) => {
    setReceiptData({ contract, installment });
  };

  const handleSelectContractFromDashboard = (contract: InstallmentContract) => {
    setSelectedContract(contract);
    setCurrentTab('contracts');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top App Header & Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openNewContractModal={() => setIsNewContractOpen(true)}
        totalActiveContracts={totalActive}
        totalRecoveredToday={totalRecoveredToday}
        overdueCount={overdueCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <OverviewDashboard
            contracts={contracts}
            recoveryOfficers={recoveryOfficers}
            onSelectContract={handleSelectContractFromDashboard}
            openNewContractModal={() => setIsNewContractOpen(true)}
            switchToTab={setCurrentTab}
          />
        )}

        {currentTab === 'contracts' && (
          <ContractManager
            contracts={contracts}
            onRecordPayment={handleRecordPayment}
            onViewReceipt={handleViewReceipt}
            openNewContractModal={() => setIsNewContractOpen(true)}
            selectedContract={selectedContract}
            onSelectContract={setSelectedContract}
          />
        )}

        {currentTab === 'roznamcha' && (
          <RecoveryLedger
            contracts={contracts}
            recoveryOfficers={recoveryOfficers}
            onRecordPayment={handleRecordPayment}
            onViewReceipt={handleViewReceipt}
          />
        )}

        {currentTab === 'customers' && (
          <CustomersAndGuarantors
            customers={customers}
            contracts={contracts}
            onAddCustomer={handleAddCustomer}
            onSelectCustomerContract={(c) => {
              setSelectedContract(c);
              setCurrentTab('contracts');
            }}
          />
        )}

        {currentTab === 'inventory' && (
          <AssetInventory products={products} onAddProduct={handleAddProduct} />
        )}

        {currentTab === 'whatsapp' && <WhatsAppLegalCenter contracts={contracts} />}

        {currentTab === 'deploy' && <DeploymentCenter />}

        {currentTab === 'planner' && <ERPArchitectPlanner />}
      </main>

      {/* Modals */}
      <NewContractModal
        isOpen={isNewContractOpen}
        onClose={() => setIsNewContractOpen(false)}
        customers={customers}
        products={products}
        recoveryOfficers={recoveryOfficers}
        onCreateContract={handleCreateContract}
      />

      {receiptData && (
        <ReceiptModal
          isOpen={!!receiptData}
          contract={receiptData.contract}
          installment={receiptData.installment}
          onClose={() => setReceiptData(null)}
        />
      )}
    </div>
  );
}
