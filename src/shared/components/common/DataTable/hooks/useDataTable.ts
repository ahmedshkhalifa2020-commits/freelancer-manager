/**
 * useDataTable Hook
 *
 * Manages filter state and event handlers for the DataTable component
 * Filters only trigger onChange when "Apply" is clicked
 */

import { useState, useCallback } from "react";
import type { Filter, FilterConfig, QueryParams } from "../types";

interface UseDataTableOptions {
  initialQuery: QueryParams;
  filters?: FilterConfig[];
  onChange: (query: QueryParams) => void;
}

export function useDataTable({
  initialQuery,
  filters = [],
  onChange,
}: UseDataTableOptions) {
  // Local filter state (not submitted until Apply)
  const [filterValues, setFilterValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    filters.forEach((filter) => {
      initial[filter.field] = undefined;
    });
    return initial;
  });

  const handleFilterChange = useCallback((field: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    const appliedFilters: Filter[] = [];

    filters.forEach((filterConfig) => {
      const value = filterValues[filterConfig.field];

      if (value === undefined || value === null || value === "") {
        return;
      }

      appliedFilters.push({
        field: filterConfig.field,
        operator: filterConfig.operator || "equals",
        value,
      });
    });

    onChange({
      ...initialQuery,
      page: 1,
      filters: appliedFilters,
    });
  }, [filterValues, filters, initialQuery, onChange]);

  const handleResetFilters = useCallback(() => {
    const resetValues: Record<string, any> = {};
    filters.forEach((filter) => {
      resetValues[filter.field] = undefined;
    });
    setFilterValues(resetValues);

    onChange({
      ...initialQuery,
      page: 1,
      filters: [],
    });
  }, [filters, initialQuery, onChange]);

  const handlePageChange = useCallback(
    (page: number) => {
      onChange({
        ...initialQuery,
        page,
      });
    },
    [initialQuery, onChange],
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      onChange({
        ...initialQuery,
        page: 1,
        pageSize,
      });
    },
    [initialQuery, onChange],
  );

  const handleSortChange = useCallback(
    (field: string) => {
      const currentSort = initialQuery.sort;

      let newSort;

      if (currentSort?.field === field) {
        newSort = {
          field,
          direction:
            currentSort.direction === "asc"
              ? ("desc" as const)
              : ("asc" as const),
        };
      } else {
        newSort = {
          field,
          direction: "asc" as const,
        };
      }

      onChange({
        ...initialQuery,
        page: 1,
        sort: newSort,
      });
    },
    [initialQuery, onChange],
  );

  return {
    filterValues,
    onFilterChange: handleFilterChange,
    onApplyFilters: handleApplyFilters,
    onResetFilters: handleResetFilters,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    onSortChange: handleSortChange,
  };
}

export type UseDataTableReturn = ReturnType<typeof useDataTable>;
