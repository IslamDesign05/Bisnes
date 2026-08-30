import React from 'react';
import { OrderItem } from '../types';
import { formatOrderNumber, formatCurrency, formatDateRu } from '../utils/storage';
import { Printer, X } from 'lucide-react';

interface PrintReceiptModalProps {
  order: OrderItem | null;
  onClose: () => void;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  order,
  onClose,
}) => {
  if (!order) return null;

  const price = order.price || 0;
  const advance = order.advance || 0;
  const remaining = Math.max(0, price - advance);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#ded8cd] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Controls (Not visible on print) */}
        <div className="no-print p-4 bg-[#faf8f4] border-b border-[#eee9df] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold font-serif text-[#141b24]">
            <Printer className="w-4 h-4 text-[#e5a93c]" />
            <span>Печать квитанции заказа</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#181f2a] hover:bg-[#252f40] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#e5a93c]" />
              <span>Распечатать</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#f2ece2] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-8 bg-white text-slate-900 print:p-0 print:m-0 font-sans">
          {/* Company & Order Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
            <div>
              <div className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                Квитанция-Заказ-Наряд
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Документ приема заказа на изготовление / обработку деталей
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black font-mono text-slate-900">
                {formatOrderNumber(order.orderNumber)}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                от {formatDateRu(order.orderDate || order.createdAt)}
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-2 gap-4 bg-[#fbf9f5] p-4 rounded-xl border border-[#ede8df] mb-6 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Заказчик / Клиент:</span>
              <span className="text-sm font-bold text-slate-900">
                {order.clientName || '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Контактный телефон:</span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {order.clientPhone || '—'}
              </span>
            </div>
          </div>

          {/* Order / Work Description */}
          <div className="mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Наименование заказа и детали
            </div>
            <div className="border border-[#ded8cd] rounded-xl p-4 bg-[#faf8f4]">
              <p className="text-sm font-semibold text-slate-900 whitespace-pre-wrap">
                {order.orderTitle}
              </p>
              {order.notes && (
                <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-[#ede8df]">
                  <strong className="text-slate-700">Примечание / требования:</strong> {order.notes}
                </p>
              )}
            </div>
          </div>

          {/* Financial Calculation Table */}
          <div className="border border-[#ded8cd] rounded-xl overflow-hidden mb-6 text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#f7f4ee] text-slate-700 border-b border-[#ded8cd] font-bold">
                <tr>
                  <th className="py-2.5 px-4">Финансовый расчет</th>
                  <th className="py-2.5 px-4 text-right">Сумма</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eee9df] text-slate-800 font-medium">
                <tr>
                  <td className="py-2.5 px-4">Стоимость заказа / детали:</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-sm text-slate-900">
                    {formatCurrency(price)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-emerald-800">
                    Внесенный аванс (получено):
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-800">
                    {formatCurrency(advance)}
                  </td>
                </tr>
                <tr className="bg-[#f7f4ee] font-bold text-slate-900">
                  <td className="py-3 px-4 text-sm">Остаток к оплате при получении:</td>
                  <td className="py-3 px-4 text-right font-mono text-base font-black">
                    {formatCurrency(remaining)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Order Status Badge & Signatures */}
          <div className="border-t border-[#ded8cd] pt-4 flex items-center justify-between text-xs text-slate-600 mb-8">
            <div>
              <span>Текущий статус: </span>
              <strong className="text-slate-900 uppercase font-bold">
                {order.status}
              </strong>
            </div>
            <div>
              <span>Документ зарегистрирован в базе данных</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t-2 border-dashed border-slate-300 text-xs">
            <div className="space-y-6">
              <div className="font-semibold text-slate-700">Заказ принял (Исполнитель):</div>
              <div className="border-b border-slate-900 pb-1 text-slate-400 text-[10px]">
                (подпись / ФИО)
              </div>
            </div>
            <div className="space-y-6">
              <div className="font-semibold text-slate-700">Заказчик (с условиями согласен):</div>
              <div className="border-b border-slate-900 pb-1 text-slate-400 text-[10px]">
                (подпись / расшифровка)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

