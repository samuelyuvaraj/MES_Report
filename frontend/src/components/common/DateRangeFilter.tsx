import { CalendarDays, ChevronDown } from "lucide-react";
import type { DatePreset } from "../../types/dashboard";
import "./DateRangeFilter.css";

export type { DatePreset };

interface DateRangeFilterProps {
    value: DatePreset;
    label: string;
    customFrom: string;
    customTo: string;
    onChange: (value: DatePreset) => void;
    onCustomChange: (from: string, to: string) => void;
}

export function DateRangeFilter({
    value,
    label,
    customFrom,
    customTo,
    onChange,
    onCustomChange
}: DateRangeFilterProps) {
    const presets: DatePreset[] = ["All", "Today", "This Week", "This Month", "Custom"];

    return (
        <div className="date-filter">
            <button className="date-filter__range" aria-label="Select date range" type="button">
                <CalendarDays size={16} />
                <span>{label}</span>
                <ChevronDown size={15} />
            </button>
            <div className="date-filter__presets" role="group" aria-label="Date range presets">
                {presets.map((preset) => (
                    <button className={value === preset ? "is-active" : ""} key={preset} onClick={() => onChange(preset)} type="button">
                        {preset}
                    </button>
                ))}
            </div>
            {value === "Custom" && (
                <div className="date-filter__custom">
                    <input aria-label="From date" type="date" value={customFrom} onChange={(event) => onCustomChange(event.target.value, customTo)} />
                    <input aria-label="To date" type="date" value={customTo} onChange={(event) => onCustomChange(customFrom, event.target.value)} />
                </div>
            )}
        </div>
    );
}
