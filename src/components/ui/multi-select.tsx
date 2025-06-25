import * as React from "react";
import Select from "react-select";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
    options: readonly string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select options...",
    className,
}: MultiSelectProps) {
    // Convert string options to react-select format
    const selectOptions = options.map(option => ({
        value: option,
        label: option
    }));

    // Convert selected strings to react-select format
    const selectedOptions = selected.map(option => ({
        value: option,
        label: option
    }));

    return (
        <Select
            isMulti
            options={selectOptions}
            value={selectedOptions}
            onChange={(newValue) => {
                onChange(newValue.map(option => option.value));
            }}
            placeholder={placeholder}
            className={cn("w-full", className)}
            classNamePrefix="select"
            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
            styles={{
                control: (base, state) => ({
                    ...base,
                    backgroundColor: 'white',
                    borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
                    borderWidth: '2px',
                    borderRadius: '8px',
                    minHeight: '44px',
                    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    '&:hover': {
                        borderColor: '#d1d5db'
                    },
                    transition: 'all 0.2s ease-in-out'
                }),
                menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999
                }),
                menu: (base) => ({
                    ...base,
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    zIndex: 9999
                }),
                option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                        ? '#3b82f6'
                        : state.isFocused
                            ? '#eff6ff'
                            : 'white',
                    color: state.isSelected ? 'white' : '#374151',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    margin: '2px 4px',
                    '&:hover': {
                        backgroundColor: state.isSelected ? '#2563eb' : '#f3f4f6'
                    },
                    transition: 'all 0.2s ease-in-out'
                }),
                multiValue: (base) => ({
                    ...base,
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    margin: '2px',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }),
                multiValueLabel: (base) => ({
                    ...base,
                    color: 'white',
                    fontWeight: '500'
                }),
                multiValueRemove: (base) => ({
                    ...base,
                    color: 'white',
                    '&:hover': {
                        backgroundColor: '#2563eb',
                        color: 'white'
                    },
                    borderRadius: '4px',
                    transition: 'all 0.2s ease-in-out'
                }),
                placeholder: (base) => ({
                    ...base,
                    color: '#9ca3af'
                }),
                input: (base) => ({
                    ...base,
                    color: '#374151'
                })
            }}
        />
    );
} 