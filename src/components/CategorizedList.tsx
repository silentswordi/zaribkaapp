import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Layers, Copy, Check, Folder, Bookmark, Edit3, Plus } from 'lucide-react';
import { EmergencyServiceItem, toPersianDigits } from '../data/emergencyCodes';
import { ServiceCard } from './ServiceCard';

interface CategorizedListProps {
  items: EmergencyServiceItem[];
  persianDigits: boolean;
  bookmarkedIds: Set<number>;
  onToggleBookmark: (itemId: number) => void;
  onEditService?: (item: EmergencyServiceItem) => void;
  selectedServiceMap: Record<number, number>;
  onToggleSelect: (item: EmergencyServiceItem) => void;
  onIncrementSelect?: (id: number) => void;
  searchQuery: string;
}

export const CategorizedList: React.FC<CategorizedListProps> = ({
  items,
  persianDigits,
  bookmarkedIds,
  onToggleBookmark,
  onEditService,
  selectedServiceMap,
  onToggleSelect,
  onIncrementSelect,
  searchQuery
}) => {
  // All categories start collapsed by default. Open when clicked or during search.
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [copiedCodeId, setCopiedCodeId] = useState<number | null>(null);

  const formatNum = (n: number | string) => (persianDigits ? toPersianDigits(n) : String(n));

  // Group items by category in the order they appear
  const grouped = items.reduce<Record<string, EmergencyServiceItem[]>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const categoryKeys = Object.keys(grouped);

  // Auto-expand categories if user is actively searching, or collapse all if search query cleared
  useEffect(() => {
    if (searchQuery.trim()) {
      const allOpen: Record<string, boolean> = {};
      categoryKeys.forEach((cat) => {
        allOpen[cat] = true;
      });
      setOpenCategories(allOpen);
    } else {
      // Empty search (initial view) -> all categories closed
      setOpenCategories({});
    }
  }, [searchQuery]);

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const handleCopyCode = (id: number, code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
        <Folder className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-700 mb-1">هیچ خدمتی با این مشخصات یافت نشد</h3>
        <p className="text-sm text-slate-500">لطفاً کلمات کلیدی، نام خدمت یا کد را تغییر دهید.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Quick Category Summary */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500 font-semibold">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>تعداد دسته‌ها در نتایج: <strong className="text-slate-800">{formatNum(categoryKeys.length)}</strong> دسته</span>
        </div>
      </div>

      {/* Categories Sections */}
      {categoryKeys.map((category) => {
        const catItems = grouped[category];
        const isOpen = !!openCategories[category];
        const totalCategoryK = catItems.reduce((sum, it) => sum + it.k, 0);

        return (
          <section
            key={category}
            className={`bg-white rounded-2xl border transition-all ${
              isOpen
                ? 'border-emerald-500/40 shadow-sm ring-2 ring-emerald-500/10'
                : 'border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
            } overflow-hidden`}
          >
            {/* Category Header Bar */}
            <div
              onClick={() => toggleCategory(category)}
              className={`w-full flex items-center justify-between p-3.5 sm:px-6 cursor-pointer select-none transition-colors ${
                isOpen
                  ? 'bg-gradient-to-r from-emerald-50/50 via-white to-slate-50 border-b border-slate-200/80'
                  : 'bg-white hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold transition-colors ${
                    isOpen
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                    {category}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-colors ${
                        isOpen
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {formatNum(catItems.length)} خدمت
                    </span>
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                  <span>مجموع K:</span>
                  <strong className="text-slate-800 font-bold">{formatNum(totalCategoryK.toFixed(1))} K</strong>
                </div>

                <div
                  className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all ${
                    isOpen
                      ? 'bg-emerald-100 text-emerald-800 font-bold'
                      : 'bg-slate-100 text-slate-500 font-medium'
                  }`}
                >
                  <span className="hidden sm:inline">
                    {isOpen ? 'بستن' : 'مشاهده زیرمجموعه‌ها'}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Category Body */}
            {isOpen && (
              <div className="p-3 sm:p-5">
                {/* Desktop High-density Table for this category */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold text-xs bg-slate-50/70">
                        <th className="py-2.5 px-3 w-16">ردیف</th>
                        <th className="py-2.5 px-3 w-36">کد خدمت</th>
                        <th className="py-2.5 px-3">نام کامل خدمت سلامت در اورژانس</th>
                        <th className="py-2.5 px-3 w-28 text-center">ضریب K</th>
                        <th className="py-2.5 px-3 w-44 text-center">عملیات و انتخاب</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {catItems.map((item) => {
                        const isBookmarked = bookmarkedIds.has(item.id);
                        const isSelected = !!selectedServiceMap[item.id];
                        const quantity = selectedServiceMap[item.id] || 0;

                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              isSelected
                                ? 'bg-emerald-50/50'
                                : isBookmarked
                                ? 'bg-amber-50/30'
                                : ''
                            }`}
                          >
                            {/* Row # */}
                            <td className="py-3 px-3 text-slate-400 font-semibold text-xs">
                              {formatNum(item.id)}
                            </td>

                            {/* Code */}
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-slate-900 font-extrabold tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
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

                            {/* Title */}
                            <td className="py-3 px-3 font-bold text-slate-900">
                              {item.title}
                            </td>

                            {/* K Coefficient */}
                            <td className="py-3 px-3 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {formatNum(item.k)} <span className="text-[10px] font-bold">K</span>
                              </span>
                            </td>

                            {/* Actions: Select, Edit & Bookmark */}
                            <td className="py-3 px-3 text-center">
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

                {/* Mobile Cards for each item in category */}
                <div className="grid grid-cols-1 gap-2.5 md:hidden">
                  {catItems.map((item) => (
                    <ServiceCard
                      key={item.id}
                      item={item}
                      persianDigits={persianDigits}
                      isBookmarked={bookmarkedIds.has(item.id)}
                      onToggleBookmark={onToggleBookmark}
                      onEditService={onEditService}
                      isSelected={!!selectedServiceMap[item.id]}
                      selectedQuantity={selectedServiceMap[item.id] || 1}
                      onToggleSelect={onToggleSelect}
                      onIncrementSelect={onIncrementSelect}
                      searchQuery={searchQuery}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
