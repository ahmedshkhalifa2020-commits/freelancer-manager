/**
 * DateRangeFilter Component
 *
 * Date range filter using shadcn/ui Input
 */

"use client";

import React from "react";
import { Input } from "@/components/ui/input";

interface DateRangeValue {
  from?: string;
  to?: string;
}

interface DateRangeFilterProps {
  field: string;
  label: string;
  value?: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
}

export const DateRangeFilter = React.forwardRef<
  HTMLDivElement,
  DateRangeFilterProps
>(({ field, label, value = {}, min, max, onChange, disabled = false }, ref) => {
  return (
    <div ref={ref} className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label
            htmlFor={`filter-${field}-from`}
            className="text-xs text-gray-600"
          >
            From
          </label>
          <Input
            id={`filter-${field}-from`}
            type="date"
            value={value.from ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                from: e.target.value || undefined,
              })
            }
            disabled={disabled}
            min={min}
            max={max}
          />
        </div>
        <span className="text-gray-400">−</span>
        <div className="flex-1">
          <label
            htmlFor={`filter-${field}-to`}
            className="text-xs text-gray-600"
          >
            To
          </label>
          <Input
            id={`filter-${field}-to`}
            type="date"
            value={value.to ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                to: e.target.value || undefined,
              })
            }
            disabled={disabled}
            min={min}
            max={max}
          />
        </div>
      </div>
    </div>
  );
});

DateRangeFilter.displayName = "DateRangeFilter";
