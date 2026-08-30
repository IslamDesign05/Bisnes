import React, { useState } from 'react';
import { ClientProfile, OrderItem } from '../types';
import { Users, Phone, User, FilePlus2, Search, X, History } from 'lucide-react';
import { formatDateRu } from '../utils/storage';

interface ClientsModalProps {
  clients: ClientProfile[];
  orders: OrderItem[];
  onClose: () => void;
  onNewOrderForClient: (client: ClientProfile) => void;
  onFilterByClientPhone: (phone: string) => void;
}

export const ClientsModal: React.FC<ClientsModalProps> = ({
  clients,
  orders,
  onClose,
  onNewOrderForClient,
}) => {
  const [search, setSearch] = useState('');
  const [selectedClientOrders, setSelectedClientOrders] = useState<OrderItem[] | null>(null);
  const [activeClientName, setActiveClientName] = useState<string>('');

  const filteredClients = clients.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.phone.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
  });

  const handleViewClientOrders = (client: ClientProfile) => {
    const clientOrders = orders.filter((o) => client.orderIds.includes(o.id));
    setSelectedClientOrders(clientOrders);
    setActiveClientName(client.name || client.phone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-[#ded8cd] rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#faf8f4] border-b border-[#eee9df] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#f2ece2] text-slate-800">
              <Users className="w-5 h-5 text-[#e5a93c]" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-[#141b24]">
                База номеров телефонов клиентов
              </h3>
              <p className="text-xs text-slate-500">
                Всего уникальных клиентов в базе: {clients.length}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#f2ece2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-[#eee9df] bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск клиента по имени или номеру телефона..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#f7f4ee] border border-[#ded8cd] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e5a93c]/50"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fcfaf7]">
          {selectedClientOrders ? (
            /* Selected Client Order History View */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#ded8cd]">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#e5a93c]" />
                  <span className="text-xs font-semibold text-slate-900">
                    История заказов: {activeClientName} ({selectedClientOrders.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClientOrders(null)}
                  className="text-xs text-[#b45309] font-semibold hover:underline"
                >
                  ← Назад к списку всех клиентов
                </button>
              </div>

              <div className="space-y-2">
                {selectedClientOrders.map((o) => (
                  <div
                    key={o.id}
                    className="p-3 bg-white border border-[#ded8cd] rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          {o.orderNumberFormatted}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          от {formatDateRu(o.orderDate || o.createdAt)}
                        </span>
                      </div>
                      <div className="font-medium text-slate-700 mt-1">{o.orderTitle}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">
                        {o.price.toLocaleString('ru-RU')} ₽
                      </div>
                      <span className="text-[10px] text-slate-500 capitalize">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Клиентов не найдено. При создании новых заказов номера сохраняются автоматически.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredClients.map((client, idx) => (
                <div
                  key={`client-card-${idx}`}
                  className="p-3.5 bg-white border border-[#e8e4dc] rounded-xl hover:border-[#ded8cd] shadow-xs transition-all flex flex-col justify-between gap-3 group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{client.name || 'Без имени'}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f2ece2] text-slate-700 font-mono font-semibold">
                        {client.totalOrders} {client.totalOrders === 1 ? 'заказ' : 'заказа'}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-600 flex items-center gap-1.5 mt-1.5">
                      <Phone className="w-3 h-3 text-[#e5a93c]" />
                      <span>{client.phone}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1">
                      Последний заказ: {formatDateRu(client.lastOrderDate)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#f0ece4]">
                    <button
                      type="button"
                      onClick={() => handleViewClientOrders(client)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-[#f7f4ee] hover:bg-[#efeae0] text-slate-700 text-xs font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <History className="w-3 h-3 text-slate-500" />
                      <span>История</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onNewOrderForClient(client);
                        onClose();
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-[#181f2a] hover:bg-[#252f40] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <FilePlus2 className="w-3 h-3 text-[#e5a93c]" />
                      <span>Новый заказ</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#faf8f4] border-t border-[#eee9df] text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-[#ded8cd] text-slate-700 text-xs font-semibold hover:bg-[#f7f4ee] transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

