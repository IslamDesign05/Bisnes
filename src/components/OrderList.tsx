import React, { useState } from 'react';
import { OrderItem, OrderStatus } from '../types';
import {
  formatOrderNumber,
  formatCurrency,
  formatDateRu,
  RUSSIAN_MONTHS,
} from '../utils/storage';
import {
  FilePlus2,
  FileText,
  Printer,
  Trash2,
  CheckCircle2,
  Clock,
  CircleDashed,
  Phone,
  User,
  ChevronRight,
  Search,
  ArrowUpDown,
  Calendar,
  Layers,
  ArrowUpRight,
  Users,
} from 'lucide-react';

interface OrderListProps {
  orders: OrderItem[];
  selectedYear: number | 'all';
  selectedMonth: number | 'all';
  searchQuery: string;
  onOpenOrderTab: (order: OrderItem) => void;
  onNewOrder: () => void;
  onPrintOrder: (order: OrderItem) => void;
  onDeleteOrder: (orderId: string) => void;
  onQuickUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onSelectClientHistory: (phone: string) => void;
  onOpenClients?: () => void;
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  selectedYear,
  selectedMonth,
  searchQuery,
  onOpenOrderTab,
  onNewOrder,
  onPrintOrder,
  onDeleteOrder,
  onQuickUpdateStatus,
  onSelectClientHistory,
  onOpenClients,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'number_desc' | 'number_asc' | 'price_desc' | 'date_desc'>('number_desc');

  const effectiveSearch = searchQuery || localSearch;

  // Filter by status
  let filtered = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  // Filter by search query if any
  if (effectiveSearch.trim()) {
    const q = effectiveSearch.toLowerCase().trim();
    filtered = filtered.filter((o) => {
      const numStr = o.orderNumber.toString();
      const numFmt = o.orderNumberFormatted.toLowerCase();
      const name = (o.clientName || '').toLowerCase();
      const phone = (o.clientPhone || '').toLowerCase().replace(/[^\d+]/g, '');
      const title = (o.orderTitle || '').toLowerCase();
      const notes = (o.notes || '').toLowerCase();
      return (
        numStr.includes(q) ||
        numFmt.includes(q) ||
        name.includes(q) ||
        phone.includes(q.replace(/[^\d+]/g, '')) ||
        title.includes(q) ||
        notes.includes(q)
      );
    });
  }

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'number_desc') return b.orderNumber - a.orderNumber;
    if (sortBy === 'number_asc') return a.orderNumber - b.orderNumber;
    if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'date_desc') return (b.orderDate || '').localeCompare(a.orderDate || '');
    return 0;
  });

  // Period label & breadcrumb
  let periodBreadcrumb = 'РАБОЧАЯ ТЕТРАДЬ';
  let periodTitle = 'Текущий месяц';
  let periodCode = '';

  const currentYearNum = new Date().getFullYear();
  const currentMonthNum = new Date().getMonth() + 1;

  if (selectedYear === 'all' && selectedMonth === 'all') {
    periodBreadcrumb = 'РАБОЧАЯ ТЕТРАДЬ / ВСЕ ПЕРИОДЫ';
    periodTitle = 'Все принятые заказы';
    periodCode = 'ВСЕ';
  } else if (selectedYear !== 'all' && selectedMonth === 'all') {
    periodBreadcrumb = `РАБОЧАЯ ТЕТРАДЬ / ${selectedYear}`;
    periodTitle = `Заказы за ${selectedYear} год`;
    periodCode = `${selectedYear}`;
  } else if (selectedYear !== 'all' && typeof selectedMonth === 'number') {
    periodBreadcrumb = `РАБОЧАЯ ТЕТРАДЬ / ${selectedYear}`;
    periodTitle = `${RUSSIAN_MONTHS[selectedMonth - 1]} ${selectedYear}`;
    periodCode = `${String(selectedMonth).padStart(2, '0')} / ${selectedYear}`;
  }

  // Stats calculation
  const totalCount = orders.length;
  const inWorkCount = orders.filter((o) => o.status === 'в разработке').length;
  const notStartedCount = orders.filter((o) => o.status === 'не начат').length;
  const readyCount = orders.filter((o) => o.status === 'готово').length;

  const totalSum = orders.reduce((s, o) => s + (o.price || 0), 0);
  const totalAdvance = orders.reduce((s, o) => s + (o.advance || 0), 0);
  const totalRemaining = Math.max(0, totalSum - totalAdvance);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb + Title + Big Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            {periodBreadcrumb}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#141b24] tracking-tight font-serif">
            {periodTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Все принятые заказы, оплаты и движение работы — в одном спокойном ритме.
          </p>
        </div>

        {/* Top-Right "Записать заказ" Button */}
        <button
          type="button"
          id="btn-top-write-order"
          onClick={onNewOrder}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#181f2a] hover:bg-[#252f40] text-white font-bold text-xs tracking-wide shadow-sm transition-all hover:scale-[1.02] active:scale-[0.99] cursor-pointer"
        >
          <span className="text-base leading-none text-[#e5a93c] font-black">＋</span>
          <span>Записать заказ</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* 4 Top Metric Cards (matching screenshot layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Orders */}
        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            ЗАКАЗОВ ВСЕГО
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-serif text-[#141b24] mt-2">
            {totalCount}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            в выбранном периоде
          </div>
        </div>

        {/* Card 2: Navy Highlight Card for Sum & Advance */}
        <div className="bg-[#181f2a] text-white rounded-2xl p-5 shadow-md relative overflow-hidden flex flex-col justify-between">
          {/* Subtle watermark circle */}
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full border border-white/10 pointer-events-none" />

          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            СУММА ЗАКАЗОВ
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            {formatCurrency(totalSum)}
          </div>
          <div className="text-xs text-[#e5a93c] font-medium mt-2 flex items-center gap-1.5">
            <span>Авансов собрано {formatCurrency(totalAdvance)}</span>
          </div>
        </div>

        {/* Card 3: In Work */}
        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            В РАБОТЕ
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-serif text-[#141b24] mt-2">
            {inWorkCount}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {notStartedCount > 0 ? `${notStartedCount} в очереди` : '0 ещё не начато'}
          </div>
        </div>

        {/* Card 4: Ready */}
        <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            ГОТОВО
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-serif text-[#141b24] mt-2">
            {readyCount}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-2">
            можно передавать клиенту
          </div>
        </div>
      </div>

      {/* 2-Column Main Section: Orders List (Left) + Month Summary Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Orders Card (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#e8e4dc] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          {/* Card Header with Title, Count, Search and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0ece4]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#f4f0e8] text-slate-700 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#181f2a]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif text-[#141b24]">
                  Заказы месяца
                </h2>
                <p className="text-xs text-slate-400">
                  {filtered.length} {filtered.length === 1 ? 'запись' : 'записей'} в журнале
                </p>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={effectiveSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Найти клиента или заказ..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#f7f4ee] border border-[#e8e4dc] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]/50"
                />
                {effectiveSearch && (
                  <button
                    type="button"
                    onClick={() => setLocalSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status filter dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-[#f7f4ee] border border-[#e8e4dc] text-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#e5a93c]/50"
              >
                <option value="all">Все статусы</option>
                <option value="в разработке">В работе</option>
                <option value="готово">Готово</option>
                <option value="не начат">Не начат</option>
              </select>
            </div>
          </div>

          {/* Orders Rows List */}
          {filtered.length === 0 ? (
            <div className="py-12 text-center space-y-3 text-slate-400">
              <div className="w-12 h-12 rounded-full bg-[#f7f4ee] flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-600">Заказов не найдено</p>
              <p className="text-xs text-slate-400">
                Создайте новый заказ или выберите другой период в левом архиве.
              </p>
              <button
                type="button"
                onClick={onNewOrder}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e5a93c] text-slate-950 font-bold text-xs shadow-xs hover:bg-[#d89b2f] transition-colors"
              >
                <FilePlus2 className="w-4 h-4" />
                <span>Создать документ</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#f2eee7]">
              {filtered.map((order) => {
                const price = order.price || 0;
                const advance = order.advance || 0;
                const remaining = Math.max(0, price - advance);
                const percentAdvance =
                  price > 0 ? Math.min(100, Math.round((advance / price) * 100)) : 0;

                // Status styling
                let statusBadgeClass = 'bg-[#f1f3f5] text-[#495057] border-[#dee2e6]';
                let statusLabel = 'Не начат';
                let StatusIcon = CircleDashed;

                if (order.status === 'в разработке') {
                  statusBadgeClass = 'bg-[#fdf3e7] text-[#b45309] border-[#fae0c5]';
                  statusLabel = 'В работе';
                  StatusIcon = Clock;
                } else if (order.status === 'готово') {
                  statusBadgeClass = 'bg-[#eaf7ee] text-[#137333] border-[#c4ebd1]';
                  statusLabel = 'Готово';
                  StatusIcon = CheckCircle2;
                }

                // Format short order number
                const shortNum = order.orderNumberFormatted || `№ ${order.orderNumber}`;

                return (
                  <div
                    key={order.id}
                    id={`order-item-${order.id}`}
                    onClick={() => onOpenOrderTab(order)}
                    className="py-3.5 px-2 hover:bg-[#fbf9f5] rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* Left: Badge + Client & Title */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Round Order Number Badge */}
                      <div className="w-11 h-11 rounded-full bg-[#f2ece2] border border-[#e2dcce] flex flex-col items-center justify-center shrink-0 text-center font-mono font-bold text-slate-800">
                        <span className="text-[9px] uppercase tracking-tighter text-slate-500 font-semibold leading-none">
                          №
                        </span>
                        <span className="text-xs font-bold leading-tight">
                          {order.orderNumber}
                        </span>
                      </div>

                      {/* Client info & order title */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[#141b24] truncate">
                            {order.clientName || 'Без имени'}
                          </span>
                          {order.clientPhone && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectClientHistory(order.clientPhone);
                              }}
                              className="text-xs font-mono text-slate-500 hover:text-[#e5a93c] transition-colors flex items-center gap-1"
                              title="Показать заказы этого клиента"
                            >
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{order.clientPhone}</span>
                            </button>
                          )}
                        </div>

                        {/* Title & Advance Progress Bar */}
                        <div className="flex items-center gap-3 flex-wrap text-xs">
                          <span className="font-medium text-slate-700 truncate max-w-xs sm:max-w-md">
                            {order.orderTitle || '— Без описания —'}
                          </span>

                          {price > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0">
                              <div className="w-20 sm:w-24 h-1.5 bg-[#ede8df] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#e5a93c] rounded-full transition-all"
                                  style={{ width: `${percentAdvance}%` }}
                                />
                              </div>
                              <span className="font-medium">
                                {percentAdvance >= 100 ? 'Оплачено' : `${percentAdvance}% аванс`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Financial + Status Pill + Actions */}
                    <div
                      className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f2eee7]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Price & Advance */}
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-[#141b24] font-mono">
                          {formatCurrency(price)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          аванс {formatCurrency(advance)}
                        </div>
                      </div>

                      {/* Status pill (clickable quick change) */}
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            onQuickUpdateStatus(order.id, e.target.value as OrderStatus)
                          }
                          className={`appearance-none px-3 py-1 pr-6 rounded-full text-xs font-semibold border cursor-pointer focus:outline-none transition-all ${statusBadgeClass}`}
                        >
                          <option value="в разработке">В работе</option>
                          <option value="готово">Готово</option>
                          <option value="не начат">Не начат</option>
                        </select>
                        <StatusIcon className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                      </div>

                      {/* Row Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onPrintOrder(order)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-[#f2ece2] transition-colors"
                          title="Распечатать квитанцию"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenOrderTab(order)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#e5a93c] hover:bg-[#f2ece2] transition-colors"
                          title="Открыть в отдельной вкладке"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Удалить заказ ${formatOrderNumber(order.orderNumber)}?`)) {
                              onDeleteOrder(order.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Month Summary & Little Note Widgets (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Month Summary */}
          <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ece4]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                СВОДКА МЕСЯЦА
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                {periodCode || `${String(currentMonthNum).padStart(2, '0')} / ${currentYearNum}`}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 font-medium">К оплате (остаток):</span>
                <span className="font-bold font-mono text-sm text-[#141b24]">
                  {formatCurrency(totalRemaining)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 font-medium">Готово:</span>
                <span className="font-bold font-mono text-sm text-emerald-700">
                  {readyCount}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 font-medium">В процессе:</span>
                <span className="font-bold font-mono text-sm text-slate-800">
                  {inWorkCount}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 font-medium">В очереди:</span>
                <span className="font-bold font-mono text-sm text-slate-400">
                  {notStartedCount}
                </span>
              </div>
            </div>

            {onOpenClients && (
              <button
                type="button"
                onClick={onOpenClients}
                className="w-full mt-2 py-2.5 px-3 rounded-xl bg-[#f7f4ee] hover:bg-[#efeae0] text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-[#e8e4dc]"
              >
                <Users className="w-3.5 h-3.5 text-[#e5a93c]" />
                <span>Справочник клиентов ({orders.length})</span>
              </button>
            )}
          </div>

          {/* Card 2: Warm Workshop Note Widget */}
          <div className="bg-[#fcfaf4] border border-[#f2e7cc] rounded-2xl p-5 shadow-xs space-y-2.5">
            <div className="font-serif font-bold text-sm text-[#141b24]">
              Маленькая заметка
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Записывайте аванс сразу — так цифры в журнале остаются честными.
            </p>
            <div className="h-1 w-10 bg-[#e5a93c] rounded-full mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

