import React, { useState, useEffect, useRef } from 'react';
import { OrderItem, OrderStatus, ClientProfile } from '../types';
import {
  formatOrderNumber,
  formatCurrency,
  searchClients,
  formatDateRu,
} from '../utils/storage';
import {
  Save,
  Printer,
  Trash2,
  Copy,
  CheckCircle2,
  Clock,
  CircleDashed,
  User,
  Phone,
  Tag,
  Coins,
  Receipt,
  Calendar,
  Sparkles,
  ArrowLeft,
  FileCheck,
} from 'lucide-react';

interface OrderDocumentViewProps {
  order: OrderItem;
  allClients: ClientProfile[];
  onSave: (order: OrderItem) => void;
  onDelete?: (orderId: string) => void;
  onDuplicate?: (order: OrderItem) => void;
  onPrint: (order: OrderItem) => void;
  onBackToDashboard: () => void;
  isNewOrder?: boolean;
}

export const OrderDocumentView: React.FC<OrderDocumentViewProps> = ({
  order: initialOrder,
  allClients,
  onSave,
  onDelete,
  onDuplicate,
  onPrint,
  onBackToDashboard,
  isNewOrder = false,
}) => {
  const [formData, setFormData] = useState<OrderItem>({ ...initialOrder });
  const [phoneSuggestions, setPhoneSuggestions] = useState<ClientProfile[]>([]);
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync with prop changes if switching tabs
  useEffect(() => {
    setFormData({ ...initialOrder });
  }, [initialOrder.id]);

  // Handle phone input changes & query client autocomplete
  const handlePhoneChange = (val: string) => {
    setFormData((prev) => ({ ...prev, clientPhone: val }));

    if (val.trim().length >= 2) {
      const matches = searchClients(val, allClients);
      setPhoneSuggestions(matches);
      setShowPhoneDropdown(matches.length > 0);
    } else {
      setPhoneSuggestions([]);
      setShowPhoneDropdown(false);
    }
  };

  // When user selects a client from autocomplete dropdown
  const handleSelectClient = (client: ClientProfile) => {
    setFormData((prev) => ({
      ...prev,
      clientPhone: client.phone,
      clientName: client.name || prev.clientName,
    }));
    setShowPhoneDropdown(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        phoneInputRef.current &&
        !phoneInputRef.current.contains(e.target as Node)
      ) {
        setShowPhoneDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update date / month / year automatically
  const handleDateChange = (dateVal: string) => {
    if (!dateVal) return;
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      setFormData((prev) => ({
        ...prev,
        orderDate: dateVal,
        year: d.getFullYear(),
        month: d.getMonth() + 1,
      }));
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validation
    if (!formData.orderTitle.trim()) {
      alert('Пожалуйста, укажите название заказа / детали');
      return;
    }

    onSave(formData);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2500);
  };

  const priceNum = Number(formData.price) || 0;
  const advanceNum = Number(formData.advance) || 0;
  const remaining = Math.max(0, priceNum - advanceNum);
  const isFullyPaid = priceNum > 0 && advanceNum >= priceNum;
  const isPartialPaid = advanceNum > 0 && advanceNum < priceNum;

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 pb-20 space-y-5">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e2dcce]">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 rounded-xl border border-[#ded8cd] shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>К списку заказов</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Print button */}
          <button
            type="button"
            id="btn-doc-print"
            onClick={() => onPrint(formData)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#faf8f4] text-slate-700 text-xs font-semibold transition-colors border border-[#ded8cd] shadow-xs"
            title="Распечатать квитанцию для клиента"
          >
            <Printer className="w-3.5 h-3.5 text-[#e5a93c]" />
            <span className="hidden sm:inline">Печать квитанции</span>
          </button>

          {/* Duplicate button */}
          {onDuplicate && !isNewOrder && (
            <button
              type="button"
              id="btn-doc-duplicate"
              onClick={() => onDuplicate(formData)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#faf8f4] text-slate-700 text-xs font-semibold transition-colors border border-[#ded8cd] shadow-xs"
              title="Создать копию этого заказа"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Дублировать</span>
            </button>
          )}

          {/* Delete button */}
          {onDelete && !isNewOrder && (
            <button
              type="button"
              id="btn-doc-delete"
              onClick={() => {
                if (
                  confirm(
                    `Вы уверены, что хотите удалить заказ ${formatOrderNumber(
                      formData.orderNumber
                    )}?`
                  )
                ) {
                  onDelete(formData.id);
                }
              }}
              className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 text-xs transition-colors border border-[#ded8cd] shadow-xs"
              title="Удалить документ заказа"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Main Save Button */}
          <button
            type="button"
            id="btn-doc-save"
            onClick={() => handleSave()}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer ${
              isSavedRecently
                ? 'bg-emerald-600 text-white'
                : 'bg-[#181f2a] hover:bg-[#252f40] text-white'
            }`}
          >
            {isSavedRecently ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Сохранено!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#e5a93c]" />
                <span>Сохранить в базу</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Document Card Container */}
      <div className="bg-white border border-[#e8e4dc] rounded-2xl shadow-xs overflow-hidden">
        {/* Document Header with Order Number & Auto-Badge */}
        <div className="p-5 sm:p-6 border-b border-[#f0ece4] flex flex-wrap items-center justify-between gap-4 bg-gradient-to-b from-[#fdfbf7] to-white">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-[#e5a93c] text-slate-950 font-black text-sm tracking-wider font-mono shadow-xs">
                {formatOrderNumber(formData.orderNumber)}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#141b24] tracking-tight">
                {isNewOrder ? 'Новый документ заказа' : `Документ заказа ${formatOrderNumber(formData.orderNumber)}`}
              </h2>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#e5a93c]" />
              Номер присвоен автоматически из базы данных
            </p>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-[#f7f4ee] px-3 py-1.5 rounded-xl border border-[#ded8cd] text-xs">
            <Calendar className="w-4 h-4 text-[#e5a93c]" />
            <span className="text-slate-500 font-medium">Дата:</span>
            <input
              type="date"
              id="doc-date-input"
              value={formData.orderDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Document Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-7 space-y-6">
          {/* SECTION 1: Client Details (Name & Smart Phone Autocomplete) */}
          <div className="bg-[#faf8f4] p-4 sm:p-5 rounded-2xl border border-[#ede8df] space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-[#eee9df]">
              <User className="w-4 h-4 text-[#e5a93c]" />
              <span>Данные заказчика</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone with autocomplete */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    3. Номер телефона
                  </span>
                  <span className="text-[10px] text-[#e5a93c] font-bold">
                    Автопоиск по базе
                  </span>
                </label>
                <input
                  ref={phoneInputRef}
                  type="text"
                  id="doc-client-phone"
                  value={formData.clientPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onFocus={() => {
                    if (formData.clientPhone.trim().length >= 2) {
                      const matches = searchClients(formData.clientPhone, allClients);
                      setPhoneSuggestions(matches);
                      setShowPhoneDropdown(matches.length > 0);
                    }
                  }}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#ded8cd] text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]/50 focus:border-[#e5a93c] transition-all font-mono"
                />

                {/* Autocomplete Dropdown */}
                {showPhoneDropdown && phoneSuggestions.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-20 left-0 right-0 mt-1 bg-white border border-[#ded8cd] rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-[#f2eee7]"
                  >
                    <div className="px-3 py-1.5 bg-[#f7f4ee] text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                      <span>Найдено в базе клиентов:</span>
                      <span>{phoneSuggestions.length}</span>
                    </div>
                    {phoneSuggestions.map((client, idx) => (
                      <div
                        key={`client-sug-${idx}`}
                        onClick={() => handleSelectClient(client)}
                        className="p-2.5 hover:bg-[#fbf9f5] cursor-pointer transition-colors flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 font-mono flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-[#e5a93c]" />
                            {client.phone}
                          </div>
                          {client.name && (
                            <div className="text-[11px] text-slate-600">{client.name}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-full bg-[#f2ece2] text-slate-700 font-mono text-[10px]">
                            {client.totalOrders} зак.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Client Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  2. Имя клиента / Организация
                </label>
                <input
                  type="text"
                  id="doc-client-name"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, clientName: e.target.value }))
                  }
                  placeholder="Иван Петров или ООО «Мастер»"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#ded8cd] text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]/50 focus:border-[#e5a93c] transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Order Title & Part Description */}
          <div className="bg-[#faf8f4] p-4 sm:p-5 rounded-2xl border border-[#ede8df] space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#e5a93c]" />
              4. Название заказа / Наименование детали и работ *
            </label>
            <input
              type="text"
              id="doc-order-title"
              required
              value={formData.orderTitle}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, orderTitle: e.target.value }))
              }
              placeholder="Например: 4 круглых детали или Токарная обработка вала"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#ded8cd] text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]/50 focus:border-[#e5a93c] transition-all font-medium"
            />
          </div>

          {/* SECTION 3: Financials (Price, Advance & Remaining Calculation) */}
          <div className="bg-[#faf8f4] p-4 sm:p-5 rounded-2xl border border-[#ede8df] space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-[#eee9df]">
              <Receipt className="w-4 h-4 text-[#e5a93c]" />
              <span>5. Стоимость детали и Аванс</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 5.1 Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-slate-400" />
                  Цена за деталь (руб)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="doc-order-price"
                    min="0"
                    step="100"
                    value={formData.price || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0"
                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-white border border-[#ded8cd] text-sm text-slate-900 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-[#e5a93c]/50 focus:border-[#e5a93c] transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ₽
                  </span>
                </div>
              </div>

              {/* 5.2 Advance */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-[#e5a93c]" />
                  Аванс (получено)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="doc-order-advance"
                    min="0"
                    step="100"
                    value={formData.advance || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        advance: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0"
                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-white border border-[#e5a93c] text-sm text-slate-900 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-[#e5a93c]/50 focus:border-[#e5a93c] transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#e5a93c]">
                    ₽
                  </span>
                </div>
              </div>

              {/* 5.3 Calculated Balance */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Остаток к оплате
                </label>
                <div className="px-3.5 py-2.5 rounded-xl bg-white border border-[#ded8cd] flex items-center justify-between">
                  <span className="text-sm font-extrabold font-mono text-slate-900">
                    {formatCurrency(remaining)}
                  </span>
                  {isFullyPaid && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eaf7ee] text-[#137333] border border-[#c4ebd1]">
                      Оплачено
                    </span>
                  )}
                  {isPartialPaid && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fdf3e7] text-[#b45309] border border-[#fae0c5]">
                      Аванс {Math.round((advanceNum / priceNum) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Order Status (6. Статус заказа "готово - в разработке - не начат") */}
          <div className="bg-[#faf8f4] p-4 sm:p-5 rounded-2xl border border-[#ede8df] space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#e5a93c]" />
              6. Статус выполнения заказа
            </label>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Не начат */}
              <button
                type="button"
                id="doc-status-not-started"
                onClick={() => setFormData((prev) => ({ ...prev, status: 'не начат' }))}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  formData.status === 'не начат'
                    ? 'bg-white text-slate-900 border-slate-400 shadow-xs ring-2 ring-slate-400/30'
                    : 'bg-white/60 text-slate-500 border-[#ded8cd] hover:bg-white hover:text-slate-800'
                }`}
              >
                <CircleDashed className="w-4 h-4 text-slate-400" />
                <span>Не начат</span>
              </button>

              {/* В разработке */}
              <button
                type="button"
                id="doc-status-in-progress"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, status: 'в разработке' }))
                }
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  formData.status === 'в разработке'
                    ? 'bg-[#fdf3e7] text-[#b45309] border-[#fae0c5] shadow-xs ring-2 ring-[#fae0c5]'
                    : 'bg-white/60 text-slate-500 border-[#ded8cd] hover:bg-white hover:text-slate-800'
                }`}
              >
                <Clock className="w-4 h-4 text-[#b45309]" />
                <span>В работе</span>
              </button>

              {/* Готово */}
              <button
                type="button"
                id="doc-status-ready"
                onClick={() => setFormData((prev) => ({ ...prev, status: 'готово' }))}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  formData.status === 'готово'
                    ? 'bg-[#eaf7ee] text-[#137333] border-[#c4ebd1] shadow-xs ring-2 ring-[#c4ebd1]'
                    : 'bg-white/60 text-slate-500 border-[#ded8cd] hover:bg-white hover:text-slate-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#137333]" />
                <span>Готово</span>
              </button>
            </div>
          </div>

          {/* SECTION 5: Additional Notes / Specs */}
          <div className="bg-[#faf8f4] p-4 sm:p-5 rounded-2xl border border-[#ede8df] space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Примечания / Технические параметры / Требования к детали
            </label>
            <textarea
              rows={3}
              id="doc-order-notes"
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Материал детали, чертеж, контактное лицо, особые пожелания..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#ded8cd] text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]/50 focus:border-[#e5a93c] transition-all resize-none"
            />
          </div>

          {/* Bottom Submit Toolbar */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eee9df]">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-[#f7f4ee] transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              id="btn-doc-submit-bottom"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#181f2a] hover:bg-[#252f40] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#e5a93c]" />
              <span>Сохранить в базу данных</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

