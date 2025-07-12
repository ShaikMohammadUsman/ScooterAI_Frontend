import * as React from "react";
import Select, {
    GroupBase,
    StylesConfig,
    CSSObjectWithLabel,
    OptionProps,
    ControlProps,
    components,
    DropdownIndicatorProps,
    MenuListProps,
} from "react-select";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MultiSelectProps {
    options: readonly string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
}

type OptionType = { value: string; label: string };

// Custom dropdown indicator
const CustomDropdownIndicator = (props: DropdownIndicatorProps<OptionType, true>) => (
    <components.DropdownIndicator {...props}>
        <ChevronDown className="w-4 h-4 text-slate-300" />
    </components.DropdownIndicator>
);

// Custom menu list with fade shadow and chevron at top/bottom
const CustomMenuList = (props: MenuListProps<OptionType, true>) => {
    const { children } = props;
    const ref = React.useRef<HTMLDivElement>(null);
    const [showTop, setShowTop] = React.useState(false);
    const [showBottom, setShowBottom] = React.useState(false);

    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const handleScroll = () => {
            setShowTop(el.scrollTop > 0);
            setShowBottom(el.scrollTop + el.clientHeight < el.scrollHeight);
        };
        handleScroll();
        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="relative">
            {showTop && (
                <div className="menu-fade-top flex justify-center items-start">
                    <ChevronUp className="w-5 h-5 text-slate-300 drop-shadow" style={{ marginTop: 2 }} />
                </div>
            )}
            <div
                ref={ref}
                className="scrollbar-ghost max-h-[300px] overflow-y-auto"
                style={{ position: "relative" }}
            >
                {children}
            </div>
            {showBottom && (
                <div className="menu-fade-bottom flex justify-center items-end">
                    <ChevronDown className="w-5 h-5 text-slate-300 drop-shadow" style={{ marginBottom: 2 }} />
                </div>
            )}
        </div>
    );
};

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select options...",
    className,
}: MultiSelectProps) {
    const selectOptions = options.map(option => ({
        value: option,
        label: option
    }));

    const selectedOptions = selected.map(option => ({
        value: option,
        label: option
    }));

    const customStyles: StylesConfig<OptionType, true, GroupBase<OptionType>> = {
        control: (base: CSSObjectWithLabel, state: ControlProps<OptionType, true, GroupBase<OptionType>>) => ({
            ...base,
            backgroundColor: 'white',
            borderColor: state.isFocused ? '#cbd5e1' : '#e2e8f0', // slate-300 or slate-200
            borderWidth: '2px',
            borderRadius: '8px',
            minHeight: '44px',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(203, 213, 225, 0.08)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            '&:hover': {
                borderColor: '#94a3b8' // slate-400
            },
            transition: 'all 0.2s ease-in-out',
            fontSize: '1rem',
        }),
        menuPortal: (base: CSSObjectWithLabel) => ({
            ...base,
            zIndex: 9999
        }),
        menu: (base: CSSObjectWithLabel) => ({
            ...base,
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '2px solid #e2e8f0',
            zIndex: 9999,
            marginTop: 4,
            paddingBottom: 0,
            boxShadow: '0 10px 15px -3px rgba(203,213,225,0.08), 0 4px 6px -2px rgba(0,0,0,0.05)',
            minWidth: 0,
            maxWidth: '100%',
        }),
        menuList: (base: CSSObjectWithLabel) => ({
            ...base,
            maxHeight: 300,
            paddingBottom: 0,
            minWidth: 0,
            maxWidth: '100%',
            whiteSpace: 'normal',
        }),
        option: (base: CSSObjectWithLabel, state: OptionProps<OptionType, true, GroupBase<OptionType>>) => ({
            ...base,
            whiteSpace: 'normal',
            fontSize: '0.8rem',
            backgroundColor: state.isSelected
                ? '#cbd5e1' // slate-300
                : state.isFocused
                    ? '#f8fafc' // slate-50
                    : 'white',
            color: state.isSelected ? '#475569' : '#475569', // slate-600 for better contrast
            padding: '8px 12px',
            borderRadius: '6px',
            margin: '2px 4px',
            fontWeight: state.isSelected ? 600 : 400,
            '&:hover': {
                backgroundColor: state.isSelected ? '#94a3b8' : '#f1f5f9', // slate-400 or slate-100
                color: state.isSelected ? 'white' : '#475569', // slate-600
            },
            transition: 'all 0.2s ease-in-out',
        }),
        multiValue: (base: CSSObjectWithLabel) => ({
            ...base,
            backgroundColor: '#cbd5e1', // slate-300
            color: '#475569', // slate-600
            borderRadius: '6px',
            padding: '2px 8px',
            margin: '2px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }),
        multiValueLabel: (base: CSSObjectWithLabel) => ({
            ...base,
            color: '#475569', // slate-600
            fontWeight: '500'
        }),
        multiValueRemove: (base: CSSObjectWithLabel) => ({
            ...base,
            color: '#475569', // slate-600
            '&:hover': {
                backgroundColor: '#94a3b8', // slate-400
                color: 'white'
            },
            borderRadius: '4px',
            transition: 'all 0.2s ease-in-out'
        }),
        placeholder: (base: CSSObjectWithLabel) => ({
            ...base,
            color: '#cbd5e1' // slate-300
        }),
        input: (base: CSSObjectWithLabel) => ({
            ...base,
            color: '#475569' // slate-600
        })
    };

    return (
        <Select
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            options={selectOptions}
            value={selectedOptions}
            onChange={(newValue) => {
                onChange(newValue.map(option => option.value));
            }}
            placeholder={placeholder}
            className={cn("w-full", className)}
            classNamePrefix="select"
            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
            styles={customStyles}
            components={{
                DropdownIndicator: CustomDropdownIndicator,
                MenuList: CustomMenuList,
            }}
        />
    );
} 