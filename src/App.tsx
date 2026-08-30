import React, { useState, useEffect } from 'react';
import {
  OrderItem,
  AppTab,
  OrderStatus,
  ClientProfile,
} from './types';
import {
  getStoredOrders,
  saveOrders,
  getNextOrderNumber,
  formatOrderNumber,
  getClientProfiles,
  groupOrdersByYearAndMonth,
  exportDatabaseBackup,
} from './utils/storage';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { MonthYearSidebar } from './components/MonthYearSidebar';
import { OrderList } from './components/OrderList';
import { OrderDocumentView } from './components/OrderDocumentView';
import { PrintReceiptModal } from './components/PrintReceiptModal';
import { ClientsModal } from './components/ClientsModal';

export default function App() {
  const [orders, setOrders] = useState<OrderItem[]>(() => getStoredOrders());

  // Tabs system
  const [tabs, setTabs] = useState<AppTab[]>([
    { id: 'dashboard', title: 'Главное меню / База', type: 'dashboard' },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('dashboard');

  // Period filters
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');

  // Search & Modals
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [printingOrder, setPrintingOrder] = useState<OrderItem | null>(null);
  const [isClientsModalOpen, setIsClientsModalOpen] = useState<boolean>(false);

  // Auto-save orders whenever they change
  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  // Derived lists
  const allClients = getClientProfiles(orders);
  const yearArchives = groupOrdersByYearAndMonth(orders, currentYear);

  // Filter orders by selected Year & Month
  const filteredByPeriodOrders = orders.filter((o) => {
    if (selectedYear !== 'all' && o.year !== selectedYear) return false;
    if (selectedMonth !== 'all' && o.month !== selectedMonth) return false;
    return true;
  });

  // Financial & status calculations
  const totalOrders = orders.length;
  const readyOrders = orders.filter((o) => o.status === 'готово').length;
  const inProgressOrders = orders.filter((o) => o.status === 'в разработке').length;
  const notStartedOrders = orders.filter((o) => o.status === 'не начат').length;
  const totalSum = orders.reduce((s, o) => s + (o.price || 0), 0);
  const totalAdvance = orders.reduce((s, o) => s + (o.advance || 0), 0);

  // --- ACTIONS ---

  // 1. Create New Order & Open in a New Tab
  const handleCreateNewOrder = (prefillClient?: ClientProfile) => {
    const nextNum = getNextOrderNumber();
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const newOrder: OrderItem = {
      id: `ord-${Date.now()}`,
      orderNumber: nextNum,
      orderNumberFormatted: formatOrderNumber(nextNum),
      clientName: prefillClient ? prefillClient.name : '',
      clientPhone: prefillClient ? prefillClient.phone : '',
      orderTitle: '',
      price: 0,
      advance: 0,
      status: 'не начат',
      createdAt: today.toISOString(),
      orderDate: todayStr,
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      notes: '',
    };

    const tabId = `tab-new-${newOrder.id}`;
    const newTab: AppTab = {
      id: tabId,
      title: `Новый ${formatOrderNumber(nextNum)}`,
      type: 'order_new',
      orderId: newOrder.id,
      isNew: true,
    };

    // Store in state so it exists
    setOrders((prev) => [newOrder, ...prev]);
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(tabId);
  };

  // 2. Open Existing Order in Tab
  const handleOpenOrderTab = (order: OrderItem) => {
    const existingTab = tabs.find((t) => t.orderId === order.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    const tabId = `tab-order-${order.id}`;
    const newTab: AppTab = {
      id: tabId,
      title: `${formatOrderNumber(order.orderNumber)} ${order.clientName ? '- ' + order.clientName : ''}`,
      type: 'order_view',
      orderId: order.id,
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(tabId);
  };

  // 3. Close Tab
  const handleCloseTab = (tabId: string) => {
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      const nextActive = newTabs[newTabs.length - 1] || newTabs[0];
      setActiveTabId(nextActive ? nextActive.id : 'dashboard');
    }
  };

  // 4. Save Order from Document View
  const handleSaveOrder = (updatedOrder: OrderItem) => {
    setOrders((prev) => {
      const exists = prev.some((o) => o.id === updatedOrder.id);
      if (exists) {
        return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
      }
      return [updatedOrder, ...prev];
    });

    // Update tab title if open
    setTabs((prev) =>
      prev.map((t) => {
        if (t.orderId === updatedOrder.id) {
          return {
            ...t,
            title: `${formatOrderNumber(updatedOrder.orderNumber)} ${
              updatedOrder.clientName ? '- ' + updatedOrder.clientName : ''
            }`,
            isNew: false,
          };
        }
        return t;
      })
    );
  };

  // 5. Delete Order
  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    const tabWithOrder = tabs.find((t) => t.orderId === orderId);
    if (tabWithOrder) {
      handleCloseTab(tabWithOrder.id);
    }
  };

  // 6. Duplicate Order
  const handleDuplicateOrder = (sourceOrder: OrderItem) => {
    const nextNum = getNextOrderNumber();
    const today = new Date();
    const duplicated: OrderItem = {
      ...sourceOrder,
      id: `ord-${Date.now()}`,
      orderNumber: nextNum,
      orderNumberFormatted: formatOrderNumber(nextNum),
      createdAt: today.toISOString(),
      orderDate: today.toISOString().slice(0, 10),
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      status: 'не начат',
      advance: 0,
    };

    setOrders((prev) => [duplicated, ...prev]);
    handleOpenOrderTab(duplicated);
  };

  // 7. Quick Status Change from List
  const handleQuickStatusChange = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  // 8. Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.orders) && parsed.orders.length > 0) {
          setOrders(parsed.orders);
          alert(`База данных успешно восстановлена! Загружено ${parsed.orders.length} заказов.`);
        } else if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed);
          alert(`База данных успешно восстановлена! Загружено ${parsed.length} заказов.`);
        } else {
          alert('Некорректный формат файла резервной копии.');
        }
      } catch (err) {
        alert('Ошибка при чтении файла резервной копии: ' + err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Active tab resolution
  const currentActiveTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const activeOrderForTab = currentActiveTab?.orderId
    ? orders.find((o) => o.id === currentActiveTab.orderId)
    : null;

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#141b24] flex flex-col font-sans selection:bg-[#e5a93c] selection:text-slate-950">
      {/* Global Header with brand, totals, search & backup controls */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewOrder={() => handleCreateNewOrder()}
        onExport={() => exportDatabaseBackup(orders)}
        onImport={handleImportBackup}
        totalOrders={totalOrders}
        readyOrders={readyOrders}
        inProgressOrders={inProgressOrders}
        notStartedOrders={notStartedOrders}
        totalSum={totalSum}
        totalAdvance={totalAdvance}
      />

      {/* Desktop-like Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        onNewOrder={() => handleCreateNewOrder()}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Period & Archive Sidebar */}
        <MonthYearSidebar
          yearArchives={yearArchives}
          currentYear={currentYear}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onSelectPeriod={(year, month) => {
            setSelectedYear(year);
            setSelectedMonth(month);
            setActiveTabId('dashboard');
          }}
          onOpenClients={() => setIsClientsModalOpen(true)}
          totalOrdersCount={totalOrders}
        />

        {/* Content View: Dashboard OR Active Order Tab */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f7f4ee]">
          {currentActiveTab?.type === 'dashboard' ? (
            /* Dashboard / Orders List View */
            <OrderList
              orders={filteredByPeriodOrders}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              searchQuery={searchQuery}
              onOpenOrderTab={handleOpenOrderTab}
              onNewOrder={() => handleCreateNewOrder()}
              onPrintOrder={(ord) => setPrintingOrder(ord)}
              onDeleteOrder={handleDeleteOrder}
              onQuickUpdateStatus={handleQuickStatusChange}
              onSelectClientHistory={(phone) => {
                setSearchQuery(phone);
                setActiveTabId('dashboard');
              }}
            />
          ) : activeOrderForTab ? (
            /* Order Document View in Tab */
            <OrderDocumentView
              order={activeOrderForTab}
              allClients={allClients}
              onSave={handleSaveOrder}
              onDelete={handleDeleteOrder}
              onDuplicate={handleDuplicateOrder}
              onPrint={(ord) => setPrintingOrder(ord)}
              onBackToDashboard={() => setActiveTabId('dashboard')}
              isNewOrder={currentActiveTab.isNew}
            />
          ) : (
            <div className="text-center py-16 text-slate-500">
              <p>Документ не найден или был удален.</p>
              <button
                type="button"
                onClick={() => setActiveTabId('dashboard')}
                className="mt-3 px-4 py-2 bg-[#181f2a] text-white font-bold rounded-xl text-xs hover:bg-[#252f40] transition-colors"
              >
                Вернуться в главное меню
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Print Receipt Modal */}
      {printingOrder && (
        <PrintReceiptModal
          order={printingOrder}
          onClose={() => setPrintingOrder(null)}
        />
      )}

      {/* Clients & Phonebook Modal */}
      {isClientsModalOpen && (
        <ClientsModal
          clients={allClients}
          orders={orders}
          onClose={() => setIsClientsModalOpen(false)}
          onNewOrderForClient={(client) => handleCreateNewOrder(client)}
          onFilterByClientPhone={(phone) => {
            setSearchQuery(phone);
            setActiveTabId('dashboard');
          }}
        />
      )}
    </div>
  );
}

