"use client";
import React from "react";
import { Button } from "@/components/ui/button";

export interface DateCalendarProps {
    currentMonth: Date;
    onMonthChange: (next: Date) => void;
    selectedDate: Date;
    onSelectDate: (d: Date) => void;
    heightPx?: number;
}

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const addMonths = (date: Date, n: number) => new Date(date.getFullYear(), date.getMonth() + n, 1);
const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isBeforeToday = (d: Date) => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    const dd = new Date(d);
    dd.setHours(0, 0, 0, 0);
    return dd < t;
};

const getCalendarDays = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const startWeekday = (start.getDay() + 6) % 7; // Monday = 0
    const days: Date[] = [];
    for (let i = 0; i < startWeekday; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() - (startWeekday - i));
        days.push(d);
    }
    for (let d = 1; d <= end.getDate(); d++) {
        days.push(new Date(month.getFullYear(), month.getMonth(), d));
    }
    while (days.length % 7 !== 0 || days.length < 42) {
        const last = days[days.length - 1];
        const next = new Date(last);
        next.setDate(last.getDate() + 1);
        days.push(next);
    }
    return days;
};

export default function DateCalendar({ currentMonth, onMonthChange, selectedDate, onSelectDate, heightPx = 420 }: DateCalendarProps) {
    return (
        <div className="border rounded-lg overflow-hidden flex flex-col" style={{ height: `${heightPx}px` }}>
            <div className="flex items-center justify-between px-3 py-2 bg-bg-secondary-4">
                <Button variant="secondary" onClick={() => onMonthChange(addMonths(currentMonth, -1))}>Prev</Button>
                <div className="font-semibold text-text-primary">
                    {currentMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                </div>
                <Button variant="secondary" onClick={() => onMonthChange(addMonths(currentMonth, 1))}>Next</Button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs py-2 bg-white">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div key={d} className="text-text-secondary">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1 p-2 bg-white flex-1">
                {getCalendarDays(currentMonth).map((d, idx) => {
                    const isCurrentMonth = d.getMonth() === currentMonth.getMonth();
                    const disabled = !isCurrentMonth || isBeforeToday(d);
                    const isSelected = isSameDay(d, selectedDate);
                    return (
                        <button
                            key={idx}
                            disabled={disabled}
                            onClick={() => onSelectDate(new Date(d))}
                            className={`h-10 rounded-md text-sm border flex items-center justify-center transition-colors ${disabled
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : isSelected
                                    ? 'bg-cta-primary text-white border-cta-outline'
                                    : 'bg-white text-text-primary hover:bg-bg-secondary-4'}`}
                        >
                            {d.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}


