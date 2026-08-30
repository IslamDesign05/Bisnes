import React, { useState } from 'react';
import { YearArchive, MonthSummary } from '../types';
import {
  BookOpen,
  Calendar,
  FolderArchive,
  ChevronDown,
  ChevronRight,
  Users,
  Plus,
  Layers,
  Download,
  Upload,
} from 'lucide-react';
import { RUSSIAN_MONTHS } from '../utils/storage';

interface MonthYearSidebarProps {
  yearArchives: YearArchive[];
  currentYear: number;
  selectedYear: number | 'all';
  selectedMonth: number | 'all';
  onSelectPeriod: (year: number | 'all', month: number | 'all') => void;
  onOpenClients: () => void;
  onNewOrder: () => void;
  onExportBackup?: () => void;
  onImportBackup?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalOrdersCount: number;
}

export const MonthYearSidebar: React.FC<MonthYearSidebarProps> = ({
  yearArchives,
  currentYear,
  selectedYear,
  selectedMonth,
  onSelectPeriod,
  onOpenClients,
  onNewOrder,
  onExportBackup,
  onImportBackup,
  totalOrdersCount,
}) => {
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({
    [currentYear]: true,
  });

  const toggleYearExpand = (year: number) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  const currentYearArchive = yearArchives.find((y) => y.year === currentYear);
  const pastYearArchives = yearArchives.filter((y) => y.year !== currentYear);

  return (
    <aside className="w-full md:w-64 lg:w-72 bg-[#181f2a] text-slate-200 flex flex-col h-full border-r border-[#263040] select-none">
      {/* Brand Header: "Книга заказов" */}
      <div className="p-5 border-b border-[#242e3f]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#e5a93c] flex items-center justify-center text-[#181f2a] shadow-md shadow-[#e5a93c]/20">
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-white tracking-tight">Книга</span>
              <span className="text-base font-extrabold text-[#e5a93c] tracking-tight">заказов</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Archive List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* Archive Header Label */}
        <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-500 uppercase px-1">
          <span>АРХИВ</span>
          <span>ПО ГОДАМ</span>
        </div>

        {/* All Orders Item */}
        <button
          type="button"
          onClick={() => onSelectPeriod('all', 'all')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            selectedYear === 'all' && selectedMonth === 'all'
              ? 'bg-[#e5a93c]/15 text-[#e5a93c] font-bold border border-[#e5a93c]/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#232c3c]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>Все заказы (общий)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {totalOrdersCount}
          </span>
        </button>

        {/* Current Year Section */}
        {currentYearArchive && (
          <div className="space-y-1">
            <div
              className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                selectedYear === currentYear && selectedMonth === 'all'
                  ? 'bg-[#232c3c] text-[#e5a93c] font-bold border border-[#e5a93c]/30'
                  : 'text-slate-300 hover:bg-[#232c3c]/70 hover:text-white'
              }`}
              onClick={() => onSelectPeriod(currentYear, 'all')}
            >
              <div className="flex items-center gap-2 font-medium">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleYearExpand(currentYear);
                  }}
                  className="text-slate-400 hover:text-white font-mono text-xs"
                >
                  {expandedYears[currentYear] ? '−' : '+'}
                </button>
                <span className="text-sm font-semibold">{currentYear}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {currentYearArchive.totalOrders}
              </span>
            </div>

            {/* Months of Current Year */}
            {expandedYears[currentYear] && (
              <div className="ml-4 pl-2 border-l border-[#263143] space-y-0.5 mt-1">
                {currentYearArchive.months.map((m: MonthSummary) => {
                  const isSelected =
                    selectedYear === currentYear && selectedMonth === m.month;
                  const hasOrders = m.ordersCount > 0;

                  return (
                    <button
                      key={`curr-${m.month}`}
                      type="button"
                      onClick={() => onSelectPeriod(currentYear, m.month)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'bg-[#e5a93c]/20 text-[#e5a93c] font-bold'
                          : hasOrders
                          ? 'text-slate-300 hover:bg-[#232c3c] hover:text-white'
                          : 'text-slate-500 hover:bg-[#232c3c]/40 hover:text-slate-400'
                      }`}
                    >
                      <span className="truncate">{m.monthName}</span>
                      <span className="text-[11px] font-mono">
                        {hasOrders ? (
                          <strong className={isSelected ? 'text-[#e5a93c]' : 'text-slate-300'}>
                            {m.ordersCount}
                          </strong>
                        ) : (
                          <span className="text-slate-600">0</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Previous Years Archive */}
        {pastYearArchives.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-[#242e3f]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1 py-1">
              Прошедшие года
            </div>
            {pastYearArchives.map((archive) => {
              const isExpanded = !!expandedYears[archive.year];
              const isYearSelected =
                selectedYear === archive.year && selectedMonth === 'all';

              return (
                <div key={`archive-${archive.year}`} className="space-y-1">
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                      isYearSelected
                        ? 'bg-[#232c3c] text-[#e5a93c] font-bold border border-[#e5a93c]/30'
                        : 'text-slate-400 hover:bg-[#232c3c]/60 hover:text-slate-200'
                    }`}
                    onClick={() => onSelectPeriod(archive.year, 'all')}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleYearExpand(archive.year);
                        }}
                        className="text-slate-400 hover:text-white font-mono text-xs"
                      >
                        {isExpanded ? '−' : '+'}
                      </button>
                      <span className="text-sm">{archive.year}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {archive.totalOrders}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="ml-4 pl-2 border-l border-[#263143] space-y-0.5">
                      {archive.months.map((m: MonthSummary) => {
                        const isMonthSelected =
                          selectedYear === archive.year && selectedMonth === m.month;

                        return (
                          <button
                            key={`arch-${archive.year}-${m.month}`}
                            type="button"
                            onClick={() => onSelectPeriod(archive.year, m.month)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                              isMonthSelected
                                ? 'bg-[#e5a93c]/20 text-[#e5a93c] font-bold'
                                : 'text-slate-400 hover:bg-[#232c3c] hover:text-slate-200'
                            }`}
                          >
                            <span className="truncate">{m.monthName}</span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {m.ordersCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Clients Directory button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenClients}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#232c3c]/60 hover:bg-[#232c3c] text-slate-300 hover:text-white text-xs font-medium transition-colors border border-[#2a3547]"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#e5a93c]" />
              <span>База клиентов</span>
            </div>
            <span className="text-[10px] text-slate-400">Телефоны</span>
          </button>
        </div>

        {/* Database Backup Export/Import */}
        {onExportBackup && (
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onExportBackup}
              title="Скачать резервную копию базы"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#202836] hover:bg-[#273244] text-slate-400 hover:text-slate-200 text-[11px] font-medium transition-colors border border-[#293447]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Экспорт базы</span>
            </button>
            {onImportBackup && (
              <label
                htmlFor="sidebar-import-backup-file"
                title="Загрузить базу из файла"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#202836] hover:bg-[#273244] text-slate-400 hover:text-slate-200 text-[11px] font-medium transition-colors border border-[#293447] cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Импорт</span>
                <input
                  type="file"
                  id="sidebar-import-backup-file"
                  accept=".json"
                  onChange={onImportBackup}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}
      </div>

      {/* Sidebar Bottom: "Новый заказ +" Button & Subtext */}
      <div className="p-4 border-t border-[#242e3f] bg-[#141b24] space-y-3">
        <button
          type="button"
          id="btn-sidebar-new-order"
          onClick={onNewOrder}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#e5a93c] hover:bg-[#d89b2f] text-slate-950 font-extrabold text-sm transition-all shadow-md shadow-[#e5a93c]/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <span>Новый заказ</span>
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="text-[11px] text-slate-500 leading-relaxed px-1">
          <p className="font-medium text-slate-400">Рабочая тетрадь мастерской</p>
          <p>Ваши заказы — в одном месте</p>
        </div>
      </div>
    </aside>
  );
};

