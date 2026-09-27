export interface DateRange {
    from: Date;
    to: Date;
}

function startOfDay(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(value: Date, amount: number): Date {
    const next = new Date(value);
    next.setDate(next.getDate() + amount);
    return next;
}

export function previousRange(range: DateRange): DateRange {
    const duration = range.to.getTime() - range.from.getTime();
    return {
        from: new Date(range.from.getTime() - duration),
        to: range.from
    };
}

export function parseDateRange(fromValue: unknown, toValue: unknown): DateRange | null {
    const parsedFrom = typeof fromValue === "string" && fromValue ? new Date(fromValue) : null;
    const parsedTo = typeof toValue === "string" && toValue ? new Date(toValue) : null;

    if (parsedFrom && parsedTo && !Number.isNaN(parsedFrom.getTime()) && !Number.isNaN(parsedTo.getTime())) {
        const from = startOfDay(parsedFrom);
        const exclusiveTo = startOfDay(parsedTo);
        const to = exclusiveTo.getTime() > from.getTime() ? exclusiveTo : addDays(from, 1);
        return { from, to };
    }

    return null;
}
