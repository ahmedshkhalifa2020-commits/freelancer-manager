/**
 * DataTable Quick Reference & Copy-Paste Examples
 * 
 * Use these as templates for implementing DataTable in your features
 */

// ============================================================
// PATTERN 1: Basic DataTable Setup
// ============================================================

/**
 * features/users/types/User.ts
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "active" | "inactive";
  createdAt: Date;
}

/**
 * features/users/config/columns.ts
 */
import type { Column } from "@/shared/components/common";
import type { User } from "../types/User";
import { Badge } from "@/components/ui/badge";

export const userColumns: Column<User>[] = [
  {
    key: "firstName",
    header: "First Name",
    sortable: true,
  },
  {
    key: "lastName",
    header: "Last Name",
    sortable: true,
  },
  {
    key: "email",
    header: "Email",
    sortable: true,
  },
  {
    key: "status",
    header: "Status",
    render: (user) => (
      <Badge variant={user.status === "active" ? "default" : "secondary"}>
        {user.status}
      </Badge>
    ),
  },
  {
    key: "createdAt",
    header: "Created",
    sortable: true,
    render: (user) => new Date(user.createdAt).toLocaleDateString(),
  },
];

/**
 * features/users/config/filters.ts
 */
import type { FilterConfig } from "@/shared/components/common";

export const userFilters: FilterConfig[] = [
  {
    field: "firstName",
    label: "First Name",
    type: "text",
    operator: "contains",
  },
  {
    field: "email",
    label: "Email",
    type: "text",
  },
  {
    field: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
];

/**
 * features/users/hooks/useUsers.ts
 */
import { useState, useEffect } from "react";
import type { QueryParams, PaginatedResponse } from "@/shared/components/common";
import type { User } from "../types/User";

export function useUsers(queryParams: QueryParams) {
  const [state, setState] = useState<{
    data: User[];
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
    const fetchUsers = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const params = new URLSearchParams({
          page: String(queryParams.page),
          pageSize: String(queryParams.pageSize),
        });

        if (queryParams.filters.length > 0) {
          params.append("filters", JSON.stringify(queryParams.filters));
        }

        if (queryParams.sort) {
          params.append("sort", JSON.stringify(queryParams.sort));
        }

        const response = await fetch(`/api/users?${params}`);
        const result: PaginatedResponse<User> = await response.json();

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
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    };

    fetchUsers();
  }, [queryParams]);

  return state;
}

/**
 * features/users/pages/UsersPage.tsx
 */
"use client";

import { useState } from "react";
import {
  DataTable,
  type QueryParams,
  ConfirmDialog,
} from "@/shared/components/common";
import { useUsers } from "../hooks/useUsers";
import { userColumns, userFilters } from "../config";
import type { User } from "../types/User";

export default function UsersPage() {
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    pageSize: 10,
    filters: [],
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    user: User | null;
    isLoading: boolean;
  }>({
    open: false,
    user: null,
    isLoading: false,
  });

  const { data, total, isLoading, error } = useUsers(queryParams);

  const handleDelete = (user: User) => {
    setDeleteConfirm({ open: true, user, isLoading: false });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.user) return;

    setDeleteConfirm((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch(`/api/users/${deleteConfirm.user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      // Refresh
      setQueryParams((prev) => ({ ...prev }));
      setDeleteConfirm({ open: false, user: null, isLoading: false });
    } catch (error) {
      console.error("Delete error:", error);
      setDeleteConfirm((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage application users</p>
      </div>

      <DataTable
        columns={userColumns}
        filters={userFilters}
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
            label: "Edit",
            onClick: (user) => {
              console.log("Edit user:", user.id);
            },
          },
          {
            label: "Delete",
            onClick: handleDelete,
            variant: "destructive",
          },
        ]}
      />

      <ConfirmDialog
        title="Delete User"
        description={`Delete ${deleteConfirm.user?.firstName} ${deleteConfirm.user?.lastName}?`}
        actionLabel="Delete"
        actionVariant="destructive"
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm((p) => ({ ...p, open }))}
        onConfirm={confirmDelete}
        isLoading={deleteConfirm.isLoading}
      />
    </div>
  );
}

// ============================================================
// PATTERN 2: With Row Selection
// ============================================================

export function UsersPageWithSelection() {
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 1,
    pageSize: 10,
    filters: [],
  });

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const { data, total, isLoading, error } = useUsers(queryParams);

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    console.log("Delete:", selectedRows);
    setSelectedRows([]);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        {selectedRows.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete {selectedRows.length} user(s)
          </button>
        )}
      </div>

      <DataTable
        columns={userColumns}
        filters={userFilters}
        data={data}
        total={total}
        page={queryParams.page}
        pageSize={queryParams.pageSize}
        queryParams={queryParams}
        onChange={setQueryParams}
        isLoading={isLoading}
        error={error}
        enableRowSelection={true}
        selectedRows={selectedRows}
        onRowSelectionChange={setSelectedRows}
      />
    </div>
  );
}

// ============================================================
// PATTERN 3: Custom Column Rendering
// ============================================================

const advancedColumns: Column<User>[] = [
  {
    key: "firstName",
    header: "Name",
    sortable: true,
    render: (user) => (
      <div className="font-semibold">
        {user.firstName} {user.lastName}
      </div>
    ),
  },
  {
    key: "email",
    header: "Email",
    sortable: true,
    render: (user) => (
      <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">
        {user.email}
      </a>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (user) => (
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            user.status === "active" ? "bg-green-500" : "bg-gray-400"
          }`}
        />
        <span className={user.status === "active" ? "text-green-700" : "text-gray-700"}>
          {user.status === "active" ? "Active" : "Inactive"}
        </span>
      </div>
    ),
  },
];

// ============================================================
// PATTERN 4: Error Handling & Loading States
// ============================================================

function CustomErrorDisplay({ error }: { error: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h3 className="font-semibold text-red-900">Error Loading Data</h3>
      <p className="text-red-700 mt-1">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  );
}

// ============================================================
// KEY CONCEPTS
// ============================================================

/**
 * CONTROLLED COMPONENT PATTERN
 * 
 * The DataTable is fully controlled via props:
 * 
 * State ownership: Parent component
 * Data source: Parent's API hook
 * Event handling: onChange callback
 * Re-rendering: Parent state updates
 * 
 * This ensures:
 * - Single source of truth
 * - Predictable data flow
 * - Easy to debug
 * - Parent has full control
 */

/**
 * FILTER EXECUTION FLOW
 * 
 * Local State (NOT submitted):
 *   User types → filterValues updated → No API call
 * 
 * Manual Apply:
 *   User clicks "Apply" → onChange triggered → Parent updates state → API called
 * 
 * Benefits:
 *   - Prevents excessive API calls
 *   - Better UX
 *   - User controls when filtering happens
 */

/**
 * QUERYPARAMS STRUCTURE
 * 
 * {
 *   page: 1,              // Current page (1-indexed)
 *   pageSize: 10,         // Items per page
 *   filters: [            // Applied filters
 *     {
 *       field: "name",
 *       operator: "contains",
 *       value: "John"
 *     }
 *   ],
 *   sort: {               // Current sort
 *     field: "createdAt",
 *     direction: "desc"
 *   }
 * }
 */

/**
 * FILTER OPERATORS
 * 
 * "contains"    - String contains (case-insensitive)
 * "equals"      - Exact match
 * "gt"          - Greater than
 * "gte"         - Greater than or equal
 * "lt"          - Less than
 * "lte"         - Less than or equal
 * "between"     - Range (min/max)
 * "in"          - One of many values
 */

// ============================================================
// BACKEND API EXAMPLE
// ============================================================

/**
 * app/api/users/route.ts
 */
/*
import { NextRequest, NextResponse } from "next/server";
import type { PaginatedResponse } from "@/shared/components/common";
import type { User } from "@/features/users/types/User";

export async function GET(request: NextRequest) {
  try {
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
      }
    });

    // Query database
    const users = await db.user.findMany({
      where,
      orderBy: sort ? { [sort.field]: sort.direction } : undefined,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const total = await db.user.count({ where });

    const response: PaginatedResponse<User> = {
      data: users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
*/

// ============================================================
// BEST PRACTICES
// ============================================================

/**
 * ✅ DO:
 * 
 * 1. Keep API calls in parent component
 * 2. Use onChange callback to update state
 * 3. Store queryParams in parent state
 * 4. Define columns with render functions
 * 5. Use TypeScript for type safety
 * 6. Handle loading and error states
 * 7. Group related config (columns, filters)
 */

/**
 * ❌ DON'T:
 * 
 * 1. Make API calls inside DataTable
 * 2. Update queryParams directly inside DataTable
 * 3. Store data in DataTable state
 * 4. Create feature-specific DataTable versions
 * 5. Mix business logic with DataTable
 * 6. Ignore TypeScript types
 * 7. Trigger filters on every keystroke
 */

export {};
