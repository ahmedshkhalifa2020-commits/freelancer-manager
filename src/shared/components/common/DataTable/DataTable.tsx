/**
 * DataTable Component
 *
 * Main component that orchestrates all DataTable functionality
 * Server-side pagination, sorting, filtering, and custom rendering
 * Uses shadcn/ui Table, Button, Dialog, etc.
 */

"use client";

import React from "react";
import { Table } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { DataTableProps } from "./types";
import { useDataTable } from "./hooks/useDataTable";
import { TableHeader } from "./components/TableHeader";
import { TableBody } from "./components/TableBody";
import { Pagination } from "./components/Pagination";
import { Filters } from "./components/Filters";
import { AlertCircle } from "lucide-react";

/**
 * DataTable Component
 *
 * A fully generic, reusable data table component for displaying paginated data
 * with sorting, filtering, and custom actions.
 *
 * Features:
 * - Server-side pagination (controlled)
 * - Column sorting
 * - Dynamic filtering (Apply/Reset buttons)
 * - Custom column rendering
 * - Row selection support
 * - Loading and error states
 * - No API calls inside component (fully controlled)
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={columns}
 *   filters={filters}
 *   data={data}
 *   total={total}
 *   page={queryParams.page}
 *   pageSize={queryParams.pageSize}
 *   queryParams={queryParams}
 *   onChange={setQueryParams}
 *   isLoading={isLoading}
 *   error={error}
 *   rowActions={[...]}
 * />
 * ```
 */
export const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(
  (
    {
      columns,
      data,
      total,
      page,
      pageSize,
      pageSizeOptions = [10, 25, 50, 100],
      filters = [],
      queryParams,
      isLoading = false,
      error = null,
      onChange,
      onRowClick,
      rowActions = [],
      emptyMessage = "No data available",
      enableRowSelection = false,
      selectedRows = [],
      onRowSelectionChange,
    },
    ref,
  ) => {
    // Initialize the DataTable hook
    const {
      filterValues,
      onFilterChange,
      onApplyFilters,
      onResetFilters,
      onPageChange,
      onPageSizeChange,
      onSortChange,
    } = useDataTable({
      initialQuery: queryParams,
      filters,
      onChange,
    });

    // Calculate total pages
    const totalPages = Math.ceil(total / pageSize) || 1;

    // Enhance columns with actions if rowActions are provided
    const displayColumns = React.useMemo(() => {
      if (rowActions.length === 0) return columns;

      const hasActionsColumn = columns.some((col) => col.key === "actions");
      if (hasActionsColumn) return columns;

      return [
        ...columns,
        {
          key: "actions",
          header: "Actions",
          sortable: false,
        },
      ];
    }, [columns, rowActions]);

    return (
      <div ref={ref} className="flex flex-col h-full gap-4">
        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters Section */}
        {filters.length > 0 && (
          <Filters
            filters={filters}
            currentFilters={filterValues}
            onFilterChange={onFilterChange}
            onApply={onApplyFilters}
            onReset={onResetFilters}
            isLoading={isLoading}
          />
        )}

        {/* Table Section */}
        <div className="flex-1 overflow-auto rounded-lg border">
          <Table>
            <TableHeader
              columns={displayColumns}
              sortConfig={queryParams.sort}
              onSortChange={onSortChange}
              selectedCount={selectedRows?.length || 0}
              totalCount={data.length}
              onSelectAll={(selected) => {
                if (selected) {
                  const newSelectedRows = data.map((row: any, idx: number) =>
                    typeof row === "object" && row !== null && "id" in row
                      ? String(row.id)
                      : String(idx),
                  );
                  onRowSelectionChange?.(newSelectedRows);
                } else {
                  onRowSelectionChange?.([]);
                }
              }}
              enableRowSelection={enableRowSelection}
            />
            <TableBody
              columns={displayColumns}
              rows={data}
              rowActions={rowActions}
              onRowClick={onRowClick}
              isLoading={isLoading}
              selectedRows={selectedRows}
              onRowSelectionChange={(rowId, selected) => {
                if (selected) {
                  onRowSelectionChange?.([...(selectedRows || []), rowId]);
                } else {
                  onRowSelectionChange?.(
                    (selectedRows || []).filter((id) => id !== rowId),
                  );
                }
              }}
              enableRowSelection={enableRowSelection}
            />
          </Table>
        </div>

        {/* Pagination Section */}
        {!isLoading && data.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            isLoading={isLoading}
          />
        )}
      </div>
    );
  },
);

DataTable.displayName = "DataTable";

// Export all related components and types
export { useDataTable } from "./hooks/useDataTable";
export type {
  DataTableProps,
  Column,
  Filter,
  FilterConfig,
  FilterOperator,
  PaginatedResponse,
  QueryParams,
  SortConfig,
  FiltersProps,
  PaginationProps,
  TableHeaderProps,
  TableBodyProps,
  ConfirmDialogProps,
} from "./types";
