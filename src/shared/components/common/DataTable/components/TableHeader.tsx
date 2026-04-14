/**
 * TableHeader Component
 *
 * Renders table headers with sortable columns
 * Uses shadcn/ui Table
 */

"use client";

import React from "react";
import {
  TableHead,
  TableHeader as ShadcnTableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { TableHeaderProps } from "../types";

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(
  (
    {
      columns,
      sortConfig,
      onSortChange,
      selectedCount = 0,
      totalCount = 0,
      onSelectAll,
      enableRowSelection = false,
    },
    ref,
  ) => {
    const handleHeaderClick = (key: string, sortable?: boolean) => {
      if (sortable) {
        onSortChange(key);
      }
    };

    const getSortIcon = (columnKey: string) => {
      if (sortConfig?.field !== columnKey) {
        return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
      }

      return sortConfig.direction === "asc" ? (
        <ArrowUp className="h-4 w-4 text-blue-600" />
      ) : (
        <ArrowDown className="h-4 w-4 text-blue-600" />
      );
    };

    return (
      <ShadcnTableHeader ref={ref}>
        <TableRow className="border-b bg-muted/50">
          {/* Selection Checkbox */}
          {enableRowSelection && (
            <TableHead className="w-12">
              <Checkbox
                checked={
                  selectedCount === 0
                    ? false
                    : selectedCount === totalCount
                      ? true
                      : "indeterminate"
                }
                onCheckedChange={(checked) => {
                  if (checked === "indeterminate") return; // Prevent action on indeterminate state
                  onSelectAll?.(checked === true);
                }}
                aria-label="Select all rows"
              />
            </TableHead>
          )}

          {/* Column Headers */}
          {columns.map((column) => (
            <TableHead
              key={column.key}
              onClick={() => handleHeaderClick(column.key, column.sortable)}
              className={`${
                column.sortable ? "cursor-pointer hover:bg-muted/70" : ""
              } ${column.className || ""}`}
              style={column.width ? { width: column.width } : undefined}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{column.header}</span>
                {column.sortable && (
                  <span className="inline-flex">{getSortIcon(column.key)}</span>
                )}
              </div>
            </TableHead>
          ))}
        </TableRow>
      </ShadcnTableHeader>
    );
  },
);

TableHeader.displayName = "TableHeader";
