/**
 * DataTable Public Exports
 */

export { DataTable } from "./DataTable";
export type { DataTableProps } from "./DataTable";

export { useDataTable } from "./hooks/useDataTable";
export type { UseDataTableReturn } from "./hooks/useDataTable";

export type {
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

// Sub-components (for advanced customization)
export { Filters } from "./components/Filters";
export { Pagination } from "./components/Pagination";
export { TableHeader } from "./components/TableHeader";
export { TableBody } from "./components/TableBody";
