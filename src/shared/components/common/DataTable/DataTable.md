# DataTable System - Complete Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [How It Works](#how-it-works)
4. [Usage Guide](#usage-guide)
5. [QueryParams Explanation](#queryparams-explanation)
6. [Extensibility](#extensibility)
7. [Important Notes](#important-notes)
8. [Backend Implementation](#backend-implementation)

---

## Overview

### What is the DataTable?

The DataTable is a **production-ready, fully reusable component** designed for displaying paginated, sortable, and filterable data across multiple features in your Next.js application.

### Why It Was Built

- **Eliminates code duplication** across features
- **Enforces consistent UX** for data tables
- **Separates concerns** between data fetching and UI rendering
- **Remains feature-agnostic** through controlled component patterns
- **Uses shadcn/ui** for enterprise-grade UI components
- **Follows Next.js best practices** with server/client components

### Key Features

✅ **Server-side pagination** - Efficient data loading  
✅ **Column sorting** - Click to sort (asc/desc toggle)  
✅ **Dynamic filters** - Apply/Reset buttons (no auto-trigger)  
✅ **Custom rendering** - Full control over cell content  
✅ **Row actions** - Dropdown menus with custom actions  
✅ **Row selection** - Optional multi-select support  
✅ **Loading states** - Skeleton loaders during fetch  
✅ **Error handling** - Built-in error message display  
✅ **100% TypeScript** - Complete type safety  
✅ **Fully controlled** - Parent owns all API calls

---

## Architecture

### File Structure

```
src/shared/components/common/
├── DataTable/
│   ├── DataTable.tsx              # Main component (orchestrator)
│   ├── index.ts                   # Public exports
│   ├── types.ts                   # TypeScript definitions
│   ├── hooks/
│   │   └── useDataTable.ts        # State management hook
│   └── components/
│       ├── TableHeader.tsx        # Column headers with sort
│       ├── TableBody.tsx          # Data rows + actions
│       ├── Filters.tsx            # Dynamic filter UI
│       └── Pagination.tsx         # Page navigation
├── filters/
│   ├── TextFilter.tsx             # Text input
│   ├── NumberRangeFilter.tsx      # Min/max range
│   ├── DateRangeFilter.tsx        # Date range
│   └── index.ts                   # Exports
├── ConfirmDialog.tsx              # Confirmation modal
└── index.ts                       # Main exports

src/components/ui/                # shadcn/ui components
├── table.tsx
├── button.tsx
├── input.tsx
├── select.tsx
├── dropdown-menu.tsx
├── dialog.tsx
├── skeleton.tsx
├── separator.tsx
└── alert.tsx
```

### Component Responsibilities

| Component             | Responsibility                                      |
| --------------------- | --------------------------------------------------- |
| **DataTable**         | Orchestrate all sub-components and manage data flow |
| **useDataTable**      | Manage filter state, pagination, and sorting        |
| **Filters**           | Render dynamic filter UI and handle Apply/Reset     |
| **TableHeader**       | Render column headers with sort indicators          |
| **TableBody**         | Render data rows with optional actions              |
| **Pagination**        | Render page navigation and size selector            |
| **ConfirmDialog**     | Render confirmation dialogs for destructive actions |
| **Filter Components** | Individual filter inputs (Text, Number, Date)       |

---

## How It Works

### Data Flow Architecture

```
Parent Component (e.g., Orders Page)
    ↓
    ├─ State: queryParams = {page, pageSize, filters, sort}
    ├─ API: const {data, total, isLoading} = useOrders(queryParams)
    └─ Render: <DataTable {...props} onChange={setQueryParams} />
        ↓
    DataTable Component
        ├─ Hook: useDataTable(queryParams, onChange)
        │   └─ Manages: filters (local), pagination, sorting
        │
        ├─ Renders:
        │   ├─ Filters
        │   │   └─ Local state (not submitted)
        │   │   └─ Apply button → onChange(newQueryParams)
        │   │
        │   ├─ TableHeader (columns + sort)
        │   │   └─ Click → onChange(newSort)
        │   │
        │   ├─ TableBody (rows + actions)
        │   │   └─ Row click → optional handler
        │   │
        │   └─ Pagination
        │       └─ Click → onChange(newPage/pageSize)
        │
        └─ onChange Callback
            └─ Parent updates state
            └─ API call triggered
            └─ New data flows back
```

### Filter Execution Flow

**Why manual Apply button?**

Prevents excessive API calls. Filters are stored in local state until explicitly applied.

#### Step-by-step:

1. **User types** in filter input
2. **Local state updated** (via `filterValues` in hook)
3. **No API call** triggered yet
4. **User clicks "Apply Filters"**
5. **onChange called** with converted filters
6. **Parent updates** queryParams state
7. **API called** with new filters
8. **DataTable re-renders** with new data

---

## Usage Guide

### Step 1: Define Column Types

```typescript
// features/orders/types/Order.ts
export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: Date;
  email: string;
}
```

### Step 2: Define Columns

```typescript
// features/orders/config/columns.ts
import type { Column } from "@/shared/components/common";
import type { Order } from "../types/Order";
import { Badge } from "@/components/ui/badge";

export const orderColumns: Column<Order>[] = [
  {
    key: "orderNumber",
    header: "Order #",
    sortable: true,
  },
  {
    key: "customerName",
    header: "Customer",
    sortable: true,
  },
  {
    key: "email",
    header: "Email",
    sortable: false,
  },
  {
    key: "totalAmount",
    header: "Total",
    sortable: true,
    render: (order) => (
      <span className="font-mono font-semibold">
        ${order.totalAmount.toFixed(2)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (order) => {
      const statusConfig = {
        pending: { className: "bg-yellow-100 text-yellow-800", label: "Pending" },
        completed: { className: "bg-green-100 text-green-800", label: "Completed" },
        cancelled: { className: "bg-red-100 text-red-800", label: "Cancelled" },
      };
      const config = statusConfig[order.status];
      return <Badge className={config.className}>{config.label}</Badge>;
    },
  },
  {
    key: "createdAt",
    header: "Created",
    sortable: true,
    render: (order) => new Date(order.createdAt).toLocaleDateString(),
  },
  {
    key: "actions",
    header: "Actions",
  },
];
```

### Step 3: Define Filters

```typescript
// features/orders/config/filters.ts
import type { FilterConfig } from "@/shared/components/common";

export const orderFilters: FilterConfig[] = [
  {
    field: "customerName",
    label: "Customer Name",
    type: "text",
    operator: "contains",
    placeholder: "Search by customer name...",
  },
  {
    field: "email",
    label: "Email",
    type: "text",
    operator: "contains",
  },
  {
    field: "totalAmount",
    label: "Order Amount",
    type: "number-range",
    min: 0,
    max: 100000,
  },
  {
    field: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Pending", value: "pending" },
      { label: "Completed", value: "completed" },
      { label: "Cancelled", value: "cancelled" },
    ],
  },
  {
    field: "createdAt",
    label: "Created Date",
    type: "date-range",
  },
];
```

### Step 4: Create Data Fetching Hook

```typescript
// features/orders/hooks/useOrders.ts
import { useState, useEffect } from "react";
import type {
  QueryParams,
  PaginatedResponse,
} from "@/shared/components/common";
import type { Order } from "../types/Order";

export function useOrders(queryParams: QueryParams) {
  const [state, setState] = useState<{
    data: Order[];
    total: number;
    isLoading: boolean;
    error: string | null;
  }>({
    data: [],
    total: 0,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Build query string from QueryParams
        const params = new URLSearchParams({
          page: String(queryParams.page),
          pageSize: String(queryParams.pageSize),
        });

        // Add filters
        if (queryParams.filters.length > 0) {
          params.append("filters", JSON.stringify(queryParams.filters));
        }

        // Add sort
        if (queryParams.sort) {
          params.append("sort", JSON.stringify(queryParams.sort));
        }

        const response = await fetch(`/api/orders?${params}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: PaginatedResponse<Order> = await response.json();

        setState({
          data: result.data,
          total: result.total,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch orders",
        }));
      }
    };

    fetchOrders();
  }, [queryParams]);

  return state;
}
```

### Step 5: Use in Page Component

```typescript
// features/orders/pages/OrdersPage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DataTable,
  type QueryParams,
  ConfirmDialog,
} from "@/shared/components/common";
import { useOrders } from "../hooks/useOrders";
import { orderColumns, orderFilters } from "../config";
import type { Order } from "../types/Order";

export default function OrdersPage() {
  const router = useRouter();
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    pageSize: 10,
    filters: [],
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    order: Order | null;
    isLoading: boolean;
  }>({
    open: false,
    order: null,
    isLoading: false,
  });

  const { data, total, isLoading, error } = useOrders(queryParams);

  const handleDelete = async (order: Order) => {
    setDeleteConfirm({ open: true, order, isLoading: false });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.order) return;

    setDeleteConfirm((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch(`/api/orders/${deleteConfirm.order.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      // Refresh current page
      setQueryParams((prev) => ({ ...prev }));
      setDeleteConfirm({ open: false, order: null, isLoading: false });
    } catch (error) {
      console.error("Delete error:", error);
      setDeleteConfirm((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">
          Manage and view all customer orders
        </p>
      </div>

      <DataTable
        columns={orderColumns}
        filters={orderFilters}
        data={data}
        total={total}
        page={queryParams.page}
        pageSize={queryParams.pageSize}
        queryParams={queryParams}
        onChange={setQueryParams}
        isLoading={isLoading}
        error={error}
        rowActions={[
          {
            label: "View Details",
            onClick: (order) => {
              router.push(`/orders/${order.id}`);
            },
          },
          {
            label: "Edit",
            onClick: (order) => {
              router.push(`/orders/${order.id}/edit`);
            },
          },
          {
            label: "Delete",
            onClick: handleDelete,
            variant: "destructive",
          },
        ]}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        title="Delete Order"
        description={`Are you sure you want to delete order #${deleteConfirm.order?.orderNumber}? This action cannot be undone.`}
        actionLabel="Delete"
        actionVariant="destructive"
        cancelLabel="Cancel"
        open={deleteConfirm.open}
        onOpenChange={(open) =>
          setDeleteConfirm((prev) => ({ ...prev, open }))
        }
        onConfirm={confirmDelete}
        isLoading={deleteConfirm.isLoading}
      />
    </div>
  );
}
```

---

## QueryParams Explanation

### Interface Definition

```typescript
interface QueryParams {
  page: number; // 1-indexed page number
  pageSize: number; // Items per page (10, 25, 50, etc.)
  filters: Filter[]; // Applied filters
  sort?: SortConfig; // Optional sort config
}

interface Filter {
  field: string; // Which field to filter
  operator: FilterOperator; // How to filter (contains, equals, etc.)
  value: any; // Filter value(s)
}

interface SortConfig {
  field: string; // Which field to sort by
  direction: "asc" | "desc"; // Sort direction
}
```

### Example QueryParams Values

```typescript
// Basic pagination
{
  page: 1,
  pageSize: 10,
  filters: []
}

// With filters
{
  page: 1,
  pageSize: 10,
  filters: [
    { field: "customerName", operator: "contains", value: "John" },
    { field: "totalAmount", operator: "between", value: { min: 100, max: 1000 } }
  ]
}

// With sorting
{
  page: 2,
  pageSize: 25,
  filters: [
    { field: "status", operator: "equals", value: "completed" }
  ],
  sort: {
    field: "createdAt",
    direction: "desc"
  }
}
```

### Backend Implementation

The backend receives QueryParams via URL search parameters:

```
GET /api/orders?page=1&pageSize=10&filters=[...filters...]&sort={...sort...}
```

**Handle pagination:**

```typescript
const skip = (page - 1) * pageSize;
const take = pageSize;

const orders = await db.orders.findMany({
  skip,
  take,
  // ...
});
```

**Handle filters:**

```typescript
const where: any = {};

filters.forEach(({ field, operator, value }) => {
  switch (operator) {
    case "contains":
      where[field] = { contains: value, mode: "insensitive" };
      break;
    case "equals":
      where[field] = value;
      break;
    case "between":
      where[field] = { gte: value.min, lte: value.max };
      break;
    case "gt":
      where[field] = { gt: value };
      break;
    case "gte":
      where[field] = { gte: value };
      break;
    case "lt":
      where[field] = { lt: value };
      break;
    case "lte":
      where[field] = { lte: value };
      break;
  }
});
```

**Handle sorting:**

```typescript
const orderBy = sort ? { [sort.field]: sort.direction } : undefined;
```

**Return PaginatedResponse:**

```typescript
const response: PaginatedResponse<Order> = {
  data: orders,
  total: totalCount,
  page,
  pageSize,
  totalPages: Math.ceil(totalCount / pageSize),
};
```

---

## Extensibility

### Adding a Custom Filter Type

1. **Create filter component:**

```typescript
// shared/components/common/filters/CustomFilter.tsx
import React from "react";

interface CustomFilterProps {
  field: string;
  label: string;
  value?: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  // ... custom props
}

export const CustomFilter = React.forwardRef<HTMLDivElement, CustomFilterProps>(
  ({ field, label, value, onChange, disabled }, ref) => {
    return (
      <div ref={ref}>
        {/* Your custom filter UI */}
      </div>
    );
  }
);
```

2. **Update FilterConfig type:**

```typescript
// DataTable/types.ts
export interface FilterConfig {
  type:
    | "text"
    | "number-range"
    | "date-range"
    | "select"
    | "multi-select"
    | "custom";
  // ...
}
```

3. **Render in Filters component:**

```typescript
// DataTable/components/Filters.tsx
case "custom":
  return (
    <CustomFilter
      field={config.field}
      label={config.label}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
```

### Custom Column Rendering

Use the `render` function for complex cell content:

```typescript
const columns: Column[] = [
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "actions",
    header: "Actions",
    render: (row) => (
      <div className="flex gap-2">
        <Button variant="outline" size="sm">Edit</Button>
        <Button variant="destructive" size="sm">Delete</Button>
      </div>
    ),
  },
];
```

### Extending Row Actions

Define custom actions in the page component:

```typescript
<DataTable
  rowActions={[
    { label: "View", onClick: (row) => view(row) },
    { label: "Edit", onClick: (row) => edit(row) },
    { label: "Export", onClick: (row) => export(row), variant: "secondary" },
    { label: "Delete", onClick: (row) => delete(row), variant: "destructive" },
  ]}
/>
```

### Enabling Row Selection

```typescript
<DataTable
  enableRowSelection={true}
  selectedRows={selectedIds}
  onRowSelectionChange={setSelectedIds}
/>
```

---

## Important Notes

### ⚠️ No API Calls Inside DataTable

The DataTable **never** calls APIs. All data fetching is in the parent component.

❌ **WRONG:**

```typescript
function DataTable() {
  useEffect(() => {
    fetch(`/api/data?page=${page}`).then(...)
  }, [page]);
}
```

✅ **RIGHT:**

```typescript
function OrdersPage() {
  const [queryParams, setQueryParams] = useState(...);
  const { data } = useOrders(queryParams); // API call here

  return <DataTable data={data} onChange={setQueryParams} />;
}
```

### ✅ Controlled Component Pattern

All state changes flow through the `onChange` callback:

```typescript
onChange({
  page: 2,                    // User changed page
  pageSize: 10,
  filters: [...],
  sort: { field: "name", direction: "asc" }
});
```

### ✅ Server-Side Pagination Only

DataTable supports **server-side pagination only**, ensuring:

- Scalability with large datasets
- Proper filtering on complete dataset
- Database handles sorting

### ✅ TypeScript Safety

Full type coverage with generics:

```typescript
const columns: Column<Order>[] = [...]; // ensures row properties exist
const filters: FilterConfig[] = [...];  // ensures fields are valid
const onChange = (query: QueryParams) => {...}; // strict typing
```

---

## Backend Implementation Example

### API Route

```typescript
// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import type {
  QueryParams,
  PaginatedResponse,
} from "@/shared/components/common";
import type { Order } from "@/features/orders/types/Order";

export async function GET(request: NextRequest) {
  try {
    // Parse QueryParams from URL
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const filtersStr = searchParams.get("filters");
    const sortStr = searchParams.get("sort");

    const filters = filtersStr ? JSON.parse(filtersStr) : [];
    const sort = sortStr ? JSON.parse(sortStr) : null;

    // Build where clause
    const where: any = {};
    filters.forEach(({ field, operator, value }: any) => {
      switch (operator) {
        case "contains":
          where[field] = { contains: value, mode: "insensitive" };
          break;
        case "equals":
          where[field] = value;
          break;
        case "between":
          where[field] = { gte: value.min, lte: value.max };
          break;
        // ... more operators
      }
    });

    // Query database
    const orders = await db.orders.findMany({
      where,
      orderBy: sort ? { [sort.field]: sort.direction } : undefined,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const total = await db.orders.count({ where });

    const response: PaginatedResponse<Order> = {
      data: orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
```

---

## Summary

The DataTable system is a **production-ready, fully generic component** that:

- Uses **100% shadcn/ui components** for a professional look
- Remains **feature-agnostic** through controlled patterns
- Provides **complete TypeScript safety**
- Enforces **separation of concerns** (UI vs API)
- Eliminates **code duplication** across features
- Supports **enterprise features** (pagination, sorting, filtering)

**Happy building! 🚀**
