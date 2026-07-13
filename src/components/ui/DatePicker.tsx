"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from "date-fns";
import { fr } from "date-fns/locale";

interface DatePickerProps {
  date?: Date;
  setDate: (date?: Date) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ date, setDate, placeholder = "Sélectionner une date", className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [viewDate, setViewDate] = React.useState(date || new Date());
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (date) setViewDate(date);
  }, [date]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 });
    const days: Date[] = [];
    let current = start;
    while (current <= end) {
      days.push(current);
      current = addDays(current, 1);
    }
    return days;
  };

  const days = getDaysInMonth();
  const weekDays = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

  return (
    <div className={`relative ${className || ""}`} ref={ref}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 px-3 h-11 rounded-lg border text-sm transition-all duration-150 bg-white
          ${open ? "border-sky-500 ring-2 ring-sky-100" : "border-gray-300 hover:border-gray-400"}
          ${date ? "text-gray-900 font-medium" : "text-gray-400"}`}
      >
        <Calendar className="h-4 w-4 text-sky-500 shrink-0" />
        <span className="flex-1 text-left">
          {date ? format(date, "d MMMM yyyy", { locale: fr }) : placeholder}
        </span>
        {date && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setDate(undefined); }}
            className="text-gray-300 hover:text-gray-500 transition-colors text-base leading-none px-1"
          >
            ×
          </button>
        )}
      </button>

      {/* Dropdown Calendar */}
      {open && (
        <div className="absolute z-50 top-[calc(100%+6px)] left-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-[300px] select-none"
          style={{ boxShadow: "0 20px 60px -10px rgba(0,0,0,0.15)" }}>
          
          {/* Header Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setViewDate(subMonths(viewDate, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="text-sm font-bold text-gray-900 capitalize">
              {format(viewDate, "MMMM yyyy", { locale: fr })}
            </div>
            
            <button
              type="button"
              onClick={() => setViewDate(addMonths(viewDate, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Week days header */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map(day => (
              <div key={day} className="flex items-center justify-center h-8 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {days.map((day, i) => {
              const isSelected = date && isSameDay(day, date);
              const isCurrentMonth = isSameMonth(day, viewDate);
              const isTodayDay = isToday(day);

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setDate(day);
                    setOpen(false);
                  }}
                  className={`
                    flex items-center justify-center h-9 w-full rounded-xl text-sm font-medium transition-all duration-100
                    ${isSelected
                      ? "bg-sky-500 text-white shadow-md shadow-sky-200 scale-105 font-bold"
                      : isTodayDay && !isSelected
                      ? "bg-sky-50 text-sky-600 font-bold ring-1 ring-sky-300"
                      : isCurrentMonth
                      ? "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      : "text-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => { setDate(new Date()); setOpen(false); }}
              className="text-xs text-sky-600 font-semibold hover:text-sky-700 transition-colors"
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={() => { setDate(undefined); setOpen(false); }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Effacer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
