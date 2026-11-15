import React, { useState, useMemo, useEffect } from 'react';
import {
  EMERGENCY_SERVICES,
  EmergencyServiceItem,
  normalizePersianText,
  toPersianDigits
} from './data/emergencyCodes';
import { Header } from './components/Header';
import { SearchFilters } from './components/SearchFilters';
import { CategorizedList } from './components/CategorizedList';
import { TableView } from './components/TableView';
import { ServiceCard } from './components/ServiceCard';
import { ServiceModal } from './components/ServiceModal';
import { Bookmark, ListFilter, Table, LayoutGrid, CheckCircle2, RotateCcw } from 'lucide-react';

const BOOKMARKS_STORAGE_KEY = 'emergency_bookmarked_services';
const SERVICES_STORAGE_KEY = 'emergency_services_custom_list_v2';
const SELECTED_SERVICES_STORAGE_KEY = 'emergency_selected_services_list_v1';

type ViewMode = 'categorized' | 'table' | 'cards';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('categorized');
  const [persianDigits, setPersianDigits] = useState<boolean>(true);
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState<boolean>(false);

  // Custom/Editable services list persisted to localStorage
  const [services, setServices] = useState<EmergencyServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem(SERVICES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return EMERGENCY_SERVICES;
  });

  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<EmergencyServiceItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected Services for Live K-Coefficient Cumulative Calculation
  const [selectedServices, setSelectedServices] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem(SELECTED_SERVICES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return {};
  });

  // Bookmarked / Saved services state with LocalStorage persistence
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return new Set<number>(parsed);
        }
      }
    } catch {
      // ignore
    }
    return new Set<number>([6, 50, 176]);
  });

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(Array.from(bookmarkedIds)));
    } catch {
      // ignore
    }
  }, [bookmarkedIds]);

  // Sync services to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
    } catch {
      // ignore
    }
  }, [services]);

  // Sync selected services to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_SERVICES_STORAGE_KEY, JSON.stringify(selectedServices));
    } catch {
      // ignore
    }
  }, [selectedServices]);

  // Total selected services count
  const selectedCount = useMemo(() => {
    return Object.values(selectedServices).reduce((sum, qty) => sum + qty, 0);
  }, [selectedServices]);

  // Cumulative Total K calculated from live selected services
  const totalSelectedK = useMemo(() => {
    return Object.entries(selectedServices).reduce((sum, [idStr, qty]) => {
      const item = services.find((s) => s.id === Number(idStr));
      return sum + (item ? item.k * qty : 0);
    }, 0);
  }, [selectedServices, services]);

  const handleToggleSelectService = (service: EmergencyServiceItem) => {
    setSelectedServices((prev) => {
      const next = { ...prev };
      if (next[service.id]) {
        delete next[service.id];
      } else {
        next[service.id] = 1;
      }
      return next;
    });
  };

  const handleIncrementSelect = (serviceId: number) => {
    setSelectedServices((prev) => ({
      ...prev,
      [serviceId]: (prev[serviceId] || 0) + 1
    }));
  };

  const handleResetSelected = () => {
    setSelectedServices({});
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const toggleBookmark = (itemId: number) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleAddNewService = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEditService = (item: EmergencyServiceItem) => {
    setEditingService(item);
    setIsModalOpen(true);
  };

  const handleSaveService = (
    serviceData: Omit<EmergencyServiceItem, 'id'>,
    editId?: number
  ): { success: boolean; error?: string } => {
    const cleanCode = serviceData.code.trim();

    // Check duplicate code
    const duplicate = services.find(
      (s) => s.code.trim() === cleanCode && (!editId || s.id !== editId)
    );
    if (duplicate) {
      return {
        success: false,
        error: `کد «${cleanCode}» تکراری است و قبلاً برای «${duplicate.title}» ثبت شده است.`
      };
    }

    if (editId) {
      // Editing existing service
      setServices((prev) =>
        prev.map((s) => (s.id === editId ? { ...s, ...serviceData } : s))
      );
      setToastMessage(`خدمت کد «${cleanCode}» با موفقیت ویرایش شد.`);
    } else {
      // Adding new service
      const nextId = services.length > 0 ? Math.max(...services.map((s) => s.id)) + 1 : 1;
      const newItem: EmergencyServiceItem = {
        id: nextId,
        ...serviceData
      };
      setServices((prev) => [newItem, ...prev]);
      setToastMessage(`خدمت جدید «${serviceData.title}» با کد «${cleanCode}» با موفقیت ثبت شد.`);
    }

    return { success: true };
  };

  // Relevance Search & Ranking Logic (no manual sheet separation or filter clutter)
  const filteredItems = useMemo(() => {
    const rawQuery = searchQuery.trim();
    const normalizedQuery = normalizePersianText(rawQuery);
    const queryTokens = normalizedQuery.split(' ').filter(Boolean);

    let list = services;

    // Filter by bookmarks if user requested
    if (showOnlyBookmarked) {
      list = list.filter((item) => bookmarkedIds.has(item.id));
    }

    // If no search query, maintain standard clinical row order
    if (queryTokens.length === 0) {
      return [...list].sort((a, b) => a.id - b.id);
    }

    // Score and rank items based on search relevance
    const scoredList: { item: EmergencyServiceItem; score: number }[] = [];

    for (const item of list) {
      const itemTitleNorm = normalizePersianText(item.title);
      const itemCatNorm = normalizePersianText(item.category);
      const itemCode = item.code;
      const itemId = item.id.toString();
      const keywordsNorm = (item.keywords || []).map(normalizePersianText);
      const allKeywordsStr = keywordsNorm.join(' ');

      let matchesAllTokens = true;
      let score = 0;

      for (const token of queryTokens) {
        const inCode = itemCode.includes(token);
        const inTitle = itemTitleNorm.includes(token);
        const inCat = itemCatNorm.includes(token);
        const inKey = allKeywordsStr.includes(token);
        const inId = itemId === token;

        if (!inCode && !inTitle && !inCat && !inKey && !inId) {
          matchesAllTokens = false;
          break;
        }

        // Exact code match gets highest weight
        if (itemCode === token) score += 1000;
        else if (inCode) score += 400;

        // Row ID match
        if (itemId === token) score += 500;

        // Title matches
        if (itemTitleNorm === token) score += 300;
        else if (itemTitleNorm.startsWith(token)) score += 200;
        else if (inTitle) score += 100;

        // Category & keywords matches
        if (inCat) score += 50;
        if (inKey) score += 60;
      }

      if (matchesAllTokens && score > 0) {
        scoredList.push({ item, score });
      }
    }

    // Sort by most relevant score first, with original ID as tiebreaker
    return scoredList
      .sort((a, b) => b.score - a.score || a.item.id - b.item.id)
      .map((entry) => entry.item);
  }, [searchQuery, showOnlyBookmarked, bookmarkedIds, services]);

  const formatNum = (n: number | string) => (persianDigits ? toPersianDigits(n) : String(n));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200 text-xs sm:text-sm font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        persianDigits={persianDigits}
        bookmarksCount={bookmarkedIds.size}
        showOnlyBookmarked={showOnlyBookmarked}
        setShowOnlyBookmarked={setShowOnlyBookmarked}
        onAddNewService={handleAddNewService}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Bookmarked Filter Notification Bar */}
        {showOnlyBookmarked && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 sm:px-4 flex items-center justify-between text-amber-900 text-xs sm:text-sm font-bold">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-600 fill-current" />
              <span>
                در حال نمایش خدمات نشان‌دار شده ({formatNum(filteredItems.length)} مورد)
              </span>
            </div>
            <button
              onClick={() => setShowOnlyBookmarked(false)}
              className="text-xs font-semibold px-2.5 py-1 bg-white hover:bg-amber-50 border border-amber-300 rounded-lg text-amber-800 transition-colors"
            >
              نمایش همه خدمات
            </button>
          </div>
        )}

        {/* Clean Search Input with Quick Keywords & Actions */}
        <SearchFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          persianDigits={persianDigits}
          totalFiltered={filteredItems.length}
          totalCount={services.length}
          showOnlyBookmarked={showOnlyBookmarked}
          setShowOnlyBookmarked={setShowOnlyBookmarked}
          bookmarksCount={bookmarkedIds.size}
        />

        {/* View Mode Switcher bar */}
        <div className="flex items-center justify-between px-1 mb-3 text-xs">
          <div className="text-slate-500 font-medium">
            {searchQuery ? (
              <span>
                نتایج بر اساس <strong className="text-emerald-700">مرتبط‌ترین گزینه‌ها</strong> مرتب شده‌اند
              </span>
            ) : (
              <span>{formatNum(services.length)} خدمت تعریف‌شده در اورژانس</span>
            )}
          </div>

          <div className="inline-flex rounded-xl p-0.5 bg-slate-200/70 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('categorized')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'categorized'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="نمایش طبقه‌بندی شده"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>دسته‌بندی</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="نمایش جدول"
            >
              <Table className="w-3.5 h-3.5" />
              <span>جدول</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="نمایش کارت‌ها"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>کارت‌ها</span>
            </button>
          </div>
        </div>

        {/* Main Results View (Categorized by default) */}
        {viewMode === 'categorized' && (
          <CategorizedList
            items={filteredItems}
            persianDigits={persianDigits}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            onEditService={handleEditService}
            selectedServiceMap={selectedServices}
            onToggleSelect={handleToggleSelectService}
            onIncrementSelect={handleIncrementSelect}
            searchQuery={searchQuery}
          />
        )}

        {viewMode === 'table' && (
          <TableView
            items={filteredItems}
            persianDigits={persianDigits}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            onEditService={handleEditService}
            selectedServiceMap={selectedServices}
            onToggleSelect={handleToggleSelectService}
            onIncrementSelect={handleIncrementSelect}
          />
        )}

        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredItems.map((item) => (
              <ServiceCard
                key={item.id}
                item={item}
                persianDigits={persianDigits}
                isBookmarked={bookmarkedIds.has(item.id)}
                onToggleBookmark={toggleBookmark}
                onEditService={handleEditService}
                isSelected={!!selectedServices[item.id]}
                selectedQuantity={selectedServices[item.id] || 1}
                onToggleSelect={handleToggleSelectService}
                onIncrementSelect={handleIncrementSelect}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}
      </main>

      {/* Bottom-Left Total Selected K Widget with Reset Action */}
      <div className="fixed bottom-5 left-5 z-40 max-w-sm">
        <button
          type="button"
          onClick={handleResetSelected}
          className={`group flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border transition-all duration-300 ${
            selectedCount > 0
              ? 'bg-slate-900 text-white border-slate-700/90 hover:bg-slate-800 shadow-emerald-950/25 ring-2 ring-emerald-500/30 cursor-pointer active:scale-95'
              : 'bg-white/95 backdrop-blur-md text-slate-700 border-slate-200/90 shadow-slate-200/70 hover:bg-slate-50'
          }`}
          title={
            selectedCount > 0
              ? 'کلیک کنید تا تمام انتخاب‌ها ریست و صفر شوند'
              : 'برای محاسبه مجموع ضرایب K، دکمه «انتخاب» را در هر خدمت بزنید'
          }
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-colors ${
              selectedCount > 0
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            ∑ K
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[11px] font-semibold ${
                  selectedCount > 0 ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                مجموع ضریب K:
              </span>
              <span
                className={`text-base sm:text-lg font-black tracking-tight ${
                  selectedCount > 0 ? 'text-emerald-400' : 'text-slate-800'
                }`}
              >
                {formatNum(Number(totalSelectedK.toFixed(2)))} K
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              {selectedCount > 0 ? (
                <>
                  <span className="text-emerald-400 font-bold">
                    {formatNum(selectedCount)} خدمت انتخاب‌شده
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-rose-400 group-hover:text-rose-300 font-medium inline-flex items-center gap-1">
                    <RotateCcw className="w-3 h-3 inline" />
                    کلیک برای ریست
                  </span>
                </>
              ) : (
                <span className="text-slate-400">هیچ خدمتی انتخاب نشده</span>
              )}
            </div>
          </div>

          {selectedCount > 0 && (
            <div className="mr-1 p-1.5 rounded-lg bg-slate-800 group-hover:bg-rose-500/20 text-slate-400 group-hover:text-rose-400 transition-colors">
              <RotateCcw className="w-4 h-4" />
            </div>
          )}
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-5 border-t border-slate-800 mt-12 pb-20 sm:pb-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-right">
          <div>
            <p className="font-bold text-slate-300">
              ضریب کا - کدهای خدمات اورژانس
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              استعلام و محاسبه زنده تجمیعی ضرایب K خدمات سلامت در بخش اورژانس
            </p>
          </div>
          <div className="text-slate-400 font-medium text-xs tracking-wide" dir="ltr">
            made by <span className="text-emerald-400 font-bold">Dr Ashkan Ahmadi</span>
          </div>
        </div>
      </footer>

      {/* Add / Edit Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveService}
        initialData={editingService}
        existingServices={services}
        persianDigits={persianDigits}
      />
    </div>
  );
}
