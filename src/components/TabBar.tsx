import React from 'react';
import { AppTab } from '../types';
import { BookOpen, FileText, Plus, X } from 'lucide-react';

interface TabBarProps {
  tabs: AppTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewOrder: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewOrder,
}) => {
  return (
    <div className="flex items-center bg-[#ede8df] border-b border-[#ded8cd] px-3 pt-2 gap-1.5 overflow-x-auto select-none no-scrollbar">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const isDashboard = tab.type === 'dashboard';

        return (
          <div
            key={tab.id}
            id={`tab-btn-${tab.id}`}
            onClick={() => onSelectTab(tab.id)}
            className={`group relative flex items-center gap-2 px-4 py-2 text-xs sm:text-xs font-semibold rounded-t-xl transition-all cursor-pointer whitespace-nowrap border-t border-x ${
              isActive
                ? 'bg-[#faf8f5] text-[#18202d] border-[#ded8cd] shadow-xs'
                : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-[#e4ded3]/60 border-transparent'
            }`}
          >
            {isDashboard ? (
              <BookOpen className={`w-3.5 h-3.5 ${isActive ? 'text-[#e5a93c]' : 'text-slate-400'}`} />
            ) : (
              <FileText className={`w-3.5 h-3.5 ${isActive ? 'text-[#e5a93c]' : 'text-slate-400'}`} />
            )}

            <span className="max-w-[160px] sm:max-w-[200px] truncate">
              {isDashboard ? 'Рабочая тетрадь' : tab.title}
            </span>

            {!isDashboard && (
              <button
                type="button"
                id={`close-tab-${tab.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="ml-1 p-0.5 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 transition-colors"
                title="Закрыть вкладку"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {isActive && (
              <div className="absolute top-0 left-2 right-2 h-0.5 bg-[#e5a93c] rounded-full" />
            )}
          </div>
        );
      })}

      <button
        type="button"
        id="btn-tab-new-order"
        onClick={onNewOrder}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-[#e4ded3] rounded-lg transition-colors ml-1"
        title="Создать новый документ в новой вкладке"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Новая вкладка</span>
      </button>
    </div>
  );
};

