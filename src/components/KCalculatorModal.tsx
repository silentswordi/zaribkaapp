import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Calculator,
  Search,
  Plus,
  Minus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { EmergencyServiceItem, normalizePersianText, toPersianDigits } from '../data/emergencyCodes';

export interface CalculatorItem {
  service: EmergencyServiceItem;
  quantity: number;
}

interface KCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculatorItems: CalculatorItem[];
  onUpdateQuantity: (serviceId: number, delta: number) => void;
  onRemoveItem: (serviceId: number) => void;
  onAddItem: (service: EmergencyServiceItem) => void;
  onClearAll: () => void;
  allServices: EmergencyServiceItem[];
  persianDigits: boolean;
}

export const KCalculatorModal: React.FC<KCalculatorModalProps> = ({
  isOpen,
  onClose,
  calculatorItems,
  onUpdateQuantity,
  onRemoveItem,
  onAddItem,
  onClearAll,
  allServices,
  persianDigits
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const formatNum = (n: number | string) => (persianDigits ? toPersianDigits(n) : String(n));

  // Cumulative Total K
  const totalK = useMemo(() => {
    return calculatorItems.reduce((sum, item) => sum + item.service.k * item.quantity, 0);
  }, [calculatorItems]);

  const totalProcedures = useMemo(() => {
    return calculatorItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [calculatorItems]);

  // Search filtered services inside calculator
  const searchResults = useMemo(() => {
    const rawQuery = searchQuery.trim();
    if (!rawQuery) return [];

    const normQuery = normalizePersianText(rawQuery);
    const tokens = normQuery.split(' ').filter(Boolean);

    return allServices
      .filter((s) => {
        const titleNorm = normalizePersianText(s.title);
        const codeNorm = s.code;
        const catNorm = normalizePersianText(s.category);
        const keysNorm = (s.keywords || []).map(normalizePersianText).join(' ');

        return tokens.every(
          (t) =>
            titleNorm.includes(t) ||
            codeNorm.includes(t) ||
            catNorm.includes(t) ||
            keysNorm.includes(t)
        );
      })
      .slice(0, 8);
  }, [searchQuery, allServices]);

  const handleSelectService = (service: EmergencyServiceItem) => {
    onAddItem(service);
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const handleCopySummary = () => {
    if (calculatorItems.length === 0) return;

    let text = `📋 صورت محاسبات ضرایب K خدمات اورژانس:\n\n`;
    calculatorItems.forEach((item, index) => {
      const subtotal = (item.service.k * item.quantity).toFixed(1);
      text += `${index + 1}. [کد ${item.service.code}] ${item.service.title}\n`;
      text += `   تعداد: ${item.quantity} × ضریب ${item.service.k} K = ${subtotal} K\n\n`;
    });
    text += `──────────────\n`;
    text += `✨ مجموع نهایی ضریب کا: ${totalK.toFixed(1)} K\n`;
    text += `تعداد کل خدمات: ${totalProcedures} مورد`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full h-[92vh] max-h-[820px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 ring-2 ring-blue-400/30">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                ماشین‌حساب تجمیعی ضریب K
                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  محاسبه آنلاین
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                انتخاب خدمات، تعیین تعداد و محاسبه خودکار مجموع ضرایب کا
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Cumulative Summary Bar */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/40 to-slate-50 border-b border-blue-100 p-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
          <div>
            <div className="text-xs font-bold text-slate-500 mb-0.5">عدد تجمیعی ضریب کا:</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-blue-900 tracking-tight">
                {formatNum(totalK.toFixed(1))}
              </span>
              <span className="text-base font-black text-blue-700">K</span>
              <span className="text-xs text-slate-500 font-medium mr-2">
                ({formatNum(totalProcedures)} خدمت)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {calculatorItems.length > 0 && (
              <>
                <button
                  onClick={handleCopySummary}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 transition-all shadow-xs"
                  title="کپی متن کامل صورت محاسبات"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">کپی شد!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span className="hidden sm:inline">کپی صورت‌حساب</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onClearAll}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
                  title="پاک کردن تمام موارد ماشین حساب"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search & Add Service Box */}
        <div className="p-4 sm:px-6 bg-white border-b border-slate-200 shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-blue-600" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو و انتخاب خدمت برای اضافه کردن به ماشین حساب (نام خدمت یا کد)..."
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Search Dropdown */}
          {searchQuery && (
            <div className="mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  هیچ خدمتی مطابق با عبارت جستجو یافت نشد.
                </div>
              ) : (
                searchResults.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleSelectService(service)}
                    className="w-full text-right p-3 hover:bg-blue-50/70 flex items-center justify-between gap-3 transition-colors text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{service.title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-700">
                          کد {formatNum(service.code)}
                        </span>
                        <span>{service.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-extrabold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800">
                        {formatNum(service.k)} K
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected Services List */}
        <div className="flex-1 overflow-y-auto p-4 sm:px-6 space-y-2.5 bg-slate-50/60">
          {calculatorItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-14 h-14 rounded-3xl bg-blue-100/60 text-blue-600 flex items-center justify-center mb-3">
                <Calculator className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">
                ماشین حساب هنوز خالی است
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
                برای محاسبه مجموع ضریب K، نام یا کد خدمات را در کادر جستجوی بالا سرچ کرده و انتخاب کنید، یا از دکمه «+ ماشین‌حساب» در صفحه اصلی استفاده نمایید.
              </p>

              {/* Quick suggestions to add */}
              <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 p-3.5 text-right">
                <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  خدمات پرکاربرد برای شروع سریع:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allServices.slice(0, 6).map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleSelectService(service)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-[11px] font-semibold text-slate-700 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-blue-600" />
                      <span>{service.title.slice(0, 28)}...</span>
                      <span className="font-mono text-[10px] text-slate-500">({formatNum(service.k)}K)</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            calculatorItems.map((item) => {
              const subtotal = item.service.k * item.quantity;

              return (
                <div
                  key={item.service.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {formatNum(item.service.code)}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.service.category}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {item.service.title}
                    </h4>
                    <div className="text-[11px] text-slate-500 mt-1">
                      ضریب واحد: <strong className="text-slate-700">{formatNum(item.service.k)} K</strong>
                    </div>
                  </div>

                  {/* Quantity Stepper & Subtotal & Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    {/* Stepper */}
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.service.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors shadow-xs"
                        title="کاهش تعداد"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-9 text-center font-bold text-xs text-slate-900">
                        {formatNum(item.quantity)}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.service.id, 1)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors shadow-xs"
                        title="افزایش تعداد"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-left min-w-[70px]">
                      <div className="text-[10px] text-slate-400 font-medium">جمع این خدمت</div>
                      <div className="font-black text-sm text-blue-900">
                        {formatNum(subtotal.toFixed(1))} <span className="text-[11px] text-blue-700 font-bold">K</span>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => onRemoveItem(item.service.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="حذف از ماشین حساب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            تعداد خدمات انتخابی: <strong className="text-slate-800">{formatNum(calculatorItems.length)}</strong> نوع خدمت
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            <span>بستن و ادامه جستجو</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
