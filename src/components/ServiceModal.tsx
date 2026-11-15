import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, PlusCircle, Edit3, Tag } from 'lucide-react';
import { EmergencyServiceItem, CATEGORIES, toPersianDigits } from '../data/emergencyCodes';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: Omit<EmergencyServiceItem, 'id'>, editId?: number) => { success: boolean; error?: string };
  initialData?: EmergencyServiceItem | null;
  existingServices: EmergencyServiceItem[];
  persianDigits: boolean;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingServices,
  persianDigits
}) => {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [k, setK] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [keywords, setKeywords] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatNum = (n: number | string) => (persianDigits ? toPersianDigits(n) : String(n));

  // Extract all distinct categories
  const availableCategories = Array.from(
    new Set([
      ...CATEGORIES.filter((c) => c !== 'همه خدمات'),
      ...existingServices.map((s) => s.category)
    ])
  );

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setTitle(initialData.title);
      setK(String(initialData.k));
      setCategory(initialData.category);
      setCustomCategory('');
      setKeywords(initialData.keywords ? initialData.keywords.join('، ') : '');
    } else {
      setCode('');
      setTitle('');
      setK('');
      setCategory(availableCategories[0] || 'متفرقه');
      setCustomCategory('');
      setKeywords('');
    }
    setErrorMessage(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEditMode = !!initialData;

  // Realtime duplicate code check
  const trimmedCode = code.trim();
  const duplicateConflict = existingServices.find(
    (s) => s.code.trim() === trimmedCode && (!isEditMode || s.id !== initialData.id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = code.trim();
    const cleanTitle = title.trim();
    const kValue = parseFloat(k);
    const finalCategory = category === '__custom__' ? customCategory.trim() : category.trim();

    if (!cleanCode) {
      setErrorMessage('لطفاً کد خدمت را وارد کنید.');
      return;
    }

    if (duplicateConflict) {
      setErrorMessage(
        `کد «${cleanCode}» تکراری است و قبلاً برای خدمت «${duplicateConflict.title}» ثبت شده است.`
      );
      return;
    }

    if (!cleanTitle) {
      setErrorMessage('لطفاً نام یا شرح خدمت را وارد کنید.');
      return;
    }

    if (isNaN(kValue) || kValue < 0) {
      setErrorMessage('لطفاً ضریب K معتبر (عدد مثبت) وارد کنید.');
      return;
    }

    if (!finalCategory) {
      setErrorMessage('لطفاً دسته‌بندی خدمت را انتخاب یا وارد کنید.');
      return;
    }

    const parsedKeywords = keywords
      .split(/[،,]/)
      .map((k) => k.trim())
      .filter(Boolean);

    const result = onSave(
      {
        code: cleanCode,
        title: cleanTitle,
        k: kValue,
        category: finalCategory,
        keywords: parsedKeywords.length > 0 ? parsedKeywords : undefined
      },
      initialData ? initialData.id : undefined
    );

    if (result.success) {
      onClose();
    } else if (result.error) {
      setErrorMessage(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                isEditMode
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isEditMode ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-black">
                {isEditMode ? 'ویرایش مشخصات خدمت' : 'ثبت خدمت جدید'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEditMode
                  ? `ویرایش ردیف ${formatNum(initialData?.id || '')} • کد ${formatNum(initialData?.code || '')}`
                  : 'افزودن خدمت جدید به لیست خدمات اورژانس'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Service Code & K Coefficient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                کد خدمت <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="مثال: 901950"
                className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm tracking-wider outline-none transition-all ${
                  duplicateConflict
                    ? 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-400'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                }`}
                required
              />
              {duplicateConflict && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">
                  کد تکراری است (مربوط به: {duplicateConflict.title})
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ضریب کا (K) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={k}
                onChange={(e) => {
                  setK(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="مثال: 4.5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition-all"
                required
              />
            </div>
          </div>

          {/* Service Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              نام کامل خدمت در اورژانس <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="مثال: ویزیت جامع بیمار در بخش اورژانس"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition-all resize-none font-medium"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              دسته‌بندی (گروه تخصصی) <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition-all bg-white font-medium"
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__custom__">+ افزودن دسته جدید...</option>
            </select>

            {category === '__custom__' && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="نام دسته جدید را وارد کنید..."
                className="mt-2 w-full px-3.5 py-2 rounded-xl border border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none"
                autoFocus
                required
              />
            )}
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              کلمات کلیدی برای جستجوی سریعتر (اختیاری)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="با ویرگول جدا کنید: بخیه، کشیدن، پوست..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              کلمات مترادف یا نام‌های مصطلح به یافتن سریع خدمت در سرچ کمک می‌کنند.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={!!duplicateConflict}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-md transition-all ${
                duplicateConflict
                  ? 'bg-slate-400 cursor-not-allowed'
                  : isEditMode
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isEditMode ? 'ذخیره تغییرات' : 'ثبت خدمت جدید'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
