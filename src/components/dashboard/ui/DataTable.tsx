import { type ReactNode, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import EmptyState, { type EmptyStateProps } from "./EmptyState";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  sortAccessor?: (item: T) => string | number | Date | null;
  ariaLabel?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Array<DataTableColumn<T>>;
  caption?: string;
  isLoading?: boolean;
  emptyState?: EmptyStateProps;
  pageSize?: number;
  initialSortKey?: string;
  initialSortDirection?: "asc" | "desc";
  getRowId?: (item: T, index: number) => string;
}

type SortDirection = "asc" | "desc";

const toComparable = (value: unknown): number | string => {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return value.toLowerCase();
  }
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }
  if (value == null) {
    return "";
  }
  return String(value).toLowerCase();
};

const DataTable = <T,>({
  data,
  columns,
  caption,
  isLoading = false,
  emptyState,
  pageSize = 8,
  initialSortKey,
  initialSortDirection = "asc",
  getRowId,
}: DataTableProps<T>) => {
  const [sortKey, setSortKey] = useState<string | null>(initialSortKey ?? null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [data.length, sortKey, sortDirection, pageSize]);

  const sortedData = useMemo(() => {
    if (!sortKey) {
      return [...data];
    }

    const column = columns.find((col) => String(col.key) === sortKey);
    if (!column) {
      return [...data];
    }

    const accessor = column.sortAccessor ?? ((item: T) => (item as Record<string, unknown>)[sortKey!]);

    return [...data].sort((a, b) => {
      const aValue = toComparable(accessor(a));
      const bValue = toComparable(accessor(b));

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [columns, data, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = sortedData.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;

    setSortKey((previous) => {
      if (previous !== key) {
        setSortDirection("asc");
        return key;
      }
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return previous;
    });
  };

  const gotoPage = (next: number) => {
    setPage(Math.max(0, Math.min(totalPages - 1, next)));
  };

  const showEmpty = !isLoading && sortedData.length === 0;
  const columnCount = columns.length;

  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] shadow-[var(--elevation-1)]">
        <table className="w-full min-w-full border-collapse" role="grid">
          {caption ? (
            <caption className="px-[var(--space-5)] py-[var(--space-4)] text-left text-sm font-medium text-[color:var(--text-secondary)]">
              {caption}
            </caption>
          ) : null}
          <thead className="bg-[color:var(--bg-subtle)] text-[color:var(--text-secondary)]">
            <tr>
              {columns.map((column) => {
                const key = String(column.key);
                const isSorted = sortKey === key;
                const ariaSort = isSorted ? (sortDirection === "asc" ? "ascending" : "descending") : "none";

                return (
                  <th
                    key={key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={cn(
                      "px-[var(--space-5)] py-[var(--space-3)] text-left text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)]",
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right",
                    )}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className="inline-flex w-full items-center justify-start gap-[var(--space-1)] text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted)] transition-colors duration-150 hover:text-[color:var(--text-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-accent)]"
                        onClick={() => handleSort(key, column.sortable)}
                        aria-label={column.ariaLabel ?? `Trier par ${column.header}`}
                      >
                        <span>{column.header}</span>
                        {isSorted ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="h-4 w-4" aria-hidden />
                          ) : (
                            <ChevronDown className="h-4 w-4" aria-hidden />
                          )
                        ) : null}
                      </button>
                    ) : (
                      <span>{column.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-[color:var(--bg-surface)] text-sm text-[color:var(--text-secondary)]">
            {isLoading ? (
              <tr>
                <td colSpan={columnCount} className="px-[var(--space-5)] py-[var(--space-6)]">
                  <div className="flex flex-col gap-[var(--space-2)]">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <span
                        key={`skeleton-${index}`}
                        className="h-4 w-full animate-pulse rounded-[var(--radius-sm)] bg-[color:var(--bg-subtle)]"
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ) : showEmpty ? (
              <tr>
                <td colSpan={columnCount} className="px-[var(--space-6)] py-[var(--space-9)]">
                  {emptyState ? (
                    <EmptyState {...emptyState} />
                  ) : (
                    <EmptyState
                      title="Aucune donnée"
                      description="Revenez plus tard pour consulter vos informations."
                    />
                  )}
                </td>
              </tr>
            ) : (
              pageItems.map((item, index) => {
                const rowId = getRowId ? getRowId(item, index) : `row-${currentPage}-${index}`;

                return (
                  <tr
                    key={rowId}
                    className="border-t border-[color:var(--border-subtle)] transition-colors duration-150 hover:bg-[color:var(--bg-subtle)] focus-within:bg-[color:var(--bg-subtle)]"
                  >
                    {columns.map((column) => {
                      const key = String(column.key);
                      const cell = column.render ? column.render(item) : (item as Record<string, ReactNode>)[key];

                      return (
                        <td
                          key={`${rowId}-${key}`}
                          className={cn(
                            "px-[var(--space-5)] py-[var(--space-4)] text-[color:var(--text-secondary)]",
                            column.align === "center" && "text-center",
                            column.align === "right" && "text-right",
                          )}
                        >
                          {cell ?? <span className="text-[color:var(--text-muted)]">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-[var(--space-3)] text-sm text-[color:var(--text-secondary)] md:flex-row md:items-center md:justify-between">
        <p role="status" aria-live="polite">
          Page {currentPage + 1} sur {totalPages} — {sortedData.length} élément{sortedData.length > 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-[var(--space-2)]">
          <button
            type="button"
            onClick={() => gotoPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="inline-flex min-h-[40px] items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--border-subtle)] px-[var(--space-3)] py-[var(--space-2)] text-sm font-medium text-[color:var(--text-secondary)] transition-colors duration-150 hover:bg-[color:var(--bg-subtle)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Précédent
          </button>
          <div className="flex items-center gap-[var(--space-1)]">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={`page-${index}`}
                type="button"
                onClick={() => gotoPage(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors duration-150",
                  index === currentPage
                    ? "bg-[color:var(--brand-primary)]"
                    : "bg-[color:var(--border-subtle)] hover:bg-[color:var(--brand-primary)]/40",
                )}
                aria-label={`Aller à la page ${index + 1}`}
                aria-current={index === currentPage ? "page" : undefined}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => gotoPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="inline-flex min-h-[40px] items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--border-subtle)] px-[var(--space-3)] py-[var(--space-2)] text-sm font-medium text-[color:var(--text-secondary)] transition-colors duration-150 hover:bg-[color:var(--bg-subtle)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
