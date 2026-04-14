/**
 * TableBody Component
 *
 * Renders table rows with optional actions dropdown
 * Uses shadcn/ui Table, DropdownMenu, and Skeleton
 */

"use client";

import React from "react";
import {
  TableBody as ShadcnTableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreVertical } from "lucide-react";
import type { TableBodyProps } from "../types";

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  TableBodyProps
>(
  (
    {
      columns,
      rows,
      rowActions = [],
      onRowClick,
      isLoading = false,
      selectedRows = [],
      onRowSelectionChange,
      enableRowSelection = false,
    },
    ref,
  ) => {
    if (isLoading) {
      // Show skeleton loaders
      return (
        <ShadcnTableBody ref={ref}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <TableRow key={idx}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </ShadcnTableBody>
      );
    }

    if (rows.length === 0) {
      return (
        <ShadcnTableBody ref={ref}>
          <TableRow>
            <TableCell
              colSpan={columns.length + (enableRowSelection ? 1 : 0)}
              className="h-24 text-center text-muted-foreground"
            >
              No data available
            </TableCell>
          </TableRow>
        </ShadcnTableBody>
      );
    }

    return (
      <ShadcnTableBody ref={ref}>
        {rows.map((row, idx) => {
          // Determine row ID for selection
          const rowId =
            typeof row === "object" && row !== null && "id" in row
              ? String((row as any).id)
              : String(idx);

          const isSelected = selectedRows?.includes(rowId);

          return (
            <TableRow
              key={rowId}
              onClick={() => onRowClick?.(row)}
              className={`${
                onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
              } ${isSelected ? "bg-blue-50" : ""}`}
            >
              {/* Selection Checkbox */}
              {enableRowSelection && (
                <TableCell className="w-12">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                      onRowSelectionChange?.(rowId, e.target.checked)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-2 border-input"
                    aria-label={`Select row ${idx + 1}`}
                  />
                </TableCell>
              )}

              {/* Data Cells */}
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={`${column.className || ""}`}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.key === "actions" ? (
                    <ActionsMenu row={row} actions={rowActions} />
                  ) : column.render ? (
                    column.render(row, idx)
                  ) : (
                    <span>{String((row as any)[column.key] || "−")}</span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </ShadcnTableBody>
    );
  },
);

TableBody.displayName = "TableBody";

/**
 * ActionsMenu Component
 *
 * Dropdown menu with row actions
 */
interface ActionsMenuProps {
  row: any;
  actions: Array<{
    label: string;
    onClick: (row: any) => void;
    variant?: "default" | "destructive" | "secondary";
  }>;
}

function ActionsMenu({ row, actions }: ActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(e) => e.stopPropagation()}
        className="rounded-md p-2 hover:bg-muted"
      >
        <MoreVertical className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, idx) => (
          <DropdownMenuItem
            key={idx}
            onClick={() => action.onClick(row)}
            className={
              action.variant === "destructive"
                ? "text-destructive focus:bg-destructive/10 focus:text-destructive"
                : ""
            }
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
