/**
 * Pagination Component
 *
 * Page navigation and page size selection
 * Uses shadcn/ui Button and Select
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaginationProps } from "../types";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      page,
      totalPages,
      pageSize,
      pageSizeOptions,
      onPageChange,
      onPageSizeChange,
      isLoading = false,
    },
    ref,
  ) => {
    const canGoPrevious = page > 1;
    const canGoNext = page < totalPages;

    return (
      <div
        ref={ref}
        className="flex flex-col gap-4 border-t bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="text-sm text-muted-foreground">
          Page <span className="font-medium">{page}</span> of{" "}
          <span className="font-medium">{totalPages}</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm font-medium">
              Rows per page:
            </label>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(parseInt(val, 10))}
              disabled={isLoading}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pagination Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={!canGoPrevious || isLoading}
              title="First page"
            >
              <ChevronFirst className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={!canGoPrevious || isLoading}
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={!canGoNext || isLoading}
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={!canGoNext || isLoading}
              title="Last page"
            >
              <ChevronLast className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

Pagination.displayName = "Pagination";
