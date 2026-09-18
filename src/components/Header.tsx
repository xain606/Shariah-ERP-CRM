import React from 'react';
import {
  FileText,
  PlusCircle,
  Clock,
  Layers,
  BarChart3,
  Users,
  Smartphone,
  MessageSquare,
  Sparkles,
  Server,
} from 'lucide-react';
import { formatPKR } from '../utils/formatters';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openNewContractModal: () => void;
  totalActiveContracts: number;
  totalRecoveredToday: number;
  overdueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  openNewContractModal,
  totalActiveContracts,
  totalRecoveredToday,
  overdueCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Top Bar with Live Pakistani Business Meta */}
      <div className="bg-slate-900 text-slate-200 px-4 sm:px-6 py-1.5 text-xs flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Pakistan Localized Installment System
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">
            PKR Currency (Rs.) | NADRA CNIC KYC | Zamin (Guarantors) | Section 489-F PPC
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-urdu text-emerald-300">
          <span>قسط بازار - پاکستان کا جدید اقساط منیجمنٹ سسٹم</span>
        </div>
      </div>

      {/* Main Navigation & Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 font-bold text-lg tracking-wider">
              QB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  QistBazaar
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Pak ERP
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-500">
                Installment CRM & ERP for Pakistani Consumer Electronics & Bikes
              </p>
            </div>
          </div>

          {/* Top Quick Metrics */}
          <div className="hidden lg:flex items-center gap-6 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60">
              <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">
                Active Contracts
              </span>
              <span className="text-sm font-bold text-slate-900">
                {totalActiveContracts} Files
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50/70 border border-emerald-200/60">
              <span className="text-emerald-700 block text-[10px] uppercase tracking-wider font-semibold">
                Recovered Today
              </span>
              <span className="text-sm font-bold text-emerald-800">
                {formatPKR(totalRecoveredToday)}
              </span>
            </div>
            {overdueCount > 0 && (
              <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200/60">
                <span className="text-rose-700 block text-[10px] uppercase tracking-wider font-semibold">
                  Defaulter / Overdue
                </span>
                <span className="text-sm font-bold text-rose-800">
                  {overdueCount} Cases
                </span>
              </div>
            )}
          </div>

          {/* Action CTA */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={openNewContractModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Qist Contract</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-2 border-t border-slate-100 overflow-x-auto py-2 scrollbar-none text-xs sm:text-sm font-medium">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentTab('contracts')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentTab === 'contracts'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Contracts & Amortization</span>
          </button>

          <button
            onClick={() => setCurrentTab('roznamcha')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentTab === 'roznamcha'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Daily Recovery (Roznamcha)</span>
          </button>

          <button
            onClick={() => setCurrentTab('customers')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentTab === 'customers'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customers & Zamin (Guarantors)</span>
          </button>

          <button
            onClick={() => setCurrentTab('inventory')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentTab === 'inventory'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>IMEI & Chassis Inventory</span>
          </button>

          <button
            onClick={() => setCurrentTab('whatsapp')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentTab === 'whatsapp'
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp & Legal Notice Desk</span>
          </button>

          <button
            onClick={() => setCurrentTab('deploy')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentTab === 'deploy'
                ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold">WAMP & cPanel Deploy (Offline POS)</span>
          </button>

          {/* Explicit Highlight for ERP Planning & Blueprint */}
          <button
            onClick={() => setCurrentTab('planner')}
            className={`ml-auto px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap border ${
              currentTab === 'planner'
                ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md border-emerald-600 font-semibold'
                : 'border-emerald-300 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold">ERP Architecture & Blueprint Planner</span>
          </button>
        </div>
      </div>
    </header>
  );
};
