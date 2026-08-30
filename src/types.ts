export type OrderStatus = 'не начат' | 'в разработке' | 'готово';

export interface OrderItem {
  id: string; // unique internal key
  orderNumber: number; // consecutive auto-increment number, e.g. 1001, 1002
  orderNumberFormatted: string; // e.g. "#1001" or "№ 1001"
  clientName: string;
  clientPhone: string;
  orderTitle: string; // Название заказа / детали
  price: number; // Цена за деталь / общая стоимость
  advance: number; // Аванс (полученная предоплата)
  status: OrderStatus;
  createdAt: string; // ISO string
  orderDate: string; // YYYY-MM-DD
  year: number; // e.g. 2026
  month: number; // 1-12
  notes?: string; // Дополнительные примечания
}

export interface ClientProfile {
  phone: string;
  name: string;
  totalOrders: number;
  lastOrderDate: string;
  orderIds: string[];
}

export type TabType = 'dashboard' | 'order_view' | 'order_edit' | 'order_new';

export interface AppTab {
  id: string; // e.g. 'dashboard' or 'order-1001' or 'new-order'
  title: string;
  type: TabType;
  orderId?: string; // id of order if tab is order_view/edit
  isNew?: boolean;
}

export interface MonthSummary {
  month: number;
  monthName: string;
  year: number;
  ordersCount: number;
  totalSum: number;
  totalAdvance: number;
  readyCount: number;
  inProgressCount: number;
  notStartedCount: number;
}

export interface YearArchive {
  year: number;
  isCurrentYear: boolean;
  totalOrders: number;
  totalSum: number;
  months: MonthSummary[];
}
