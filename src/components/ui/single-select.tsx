import * as React from "react";
import Select from "react-select";
import { cn } from "@/lib/utils";

interface SingleSelectProps {
    options: readonly string[];
    selected: string;
    onChange: (selected: string) => void;
    placeholder?: string;
    className?: string;
}

export function SingleSelect({
    options,
    selected,
    onChange,
    placeholder = "Select an option...",
    className,
}: SingleSelectProps) {
    // Convert string options to react-select format
    const selectOptions = options.map(option => ({
        value: option,
        label: option
    }));

    // Convert selected string to react-select format
    const selectedOption = selected ? { value: selected, label: selected } : null;

    return (
        <Select
            options={selectOptions}
            value={selectedOption}
            onChange={(newValue) => {
                onChange(newValue ? newValue.value : "");
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
                })
            }}
        />
    );
} 