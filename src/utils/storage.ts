import { OrderItem, ClientProfile, YearArchive, MonthSummary } from '../types';

const STORAGE_KEY_ORDERS = 'db_orders_store_v1';
const STORAGE_KEY_COUNTER = 'db_order_counter_v1';

export const RUSSIAN_MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const INITIAL_SAMPLE_ORDERS: OrderItem[] = [
  {
    id: 'ord-1001',
    orderNumber: 1001,
    orderNumberFormatted: '№ 1001',
    clientName: 'Алексей Смирнов',
    clientPhone: '+7 (916) 452-88-12',
    orderTitle: 'Изготовление фланца из нержавеющей стали 12Х18Н10Т (2 шт)',
    price: 18500,
    advance: 10000,
    status: 'готово',
    createdAt: '2026-07-15T10:30:00.000Z',
    orderDate: '2026-07-15',
    year: 2026,
    month: 7,
    notes: 'Заказчик забрал детали самовывозом. Предоставлен паспорт качества.',
  },
  {
    id: 'ord-1002',
    orderNumber: 1002,
    orderNumberFormatted: '№ 1002',
    clientName: 'Михаил Ковалев',
    clientPhone: '+7 (925) 314-77-90',
    orderTitle: 'Токарная обработка вала привода редуктора L=450мм',
    price: 34000,
    advance: 15000,
    status: 'в разработке',
    createdAt: '2026-08-04T09:15:00.000Z',
    orderDate: '2026-08-04',
    year: 2026,
    month: 8,
    notes: 'Чертеж согласован, требуется термообработка ТВЧ.',
  },
  {
    id: 'ord-1003',
    orderNumber: 1003,
    orderNumberFormatted: '№ 1003',
    clientName: 'Дмитрий Васильев (ООО ПромТех)',
    clientPhone: '+7 (903) 789-11-44',
    orderTitle: 'Комплект шестерен прямозубых m=3.5 z=28 (4 шт)',
    price: 48000,
    advance: 20000,
    status: 'не начат',
    createdAt: '2026-08-14T14:20:00.000Z',
    orderDate: '2026-08-14',
    year: 2026,
    month: 8,
    notes: 'Ожидается поставка заготовок из круга 40Х.',
  },
  {
    id: 'ord-1004',
    orderNumber: 1004,
    orderNumberFormatted: '№ 1004',
    clientName: 'Алексей Смирнов',
    clientPhone: '+7 (916) 452-88-12',
    orderTitle: 'Шлифовка посадочных шеек вала насоса',
    price: 12000,
    advance: 12000,
    status: 'в разработке',
    createdAt: '2026-08-16T11:00:00.000Z',
    orderDate: '2026-08-16',
    year: 2026,
    month: 8,
    notes: 'Постоянный клиент. Полная оплата сразу.',
  },
  {
    id: 'ord-1005',
    orderNumber: 1005,
    orderNumberFormatted: '№ 1005',
    clientName: 'Сергей Морозов',
    clientPhone: '+7 (999) 811-22-33',
    orderTitle: 'Лазерный раскрой и гибка корпусной панели 2мм (10 шт)',
    price: 27500,
    advance: 10000,
    status: 'готово',
    createdAt: '2025-11-18T16:00:00.000Z',
    orderDate: '2025-11-18',
    year: 2025,
    month: 11,
    notes: 'Архивный заказ прошлого года. Оплачен полностью.',
  },
  {
    id: 'ord-1006',
    orderNumber: 1006,
    orderNumberFormatted: '№ 1006',
    clientName: 'Елена Кузнецова',
    clientPhone: '+7 (915) 600-44-55',
    orderTitle: 'Сварка рамы испытательного стенда 1200х800мм',
    price: 45000,
    advance: 45000,
    status: 'готово',
    createdAt: '2025-12-05T12:00:00.000Z',
    orderDate: '2025-12-05',
    year: 2025,
    month: 12,
    notes: 'Покраска порошковой краской RAL 7035.',
  }
];

export function getStoredOrders(): OrderItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(INITIAL_SAMPLE_ORDERS));
      return INITIAL_SAMPLE_ORDERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SAMPLE_ORDERS;
  } catch (e) {
    console.error('Error loading stored orders:', e);
    return INITIAL_SAMPLE_ORDERS;
  }
}

export function saveOrders(orders: OrderItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving orders:', e);
  }
}

export function getNextOrderNumber(): number {
  const orders = getStoredOrders();
  if (orders.length === 0) {
    const stored = parseInt(localStorage.getItem(STORAGE_KEY_COUNTER) || '1001', 10);
    return isNaN(stored) ? 1001 : stored;
  }
  const maxNumber = Math.max(...orders.map((o) => o.orderNumber || 0));
  const next = Math.max(maxNumber + 1, 1001);
  localStorage.setItem(STORAGE_KEY_COUNTER, next.toString());
  return next;
}

export function formatOrderNumber(num: number): string {
  return `№ ${num}`;
}

export function getClientProfiles(orders: OrderItem[]): ClientProfile[] {
  const map = new Map<string, ClientProfile>();

  orders.forEach((order) => {
    const phone = order.clientPhone.trim();
    if (!phone) return;

    // Clean key for grouping phone
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const key = cleanPhone || phone;

    if (!map.has(key)) {
      map.set(key, {
        phone: order.clientPhone,
        name: order.clientName,
        totalOrders: 1,
        lastOrderDate: order.orderDate,
        orderIds: [order.id],
      });
    } else {
      const existing = map.get(key)!;
      existing.totalOrders += 1;
      existing.orderIds.push(order.id);
      // Prefer latest name and date
      if (order.orderDate >= existing.lastOrderDate) {
        existing.lastOrderDate = order.orderDate;
        if (order.clientName) existing.name = order.clientName;
      }
    }
  });

  return Array.from(map.values()).sort((a, b) => b.totalOrders - a.totalOrders);
}

export function searchClients(query: string, clients: ClientProfile[]): ClientProfile[] {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().replace(/[^\d\wа-яё]/gi, '');
  if (!q) return [];

  return clients.filter((c) => {
    const phoneClean = c.phone.toLowerCase().replace(/[^\d\wа-яё]/gi, '');
    const nameClean = c.name.toLowerCase();
    return phoneClean.includes(q) || nameClean.includes(query.toLowerCase());
  });
}

export function groupOrdersByYearAndMonth(orders: OrderItem[], currentYear: number): YearArchive[] {
  // Collect all years present
  const yearsSet = new Set<number>();
  yearsSet.add(currentYear);
  orders.forEach((o) => {
    if (o.year) yearsSet.add(o.year);
  });

  const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);

  return sortedYears.map((year) => {
    const yearOrders = orders.filter((o) => o.year === year);
    const monthsMap = new Map<number, OrderItem[]>();

    // For current year, we can show active months, for past years show months that had orders
    yearOrders.forEach((o) => {
      const m = o.month || 1;
      if (!monthsMap.has(m)) {
        monthsMap.set(m, []);
      }
      monthsMap.get(m)!.push(o);
    });

    // Generate month summaries
    const months: MonthSummary[] = [];

    if (year === currentYear) {
      // In current year, show all months up to current or all 12
      for (let m = 1; m <= 12; m++) {
        const mOrders = monthsMap.get(m) || [];
        months.push({
          month: m,
          monthName: RUSSIAN_MONTHS[m - 1],
          year,
          ordersCount: mOrders.length,
          totalSum: mOrders.reduce((sum, o) => sum + (o.price || 0), 0),
          totalAdvance: mOrders.reduce((sum, o) => sum + (o.advance || 0), 0),
          readyCount: mOrders.filter((o) => o.status === 'готово').length,
          inProgressCount: mOrders.filter((o) => o.status === 'в разработке').length,
          notStartedCount: mOrders.filter((o) => o.status === 'не начат').length,
        });
      }
    } else {
      // In archived years, only show months that had orders (sorted 12 down to 1)
      Array.from(monthsMap.keys())
        .sort((a, b) => b - a)
        .forEach((m) => {
          const mOrders = monthsMap.get(m) || [];
          months.push({
            month: m,
            monthName: RUSSIAN_MONTHS[m - 1],
            year,
            ordersCount: mOrders.length,
            totalSum: mOrders.reduce((sum, o) => sum + (o.price || 0), 0),
            totalAdvance: mOrders.reduce((sum, o) => sum + (o.advance || 0), 0),
            readyCount: mOrders.filter((o) => o.status === 'готово').length,
            inProgressCount: mOrders.filter((o) => o.status === 'в разработке').length,
            notStartedCount: mOrders.filter((o) => o.status === 'не начат').length,
          });
        });
    }

    return {
      year,
      isCurrentYear: year === currentYear,
      totalOrders: yearOrders.length,
      totalSum: yearOrders.reduce((sum, o) => sum + (o.price || 0), 0),
      months,
    };
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatDateRu(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function exportDatabaseBackup(orders: OrderItem[]): void {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    ordersCount: orders.length,
    orders,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `baza_zakazov_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
