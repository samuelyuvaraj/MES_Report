import type { DatePreset, DateRangeValue } from "../types/dashboard";

function startOfDay(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(value: Date, amount: number): Date {
    const next = new Date(value);
    next.setDate(next.getDate() + amount);
    return next;
}

export function resolveDateRange(preset: DatePreset, customFrom?: string, customTo?: string): DateRangeValue | null {
    if (preset === "All") {
        return null;
    }

    const today = startOfDay(new Date());

    if (preset === "Today") {
        return { from: today, to: addDays(today, 1) };
    }

    if (preset === "This Week") {
        const weekday = today.getDay();
        const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
        const from = addDays(today, mondayOffset);
        return { from, to: addDays(from, 7) };
    }

    if (preset === "This Month") {
        const from = new Date(today.getFullYear(), today.getMonth(), 1);
        return { from, to: new Date(today.getFullYear(), today.getMonth() + 1, 1) };
    }

    const parsedFrom = customFrom ? startOfDay(new Date(customFrom)) : addDays(today, -6);
    const parsedTo = customTo ? addDays(startOfDay(new Date(customTo)), 1) : addDays(today, 1);
    return {
        from: parsedFrom,
        to: parsedTo.getTime() > parsedFrom.getTime() ? parsedTo : addDays(parsedFrom, 1)
    };
}

export function formatRangeLabel(range: DateRangeValue | null): string {
    if (!range) {
        return "All work orders";
    }
    const lastInclusive = addDays(range.to, -1);
    const format = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" });
    return `${format.format(range.from)} - ${format.format(lastInclusive)}`;
}

export function toQueryDate(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function formatDisplayDate(value: string | null, withTime = false): string {
    if (!value) {
        return "—";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-US", withTime
        ? { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
        : { month: "short", day: "2-digit", year: "numeric" }
    ).format(date);
}
