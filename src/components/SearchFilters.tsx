import React, { useRef } from 'react';
import { Search, X, Bookmark, BookmarkCheck } from 'lucide-react';
import { toPersianDigits } from '../data/emergencyCodes';

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  persianDigits: boolean;
  totalFiltered: number;
  totalCount: number;
  showOnlyBookmarked: boolean;
  setShowOnlyBookmarked: (val: boolean) => void;
  bookmarksCount: number;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  persianDigits,
  totalFiltered,
  totalCount,
  showOnlyBookmarked,
  setShowOnlyBookmarked,
  bookmarksCount
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const formatNum = (n: number | string) => (persianDigits ? toPersianDigits(n) : String(n));

  const handleClear = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-5 mb-5">
      {/* Search Input Bar */}
      <div className="relative mb-3">
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5 text-emerald-600" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجوی سریع: نام خدمت (بخیه، آتل، تراشه، شکستگی، تپ، شالدون)، کد یا ردیف..."
          className="w-full pl-12 pr-12 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 placeholder-slate-400 text-sm sm:text-base rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            title="پاک کردن جستجو"
          >
            <div className="p-1 rounded-full hover:bg-slate-200 text-slate-500">
              <X className="w-4 h-4" />
            </div>
          </button>
        )}
      </div>

      {/* Row Below Search Bar: Bookmarked Filter & Counter */}
      <div className="flex items-center justify-between gap-2.5 pt-1">
        {/* Bookmarked Filter Button */}
        <button
          onClick={() => setShowOnlyBookmarked(!showOnlyBookmarked)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
            showOnlyBookmarked
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
          title="فیلتر فقط خدمات نشان‌دار شده"
        >
          {showOnlyBookmarked ? (
            <BookmarkCheck className="w-3.5 h-3.5 text-slate-950" />
          ) : (
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span>خدمات نشان‌شده</span>
          {bookmarksCount > 0 && (
            <span
              className={`text-[11px] font-black px-1.5 py-0.2 rounded-full ${
                showOnlyBookmarked ? 'bg-slate-950 text-amber-300' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {formatNum(bookmarksCount)}
            </span>
          )}
        </button>

        {/* Counter */}
        <div className="text-xs text-slate-500 font-medium">
          یافت شد: <strong className="text-emerald-700 font-bold">{formatNum(totalFiltered)}</strong>
          <span className="text-slate-400"> / {formatNum(totalCount)}</span>
        </div>
      </div>
    </div>
  );
};

