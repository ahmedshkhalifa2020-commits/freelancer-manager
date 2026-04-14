/**
 * Filters Component
 *
 * Dynamically renders filters based on configuration
 * Uses shadcn/ui Button, Input, and Select
 */

"use client";

import React from "react";
import type { FiltersProps, FilterConfig, Filter } from "../types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextFilter } from "../../filters/TextFilter";
import { NumberRangeFilter } from "../../filters/NumberRangeFilter";
import { DateRangeFilter } from "../../filters/DateRangeFilter";

export const Filters = React.forwardRef<HTMLDivElement, FiltersProps>(
  (
    {
      filters,
      currentFilters,
      onFilterChange,
      onApply,
      onReset,
      isLoading = false,
    },
    ref,
  ) => {
    const handleApply = () => {
      const appliedFilters: Filter[] = [];

      filters.forEach((filterConfig) => {
        const value = currentFilters[filterConfig.field];

        if (value === undefined || value === null || value === "") {
          return;
        }

        if (
          typeof value === "object" &&
          !Array.isArray(value) &&
          !("min" in value || "max" in value || "from" in value)
        ) {
          return;
        }

        appliedFilters.push({
          field: filterConfig.field,
          operator: filterConfig.operator || "equals",
          value,
        });
      });

      onApply(appliedFilters);
    };

    const hasActiveFilters = Object.values(currentFilters).some(
      (value) => value !== undefined && value !== null && value !== "",
    );

    return (
      <div ref={ref} className="border-b bg-white p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>

        {filters.length === 0 ? (
          <p className="text-sm text-muted-foreground">No filters available</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filters.map((filterConfig) => (
                <FilterField
                  key={filterConfig.field}
                  config={filterConfig}
                  value={currentFilters[filterConfig.field]}
                  onChange={(val) => onFilterChange(filterConfig.field, val)}
                  disabled={isLoading}
                />
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={handleApply}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Apply Filters
              </Button>
              <Button
                onClick={onReset}
                disabled={isLoading || !hasActiveFilters}
                variant="outline"
              >
                Reset
              </Button>
            </div>
          </>
        )}
      </div>
    );
  },
);

Filters.displayName = "Filters";

interface FilterFieldProps {
  config: FilterConfig;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

function FilterField({ config, value, onChange, disabled }: FilterFieldProps) {
  switch (config.type) {
    case "text":
      return (
        <TextFilter
          field={config.field}
          label={config.label}
          value={value || ""}
          placeholder={config.placeholder}
          onChange={onChange}
          disabled={disabled}
        />
      );

    case "number-range":
      return (
        <NumberRangeFilter
          field={config.field}
          label={config.label}
          value={value || {}}
          min={config.min as number | undefined}
          max={config.max as number | undefined}
          onChange={onChange}
          disabled={disabled}
        />
      );

    case "date-range":
      return (
        <DateRangeFilter
          field={config.field}
          label={config.label}
          value={value || {}}
          min={
            config.min
              ? new Date(config.min).toISOString().split("T")[0]
              : undefined
          }
          max={
            config.max
              ? new Date(config.max).toISOString().split("T")[0]
              : undefined
          }
          onChange={onChange}
          disabled={disabled}
        />
      );

    case "select":
      return (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{config.label}</label>
          <Select
            value={value || ""}
            onValueChange={(val) => onChange(val || undefined)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "multi-select":
      return (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{config.label}</label>
          <div className="space-y-2">
            {config.options?.map((option) => (
              <label key={option.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    Array.isArray(value) ? value.includes(option.value) : false
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([
                        ...(Array.isArray(value) ? value : []),
                        option.value,
                      ]);
                    } else {
                      onChange(
                        Array.isArray(value)
                          ? value.filter((v) => v !== option.value)
                          : undefined,
                      );
                    }
                  }}
                  disabled={disabled}
                  className="rounded border"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}
