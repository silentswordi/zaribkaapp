import React, { useState } from 'react';
import { Copy, Check, Bookmark, Edit3, Plus } from 'lucide-react';
import { EmergencyServiceItem, toPersianDigits } from '../data/emergencyCodes';

interface TableViewProps {
  items: EmergencyServiceItem[];
  persianDigits: boolean;
  bookmarkedIds: Set<number>;
  onToggleBookmark: (itemId: number) => void;
  onEditService?: (item: EmergencyServiceItem) => void;
  selectedServiceMap: Record<number, number>;
  onToggleSelect: (item: EmergencyServiceItem) => void;
  onIncrementSelect?: (id: number) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  items,
  persianDigits,
  bookmarkedIds,
  onToggleBookmark,
  onEditService,
  selectedServiceMap,
  onToggleSelect,
  onIncrementSelect
}) => {
  const [copiedCodeId, setCopiedCodeId] = useState<number | null>(null);

  const formatNum = (n: number | string) => (persianDigits ? toPersianDigits(n) : String(n));

  const handleCopyCode = (id: number, code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const getKBadge = (k: number) => {
    if (k >= 15) return 'bg-rose-100 text-rose-800 border-rose-300';
    if (k >= 10) return 'bg-purple-100 text-purple-800 border-purple-300';
    if (k >= 5) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold text-xs">
              <th className="py-3 px-3.5 w-16">ردیف</th>
              <th className="py-3 px-3.5 w-32">کد خدمت</th>
              <th className="py-3 px-3.5">نام خدمت اورژانس</th>
              <th className="py-3 px-3.5 w-44">طبقه‌بندی / دسته</th>
              <th className="py-3 px-3.5 w-28 text-center">ضریب K</th>
              <th className="py-3 px-3.5 w-44 text-center">عملیات و انتخاب</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {items.map((item) => {
              const isBookmarked = bookmarkedIds.has(item.id);
              const isSelected = !!selectedServiceMap[item.id];
              const quantity = selectedServiceMap[item.id] || 0;

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    isSelected
                      ? 'bg-emerald-50/50'
                      : isBookmarked
                      ? 'bg-amber-50/40'
                      : ''
                  }`}
                >
                  <td className="py-3 px-3.5 text-xs text-slate-400 font-semibold">
                    {formatNum(item.id)}
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-900 font-extrabold tracking-wider bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {formatNum(item.code)}
                      </span>
                      <button
                        onClick={(e) => handleCopyCode(item.id, item.code, e)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                        title="کپی کد خدمت"
                      >
                        {copiedCodeId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 font-bold text-slate-900 text-sm sm:text-base">
                    {item.title}
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black border ${getKBadge(item.k)}`}>
                      {formatNum(item.k)} <span className="text-[10px] font-bold">K</span>
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Selection Toggle Button */}
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onToggleSelect(item)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 shadow-xs ring-2 ring-emerald-400/20'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                          title={isSelected ? 'لغو انتخاب' : 'انتخاب جهت محاسبه مجموع K'}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>انتخاب شد</span>
                              {quantity > 1 && (
                                <span className="bg-white/20 text-white text-[11px] px-1 rounded-full font-black">
                                  {formatNum(quantity)}×
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>انتخاب</span>
                            </>
                          )}
                        </button>

                        {isSelected && onIncrementSelect && (
                          <button
                            onClick={() => onIncrementSelect(item.id)}
                            className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-black transition-all"
                            title="افزودن تعداد (+۱)"
                          >
                            +
                          </button>
                        )}
                      </div>

                      {onEditService && (
                        <button
                          onClick={() => onEditService(item)}
                          className="inline-flex items-center gap-1 p-1.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-emerald-700 border border-slate-200 transition-all"
                          title="ویرایش خدمت یا اصلاح غلط املایی/کد"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => onToggleBookmark(item.id)}
                        className={`inline-flex items-center p-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isBookmarked
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-amber-600 border-slate-200'
                        }`}
                        title={isBookmarked ? 'حذف از نشان‌شده‌ها' : 'نشان‌دار کردن و ذخیره'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current text-white' : ''}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
