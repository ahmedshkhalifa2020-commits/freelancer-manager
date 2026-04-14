/**
 * NumberRangeFilter Component
 *
 * Number range filter using shadcn/ui Input
 */

"use client";

import React from "react";
import { Input } from "@/components/ui/input";

interface NumberRangeValue {
  min?: number;
  max?: number;
}

interface NumberRangeFilterProps {
  field: string;
  label: string;
  value?: NumberRangeValue;
  min?: number;
  max?: number;
  onChange: (value: NumberRangeValue) => void;
  disabled?: boolean;
}

export const NumberRangeFilter = React.forwardRef<
  HTMLDivElement,
  NumberRangeFilterProps
>(
  (
    {
      field,
      label,
      value = {},
      min = 0,
      max = 1000000,
      onChange,
      disabled = false,
    },
    ref,
  ) => {
    return (
      <div ref={ref} className="flex flex-col gap-2">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label
              htmlFor={`filter-${field}-min`}
              className="text-xs text-gray-600"
            >
              Min
            </label>
            <Input
              id={`filter-${field}-min`}
              type="number"
              placeholder={`Min: ${min}`}
              value={value.min ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  min: e.target.value
                    ? parseInt(e.target.value, 10)
                    : undefined,
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
              htmlFor={`filter-${field}-max`}
              className="text-xs text-gray-600"
            >
              Max
            </label>
            <Input
              id={`filter-${field}-max`}
              type="number"
              placeholder={`Max: ${max}`}
              value={value.max ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  max: e.target.value
                    ? parseInt(e.target.value, 10)
                    : undefined,
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
  },
);

NumberRangeFilter.displayName = "NumberRangeFilter";
