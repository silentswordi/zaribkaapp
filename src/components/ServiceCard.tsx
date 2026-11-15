import React, { useState } from 'react';
import { Copy, Check, Bookmark, Edit3, Plus } from 'lucide-react';
import { EmergencyServiceItem, toPersianDigits } from '../data/emergencyCodes';

interface ServiceCardProps {
  item: EmergencyServiceItem;
  persianDigits: boolean;
  isBookmarked: boolean;
  onToggleBookmark: (itemId: number) => void;
  onEditService?: (item: EmergencyServiceItem) => void;
  isSelected: boolean;
  selectedQuantity?: number;
  onToggleSelect: (item: EmergencyServiceItem) => void;
  onIncrementSelect?: (id: number) => void;
  searchQuery?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  item,
  persianDigits,
  isBookmarked,
  onToggleBookmark,
  onEditService,
  isSelected,
  selectedQuantity = 1,
  onToggleSelect,
  onIncrementSelect
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const formatNum = (n: number | string) => (persianDigits ? toPersianDigits(n) : String(n));

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Color code based on K coefficient
  const getKBadgeColor = (k: number) => {
    if (k >= 15) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (k >= 10) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (k >= 5) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (k >= 2) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between p-4 sm:p-5 hover:shadow-md ${
        isSelected
          ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20 shadow-xs'
          : isBookmarked
          ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-300'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Header: Row & Category & Actions */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/80">
              ردیف {formatNum(item.id)}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-lg truncate max-w-[140px]">
              {item.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Edit Button */}
            {onEditService && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditService(item);
                }}
                className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-emerald-700 transition-all"
                title="ویرایش مشخصات یا اصلاح غلط املایی/کد"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            {/* Bookmark Button */}
            <button
              onClick={() => onToggleBookmark(item.id)}
              className={`p-1.5 rounded-xl border transition-all ${
                isBookmarked
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-amber-500 border-slate-200'
              }`}
              title={isBookmarked ? 'حذف از نشان‌شده‌ها' : 'نشان‌دار کردن و ذخیره'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Service Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-3 line-clamp-2">
          {item.title}
        </h3>
      </div>

      {/* Details Box: Code & K value & Selection Button */}
      <div className="mt-2 pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2.5 border border-slate-100">
          {/* Service Code */}
          <div>
            <div className="text-[10px] text-slate-400 font-medium">کد خدمت</div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-base font-black text-slate-800 tracking-wider">
                {formatNum(item.code)}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1 rounded-md hover:bg-slate-200 text-slate-500 transition-colors"
                title="کپی کد خدمت"
              >
                {copiedCode ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* K Coefficient */}
          <div className="text-left">
            <div className="text-[10px] text-slate-400 font-medium text-left">ضریب کا (K)</div>
            <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-sm font-extrabold border ${getKBadgeColor(item.k)}`}>
              <span>{formatNum(item.k)}</span>
              <span className="text-[11px] font-bold">K</span>
            </div>
          </div>
        </div>

        {/* Service Selection Toggle Button */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => onToggleSelect(item)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              isSelected
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 ring-2 ring-emerald-500/20'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 hover:border-emerald-300'
            }`}
            title={isSelected ? 'لغو انتخاب خدمت' : 'انتخاب این خدمت جهت تجمیع ضریب K'}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>انتخاب شد ({formatNum(item.k)} K)</span>
                {selectedQuantity > 1 && (
                  <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[11px]">
                    {formatNum(selectedQuantity)}×
                  </span>
                )}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>انتخاب خدمت ({formatNum(item.k)} K)</span>
              </>
            )}
          </button>

          {/* If selected and user wants to add multiple of this service */}
          {isSelected && onIncrementSelect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onIncrementSelect(item.id);
              }}
              className="px-3 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black text-xs transition-all border border-emerald-200"
              title="افزودن تعداد انجام این خدمت (+۱)"
            >
              +۱ بار دیگر
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
