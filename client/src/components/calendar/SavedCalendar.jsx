import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function dateKey(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function formatReadableDate(keyOrDate) {
  if (!keyOrDate) return '';
  let date;
  if (typeof keyOrDate === 'string' && keyOrDate.includes('-')) {
    const [y, m, d] = keyOrDate.split('-').map(Number);
    date = new Date(y, m, d);
  } else {
    date = new Date(keyOrDate);
  }
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export default function SavedCalendar({
  reels = [],
  selectedKey = '',
  onSelect,
  compact = false,
  className = '',
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  // Group reels by dateKey
  const { savedByDay, reelsByDay } = useMemo(() => {
    const countMap = new Map();
    const listMap = new Map();
    reels.forEach((reel) => {
      const key = dateKey(reel.created_at);
      if (!key) return;
      countMap.set(key, (countMap.get(key) || 0) + 1);
      const existing = listMap.get(key) || [];
      existing.push(reel);
      listMap.set(key, existing);
    });
    return { savedByDay: countMap, reelsByDay: listMap };
  }, [reels]);

  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();

  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(currentMonth);

  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  const todayKey = dateKey(new Date());

  // Build grid: previous month padding + current month days + next month padding
  const cells = useMemo(() => {
    const result = [];
    // Prev month padding
    for (let i = firstWeekday - 1; i >= 0; i--) {
      result.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        key: null,
      });
    }
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      result.push({
        day,
        isCurrentMonth: true,
        key: `${year}-${monthIndex}-${day}`,
      });
    }
    // Next month padding to fill row or minimum 35 cells
    const targetLength = result.length <= 35 ? 35 : 42;
    let nextDay = 1;
    while (result.length < targetLength) {
      result.push({
        day: nextDay++,
        isCurrentMonth: false,
        key: null,
      });
    }
    return result;
  }, [year, monthIndex, firstWeekday, daysInMonth, daysInPrevMonth]);

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(year, monthIndex - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, monthIndex + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    if (onSelect) {
      onSelect(todayKey);
    }
  };

  return (
    <section
      className={`bg-white rounded-[1.75rem] p-5 sm:p-6 border border-gray-100 shadow-sm transition-all ${className}`}
      aria-label="Saved reels calendar"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 text-[#114b43]">
          <div className="w-7 h-7 rounded-lg bg-[#114b43]/10 flex items-center justify-center">
            <CalendarDays size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#114b43]">
              Vault Calendar
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={goToToday}
            className="text-[10px] font-bold uppercase tracking-wider text-[#114b43] bg-[#F5F3E9] hover:bg-[#d4f954] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            title="Jump to current month"
          >
            Today
          </button>
          <button
            type="button"
            aria-label="Previous month"
            onClick={goToPrevMonth}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#114b43] hover:bg-[#F5F3E9] transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={goToNextMonth}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#114b43] hover:bg-[#F5F3E9] transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Month & Year Title */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="font-display text-base sm:text-lg tracking-wide uppercase text-[#1a1a1a]">
          {monthLabel}
        </span>
        {selectedKey && onSelect && (
          <button
            type="button"
            onClick={() => onSelect('')}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
            title="Clear date selection"
          >
            <X size={12} />
            <span>Reset filter</span>
          </button>
        )}
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 text-center mb-2">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="text-[11px] font-bold uppercase tracking-wider text-gray-400 pb-1"
          >
            {day.slice(0, 3)}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 text-center gap-1">
        {cells.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return (
              <div
                key={`pad-${idx}`}
                className="mx-auto flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center text-xs text-gray-300 font-medium select-none"
              >
                {cell.day}
              </div>
            );
          }

          const count = savedByDay.get(cell.key) || 0;
          const isSelected = selectedKey === cell.key;
          const isToday = todayKey === cell.key;

          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => {
                if (onSelect) {
                  onSelect(isSelected ? '' : cell.key);
                }
              }}
              title={
                count
                  ? `${formatReadableDate(cell.key)}: ${count} reel${count === 1 ? '' : 's'} saved`
                  : isToday
                  ? 'Today'
                  : formatReadableDate(cell.key)
              }
              className={`mx-auto flex flex-col h-8 w-8 sm:h-9 sm:w-9 min-w-0 items-center justify-center rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                isSelected
                  ? 'bg-[#114b43] text-white shadow-sm ring-2 ring-[#d4f954]'
                  : count > 0
                  ? 'bg-[#d4f954] text-[#114b43] font-bold hover:shadow-xs hover:scale-105'
                  : isToday
                  ? 'ring-1.5 ring-[#114b43] text-[#114b43] font-bold hover:bg-[#F5F3E9]'
                  : 'text-gray-700 hover:bg-[#F5F3E9]/80'
              }`}
            >
              <span>{cell.day}</span>
              {count > 0 && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-[#114b43] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 px-1">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-md bg-[#d4f954] border border-[#114b43]/20" />
          <span className="font-medium text-[11px]">Reel saved</span>
        </div>
        {selectedKey && (
          <span className="text-[11px] font-semibold text-[#114b43]">
            {formatReadableDate(selectedKey)}
          </span>
        )}
      </div>
    </section>
  );
}
