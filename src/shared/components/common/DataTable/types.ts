/**
 * DataTable Type Definitions
 *
 * All TypeScript types and interfaces for the DataTable system
 * Ensures type safety throughout the application
 */

/**
 * Represents a single column in the DataTable
 */
export interface Column<T = Record<string, any>> {
  /** Unique identifier for the column */
  key: string;

  /** Display header text */
  header: string;

  /** Whether this column is sortable */
  sortable?: boolean;

  /** Custom render function for cell content */
  render?: (row: T, index: number) => React.ReactNode;

  /** Custom CSS class for styling */
  className?: string;

  /** Column width specification */
  width?: string;
}

/**
 * Filter operator types
 */
export type FilterOperator =
  | "equals"
  | "contains"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "in";

/**
 * Represents a single filter
 */
export interface Filter {
  field: string;
  operator: FilterOperator;
  value: any;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

/**
 * Query parameters for API calls
 */
export interface QueryParams {
  page: number;
  pageSize: number;
  filters: Filter[];
  sort?: SortConfig;
}

/**
 * Filter configuration for UI rendering
 */
export interface FilterConfig {
  field: string;
  label: string;
  type: "text" | "number-range" | "date-range" | "select" | "multi-select";
  operator?: FilterOperator;
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  min?: number | Date;
  max?: number | Date;
}

/**
 * API response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * DataTable props
 */
export interface DataTableProps<T = Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  pageSizeOptions?: number[];
  filters?: FilterConfig[];
  queryParams: QueryParams;
  isLoading?: boolean;
  error?: string | null;
  onChange: (query: QueryParams) => void;
  onRowClick?: (row: T) => void;
  rowActions?: {
    label: string;
    onClick: (row: T) => void;
    variant?: "default" | "destructive" | "secondary";
  }[];
  emptyMessage?: string;
  enableRowSelection?: boolean;
  selectedRows?: string[];
  onRowSelectionChange?: (selectedIds: string[]) => void;
}

/**
 * Filters props
 */
export interface FiltersProps {
  filters: FilterConfig[];
  currentFilters: Record<string, any>;
  onFilterChange: (field: string, value: any) => void;
  onApply: (filters: Filter[]) => void;
  onReset: () => void;
  isLoading?: boolean;
}

/**
 * Pagination props
 */
export interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
}

/**
 * TableHeader props
 */
export interface TableHeaderProps<T = Record<string, any>> {
  columns: Column<T>[];
  sortConfig?: SortConfig;
  onSortChange: (field: string) => void;
  selectedCount?: number;
  totalCount?: number;
  onSelectAll?: (selected: boolean) => void;
  enableRowSelection?: boolean;
}

/**
 * TableBody props
 */
export interface TableBodyProps<T = Record<string, any>> {
  columns: Column<T>[];
  rows: T[];
  rowActions?: {
    label: string;
    onClick: (row: T) => void;
    variant?: "default" | "destructive" | "secondary";
  }[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  selectedRows?: string[];
  onRowSelectionChange?: (rowId: string, selected: boolean) => void;
  enableRowSelection?: boolean;
}

/**
 * ConfirmDialog props
 */
export interface ConfirmDialogProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionVariant?: "default" | "destructive";
  cancelLabel?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}
