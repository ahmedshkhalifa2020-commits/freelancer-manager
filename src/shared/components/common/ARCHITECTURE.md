# DataTable System Architecture Overview

## 📁 Complete Folder Structure

```
src/
├── shared/
│   └── components/
│       └── common/
│           ├── index.ts                          # Main barrel export
│           │
│           ├── DataTable/
│           │   ├── DataTable.tsx                 # Main orchestrator component
│           │   ├── DataTable.md                  # Full documentation
│           │   ├── index.ts                      # DataTable exports
│           │   ├── types.ts                      # Type definitions
│           │   │
│           │   ├── hooks/
│           │   │   └── useDataTable.ts           # Filter/pagination state
│           │   │
│           │   └── components/
│           │       ├── TableHeader.tsx           # Column headers + sort
│           │       ├── TableBody.tsx             # Rows + actions menu
│           │       ├── Filters.tsx               # Dynamic filter UI
│           │       └── Pagination.tsx            # Page navigation
│           │
│           ├── filters/
│           │   ├── index.ts                      # Filters exports
│           │   ├── TextFilter.tsx                # Text input filter
│           │   ├── NumberRangeFilter.tsx         # Number range filter
│           │   └── DateRangeFilter.tsx           # Date range filter
│           │
│           └── ConfirmDialog.tsx                 # Delete confirmation dialog
│
└── components/ui/                               # shadcn/ui components
    ├── table.tsx                                 # Table primitives
    ├── button.tsx                                # Button component
    ├── input.tsx                                 # Input field
    ├── select.tsx                                # Select dropdown
    ├── dropdown-menu.tsx                         # Dropdown menu
    ├── dialog.tsx                                # Modal dialog
    ├── skeleton.tsx                              # Loading placeholder
    ├── separator.tsx                             # Visual divider
    ├── alert.tsx                                 # Alert message
    └── ...
```

## 🔄 Component Dependency Tree

```
DataTable.tsx (Main)
├── useDataTable (hook)
│   └── manages filterValues, pagination, sorting handlers
│
├── Filters.tsx
│   ├── TextFilter.tsx
│   ├── NumberRangeFilter.tsx
│   ├── DateRangeFilter.tsx
│   └── shadcn/ui (Button, Select)
│
├── TableHeader.tsx
│   └── shadcn/ui (Table, TableHead)
│
├── TableBody.tsx
│   ├── ActionsMenu
│   │   └── shadcn/ui (DropdownMenu)
│   └── shadcn/ui (Table, Skeleton)
│
├── Pagination.tsx
│   └── shadcn/ui (Button, Select)
│
└── shadcn/ui (Table, Alert)
```

## 💾 State Management Flow

```
Parent Component (Page)
    ↓ owns: queryParams state
    ├─ UI triggers event (page change, filter apply, sort click)
    ↓ onChange callback
DataTable Component
    ├─ useDataTable hook
    │   └─ Manages local filter state (not submitted)
    │
    └─ onChange(newQueryParams)
        ↓ propagates to parent
Parent Component
    ├─ Updates queryParams state
    ├─ API call triggered
    ├─ New data received
    ↓ re-renders DataTable with new data
```

## 📊 File Descriptions

### Core Components

| File                | Purpose                            | Key Exports                 |
| ------------------- | ---------------------------------- | --------------------------- |
| **DataTable.tsx**   | Main orchestrator component        | `DataTable`, `useDataTable` |
| **useDataTable.ts** | State hook for filters/pagination  | `useDataTable` hook         |
| **Filters.tsx**     | Dynamic filter rendering component | `Filters` component         |
| **TableHeader.tsx** | Table header with sortable columns | `TableHeader` component     |
| **TableBody.tsx**   | Table body with rows and actions   | `TableBody` component       |
| **Pagination.tsx**  | Page navigation and size selector  | `Pagination` component      |

### Filter Components

| File                      | Purpose               | Props                                               |
| ------------------------- | --------------------- | --------------------------------------------------- |
| **TextFilter.tsx**        | Text input filter     | `field`, `label`, `value`, `onChange`               |
| **NumberRangeFilter.tsx** | Min/max number filter | `field`, `label`, `value`, `min`, `max`, `onChange` |
| **DateRangeFilter.tsx**   | Date range filter     | `field`, `label`, `value`, `min`, `max`, `onChange` |

### Types & Exports

| File             | Purpose                             |
| ---------------- | ----------------------------------- |
| **types.ts**     | All TypeScript interfaces and types |
| **index.ts**     | Public API exports                  |
| **DataTable.md** | Complete documentation              |

## 🎯 Design Patterns Used

### 1. **Controlled Component Pattern**

All state lives in parent component:

```
Parent State (source of truth)
    ↓ down
DataTable Props
    ↓ user interaction
DataTable onChange Callback
    ↓ up
Parent Updates State
```

### 2. **Composition Pattern**

DataTable is composed of smaller components:

- Each component has single responsibility
- Components are reusable
- Easy to test and maintain

### 3. **Hook Pattern**

`useDataTable` for state management:

- Separates logic from UI
- Easy to test
- Reusable across components

### 4. **Props Drilling (Intentional)**

Props flow down explicitly:

- Makes data flow clear
- Easier to debug
- No global state

## 🚀 Key Architectural Decisions

### ✅ Server-Side Only Pagination

**Why:** Scalability with large datasets

- Database handles filtering/sorting
- Only requested data is fetched
- No client-side memory issues

### ✅ Manual Apply Filters

**Why:** Prevents excessive API calls

- Filters in local state until Apply
- User controls when API is called
- Better UX with fewer requests

### ✅ No API Calls Inside DataTable

**Why:** Separation of concerns

- DataTable = display logic only
- Parent = data fetching logic
- Testable independently

### ✅ 100% Controlled Component

**Why:** Predictable behavior

- Single source of truth in parent
- No hidden state in DataTable
- Full flexibility for parent

### ✅ shadcn/ui Components

**Why:** Enterprise-grade, accessible, consistent

- Built on Radix primitives
- Full customization
- Dark mode support
- Accessible by default

## 📦 Usage Patterns

### Basic Import

```typescript
import { DataTable, type QueryParams } from "@/shared/components/common";
```

### In Feature

```typescript
import {
  DataTable,
  useDataTable,
  type Column,
  type FilterConfig,
  type QueryParams,
  type PaginatedResponse,
} from "@/shared/components/common";
```

### Type Guards

```typescript
// Narrow types for your feature
type OrderColumn = Column<Order>;
type OrderFilter = FilterConfig;
type OrderResponse = PaginatedResponse<Order>;
```

## 🔧 Extension Points

### Add New Filter Type

1. Create component in `filters/`
2. Update `FilterConfig.type` union
3. Add case in `Filters.tsx` render

### Customize Columns

1. Define `Column<T>` array
2. Use `render` function for custom cells
3. Set `sortable=true` for sortable columns

### Add Row Actions

1. Define action handlers in page
2. Pass `rowActions` prop
3. Actions appear in dropdown menu

### Change Loading State

1. Pass `isLoading` prop
2. Pass `renderLoading` for custom loading UI
3. Skeletons show by default

## 📋 Type System

```typescript
// Main interfaces
QueryParams; // page, pageSize, filters, sort
Column<T>; // Column definition with render
FilterConfig; // Filter UI configuration
PaginatedResponse<T>; // API response shape
DataTableProps<T>; // DataTable component props

// Sub-component interfaces
FiltersProps; // Filters component props
PaginationProps; // Pagination component props
TableHeaderProps; // TableHeader component props
TableBodyProps; // TableBody component props
ConfirmDialogProps; // ConfirmDialog component props

// Utility types
Filter; // Single filter
SortConfig; // Sort configuration
FilterOperator; // Filter operator type
```

## 🔍 Debugging

### Check URL Parameters

```typescript
// In browser console
const params = new URLSearchParams(window.location.search);
console.log(params.get("filters"));
console.log(params.get("sort"));
```

### Trace Data Flow

1. User action in DataTable UI
2. Handler in component calls callback
3. Callback reaches `onChange` prop
4. Parent updates state
5. New data fetched
6. DataTable re-renders

### Common Issues

| Issue                                  | Solution                                                   |
| -------------------------------------- | ---------------------------------------------------------- |
| Filters trigger API on every keystroke | You're calling onChange on input change - use Apply button |
| DataTable doesn't update               | Parent state not updating - check onChange                 |
| Sort doesn't work                      | Column not marked `sortable: true`                         |
| Actions not showing                    | `rowActions` prop not passed or empty                      |
| Loading forever                        | Check API response format against `PaginatedResponse`      |

---

## Summary

The DataTable system is built on:

✅ **Clear separation of concerns** (UI vs API)  
✅ **Controlled component pattern** (parent owns state)  
✅ **Composition** (reusable sub-components)  
✅ **TypeScript** (full type safety)  
✅ **shadcn/ui** (professional UI components)  
✅ **Server-side pagination** (scalability)  
✅ **Plugin architecture** (easy to extend)

**Result:** A production-ready, maintainable, scalable DataTable for any feature.
