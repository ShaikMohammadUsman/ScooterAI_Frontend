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
                control: (base) => ({
                    ...base,
                    backgroundColor: 'white',
                    borderColor: 'hsl(var(--input))',
                    '&:hover': {
                        borderColor: 'hsl(var(--input))'
                    }
                }),
                menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999
                }),
                menu: (base) => ({
                    ...base,
                    backgroundColor: 'white',
                    zIndex: 9999
                }),
                option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                        ? 'hsl(var(--secondary))'
                        : state.isFocused
                            ? 'hsl(var(--secondary)/0.5)'
                            : 'white',
                    color: state.isSelected ? 'hsl(var(--secondary-foreground))' : 'hsl(var(--foreground))',
                    '&:hover': {
                        backgroundColor: 'hsl(var(--secondary)/0.5)'
                    }
                }),
                multiValue: (base) => ({
                    ...base,
                    backgroundColor: 'hsl(var(--secondary))',
                    color: 'hsl(var(--secondary-foreground))'
                }),
                multiValueLabel: (base) => ({
                    ...base,
                    color: 'hsl(var(--secondary-foreground))'
                }),
                multiValueRemove: (base) => ({
                    ...base,
                    color: 'hsl(var(--secondary-foreground))',
                    '&:hover': {
                        backgroundColor: 'hsl(var(--secondary)/0.8)',
                        color: 'hsl(var(--secondary-foreground))'
                    }
                })
            }}
        />
    );
} 