"use client";
import React from "react";

export interface SlotsPickerProps {
    slots: string[];
    selected: string[];
    onToggle: (slot: string) => void;
    heightPx?: number;
}

export default function SlotsPicker({ slots, selected, onToggle, heightPx = 420 }: SlotsPickerProps) {
    return (
        <div className="border rounded-md p-2 overflow-auto scrollbar-thin" style={{ height: `${heightPx}px` }}>
            <div className="grid grid-cols-2 gap-2">
                {slots.map((slot) => (
                    <button
                        key={slot}
                        onClick={() => onToggle(slot)}
                        className={`px-3 py-2 rounded-full border text-sm ${selected.includes(slot) ? "bg-cta-primary text-white border-cta-outline" : "bg-white text-text-primary"}`}
                    >
                        {slot}
                    </button>
                ))}
            </div>
        </div>
    );
}


