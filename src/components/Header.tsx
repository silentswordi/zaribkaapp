import React from 'react';
import { Stethoscope, Bookmark, BookmarkCheck, PlusCircle } from 'lucide-react';
import { toPersianDigits } from '../data/emergencyCodes';

interface HeaderProps {
  persianDigits?: boolean;
  bookmarksCount: number;
  showOnlyBookmarked: boolean;
  setShowOnlyBookmarked: (val: boolean) => void;
  onAddNewService: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  persianDigits = true,
  bookmarksCount,
  showOnlyBookmarked,
  setShowOnlyBookmarked,
  onAddNewService
}) => {
  const formatNum = (n: number | string) => (persianDigits ? toPersianDigits(n) : String(n));

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/30">
              <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                  ضریب کا
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium line-clamp-1">
                استعلام سریع خدمات سلامت و ارزش نسبی خدمات
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Compact Add New Service Button */}
            <button
              onClick={onAddNewService}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 hover:text-white border border-emerald-600/60 transition-all shadow-xs"
              title="ثبت و تعریف خدمت سلامت جدید"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-[11px] sm:text-xs">ثبت خدمت</span>
            </button>

            {/* Bookmarks toggle button */}
            <button
              onClick={() => setShowOnlyBookmarked(!showOnlyBookmarked)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                showOnlyBookmarked
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 border-slate-700'
              }`}
              title="نمایش فقط خدمات نشان‌دار شده و ذخیره‌شده"
            >
              {showOnlyBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-slate-950" />
              ) : (
                <Bookmark className="w-4 h-4 text-amber-400" />
              )}
              <span className="hidden sm:inline">نشان‌شده‌ها</span>
              {bookmarksCount > 0 && (
                <span className={`text-[11px] font-black px-1.5 py-0.2 rounded-full min-w-[20px] text-center ${
                  showOnlyBookmarked ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {formatNum(bookmarksCount)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

