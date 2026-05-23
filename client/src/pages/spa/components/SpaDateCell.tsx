import { useTranslation } from 'react-i18next';
import { isSameMonth, isSameDay, format, isBefore, startOfDay } from 'date-fns';
import { Plus, Trash2, Settings } from 'lucide-react';
import type { ISpaDates } from '../interfaces';

interface Props {
  day: Date;
  currentMonth: Date;
  spaDate?: ISpaDates;
  onAddSpaDate: (d: Date) => void;
  onRemoveSpaDate: (id: string) => void;
  onAddSlot: (d: Date, spaDateId: string) => void;
  onRemoveSlot: (id: string) => void;
}

export default function SpaDateCell({
  day, currentMonth, spaDate,
  onAddSpaDate, onRemoveSpaDate, onAddSlot,
  onRemoveSlot
}: Props) {
  const { t } = useTranslation();
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isToday = isSameDay(day, new Date());
  const isPast = isBefore(day, startOfDay(new Date()));

  return (
    <div className={`h-full min-h-[120px] p-1 flex flex-col group relative transition-colors ${
      !isCurrentMonth ? 'bg-gray-50/80 text-gray-400' : 'bg-white'
    } ${isToday ? 'ring-2 ring-blue-500 ring-inset rounded-sm z-10 shadow-sm' : ''} ${
      isPast ? '' : 'hover:bg-slate-50/50'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-1 px-1 mt-0.5">
        <span className={`text-xs font-semibold ${isToday ? 'text-blue-600' : isPast ? 'text-gray-400' : 'text-gray-700'}`}>
          {format(day, 'd')}
        </span>
        {spaDate && !isPast && (
          <div className="flex space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="p-1 rounded text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors"
              onClick={() => onAddSlot(day, spaDate.id)}
              title={t('SpaDateCell.tooltips.addSlots')}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1 rounded text-red-400 hover:bg-red-100 hover:text-red-700 transition-colors"
              onClick={() => onRemoveSpaDate(spaDate.id)}
              title={t('SpaDateCell.tooltips.clearSpaDate')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      
      {/* Body/Slots List */}
      <div className="flex-1 overflow-y-auto min-h-0 pl-0.5 pr-1 space-y-1 pb-1 scrollbar-thin scrollbar-thumb-gray-200">
        {!spaDate ? (
          !isPast && (
            <button
              onClick={() => onAddSpaDate(day)}
              className="w-full h-full min-h-[60px] flex flex-col items-center justify-center text-gray-300 hover:text-blue-500 hover:bg-blue-50/50 border border-transparent hover:border-dashed hover:border-blue-300 rounded transition-all opacity-0 group-hover:opacity-100"
            >
              <Settings className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-medium uppercase tracking-wider">{t('SpaDateCell.configure')}</span>
            </button>
          )
        ) : (
          spaDate.Slots && spaDate.Slots.length > 0 ? (
            [...spaDate.Slots].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map(slot => (
              <div
                key={slot.id}
                className={`relative overflow-hidden flex items-center justify-between p-1.5 rounded border text-[10px] shadow-sm group/slot transition-all ${
                  slot.isBooked
                    ? 'bg-red-50 border-red-100 text-red-800'
                    : 'bg-green-50 border-green-100 text-green-800'
                }`}
              >
                <div className="flex justify-between items-center">
                   <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis text-gray-800">
                     {format(new Date(String(slot.startTime).replace('Z', '')), 'h:mm a')} <span className="opacity-75 font-normal">- {format(new Date(String(slot.endTime || new Date().toISOString()).replace('Z', '')), 'h:mm a')}</span>
                   </span>
                </div>
                
                {/* Hover Actions Overlay */}
                {!isPast && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-[1px] flex items-center justify-evenly translate-x-full group-hover/slot:translate-x-0 transition-transform duration-200">
                    <div className="w-px h-3 bg-gray-200" />
                    <button
                      onClick={() => onRemoveSlot(slot.id)}
                      className="text-gray-500 hover:text-red-700 hover:bg-red-50 p-1 rounded"
                      title={t('SpaDateCell.tooltips.deleteSlot')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-[10px] text-gray-400 italic pt-2">
              {t('SpaDateCell.noSlots')}
            </div>
          )
        )}
      </div>
    </div>
  );
}