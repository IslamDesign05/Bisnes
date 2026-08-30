import React from 'react';
import {
  FilePlus2,
  Search,
  Download,
  Upload,
  BookOpen,
  CheckCircle2,
  Clock,
  CircleDashed,
  Wallet,
  Coins,
} from 'lucide-react';
import { formatCurrency } from '../utils/storage';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNewOrder: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalOrders: number;
  readyOrders: number;
  inProgressOrders: number;
  notStartedOrders: number;
  totalSum: number;
  totalAdvance: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onNewOrder,
  onExport,
  onImport,
  totalOrders,
  readyOrders,
  inProgressOrders,
  notStartedOrders,
  totalSum,
  totalAdvance,
}) => {
  const remainingBalance = Math.max(0, totalSum - totalAdvance);

  return (
    <header className="bg-[#faf8f4] border-b border-[#ded8cd] text-slate-800">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#181f2a] flex items-center justify-center text-[#e5a93c] shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-serif tracking-tight text-[#141b24]">
                  Журнал Учета Заказов
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eef7ee] text-[#2d7a3a] border border-[#cbe6ce]">
                  БД Активна
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Учет принятых заказов, изготовление деталей и расчет авансов
              </p>
            </div>
          </div>

          {/* Mobile Create Button */}
          <button
            type="button"
            onClick={onNewOrder}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#181f2a] text-white font-semibold text-xs shadow-xs"
          >
            <FilePlus2 className="w-4 h-4 text-[#e5a93c]" />
            <span>Заказ</span>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="global-search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск по номеру, имени, телефону..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-[#ded8cd] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]/50 focus:border-[#e5a93c] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Buttons: Backup & Big Create Document button */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Backup / Export / Import */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#ded8cd] shadow-xs">
            <button
              type="button"
              id="btn-export-backup"
              onClick={onExport}
              title="Скачать резервную копию базы данных (JSON)"
              className="p-1.5 rounded-lg hover:bg-[#f7f4ee] text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <label
              htmlFor="import-backup-file"
              title="Восстановить базу из файла JSON"
              className="p-1.5 rounded-lg hover:bg-[#f7f4ee] text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <input
                type="file"
                id="import-backup-file"
                accept=".json"
                onChange={onImport}
                className="hidden"
              />
            </label>
          </div>

          {/* Prominent "Создать документ" button */}
          <button
            type="button"
            id="btn-header-create-document"
            onClick={onNewOrder}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181f2a] hover:bg-[#252f40] text-white font-bold text-xs tracking-wide transition-all shadow-xs hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <FilePlus2 className="w-4 h-4 text-[#e5a93c]" />
            <span>Создать документ</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Financial & Status Strip */}
      <div className="bg-[#f3eee5] border-t border-[#ded8cd] px-4 py-1.5 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
          {/* Status Counts */}
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-700">
              Всего в базе: <strong className="text-slate-900 font-mono">{totalOrders}</strong>
            </span>
            <span className="h-3 w-px bg-[#ded8cd]" />
            <div className="flex items-center gap-1.5 text-[#2d7a3a]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Готово: <strong className="font-mono">{readyOrders}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-[#b45309]">
              <Clock className="w-3.5 h-3.5" />
              <span>В разработке: <strong className="font-mono">{inProgressOrders}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <CircleDashed className="w-3.5 h-3.5" />
              <span>Не начат: <strong className="font-mono">{notStartedOrders}</strong></span>
            </div>
          </div>

          {/* Financial Totals */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-slate-500" />
              <span>Сумма:</span>
              <span className="font-bold text-slate-900 font-mono">
                {formatCurrency(totalSum)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#2d7a3a]">
              <Coins className="w-3.5 h-3.5" />
              <span>Авансы:</span>
              <span className="font-bold font-mono">
                {formatCurrency(totalAdvance)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#b45309]">
              <span>Остаток:</span>
              <span className="font-bold font-mono">
                {formatCurrency(remainingBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

