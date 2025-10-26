import { useMemo } from "react";

type AccessorFn<TData> = (row: TData) => unknown;

type SortingFn = "alphanumeric" | "datetime" | "basic";

export type SortingState = Array<{ id: string; desc: boolean }>;

export interface ColumnDef<TData> {
  id: string;
  header?: () => React.ReactNode;
  cell: (context: CellContext<TData>) => React.ReactNode;
  sortingFn?: SortingFn;
  accessorFn: AccessorFn<TData>;
}

export interface ColumnHelper<TData> {
  accessor: <TValue>(
    accessor: keyof TData | AccessorFn<TData>,
    column: {
      id?: string;
      header?: () => React.ReactNode;
      cell: (context: CellContext<TData>) => React.ReactNode;
      sortingFn?: SortingFn;
    },
  ) => ColumnDef<TData>;
}

export interface TableOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  state?: { sorting?: SortingState };
}

export interface CellContext<TData> {
  table: Table<TData>;
  row: Row<TData>;
  column: ColumnDef<TData>;
  getValue: () => unknown;
}

export interface Cell<TData> {
  id: string;
  column: ColumnDef<TData>;
  row: Row<TData>;
  getValue: () => unknown;
  getContext: () => CellContext<TData>;
}

export interface Row<TData> {
  id: string;
  index: number;
  original: TData;
  getVisibleCells: () => Cell<TData>[];
}

export interface Table<TData> {
  getRowModel: () => { rows: Row<TData>[] };
  getState: () => { sorting: SortingState };
  setSorting: (updater: SortingState | ((prev: SortingState) => SortingState)) => void;
}

let columnIndex = 0;

export const createColumnHelper = <TData,>(): ColumnHelper<TData> => ({
  accessor(accessor, column) {
    const resolvedAccessor: AccessorFn<TData> =
      typeof accessor === "function" ? accessor : (row) => (row as Record<string, unknown>)[accessor as string];

    return {
      id: column.id ?? `${typeof accessor === "string" ? accessor : "col"}_${columnIndex++}`,
      header: column.header,
      cell: column.cell,
      sortingFn: column.sortingFn,
      accessorFn: resolvedAccessor,
    };
  },
});

const getComparator = (sortingFn: SortingFn | undefined) => {
  switch (sortingFn) {
    case "datetime":
      return (a: unknown, b: unknown) => new Date(a as string).getTime() - new Date(b as string).getTime();
    case "alphanumeric":
      return (a: unknown, b: unknown) => String(a ?? "").localeCompare(String(b ?? ""), "fr");
    case "basic":
    default:
      return (a: unknown, b: unknown) => {
        const numberA = Number(a);
        const numberB = Number(b);
        if (Number.isNaN(numberA) || Number.isNaN(numberB)) {
          return String(a ?? "").localeCompare(String(b ?? ""), "fr");
        }

        return numberA - numberB;
      };
  }
};

export const useReactTable = <TData,>({ data, columns, state }: TableOptions<TData>): Table<TData> => {
  const sortingState = state?.sorting ?? [];

  const sortedRows = useMemo(() => {
    if (!sortingState.length) {
      return data;
    }

    const [{ id, desc }] = sortingState;
    const targetColumn = columns.find((column) => column.id === id);

    if (!targetColumn) {
      return data;
    }

    const comparator = getComparator(targetColumn.sortingFn);
    const sorted = [...data].sort((a, b) => comparator(targetColumn.accessorFn(a), targetColumn.accessorFn(b)));
    return desc ? sorted.reverse() : sorted;
  }, [columns, data, sortingState]);

  const tableRef: { current: Table<TData> | null } = { current: null };

  const rows = useMemo<Row<TData>[]>(() => {
    return sortedRows.map((original, index) => {
      const rowId = `row_${index}`;
      let cachedCells: Cell<TData>[] | undefined;

      const row: Row<TData> = {
        id: rowId,
        index,
        original,
        getVisibleCells: () => {
          if (!cachedCells) {
            cachedCells = columns.map((column) => {
              const cellId = `${rowId}_${column.id}`;
              return {
                id: cellId,
                column,
                row,
                getValue: () => column.accessorFn(original),
                getContext: () => ({
                  table: tableRef.current!,
                  column,
                  row,
                  getValue: () => column.accessorFn(original),
                }),
              } satisfies Cell<TData>;
            });
          }

          return cachedCells;
        },
      };

      return row;
    });
  }, [columns, sortedRows, tableRef]);

  const table: Table<TData> = {
    getRowModel: () => ({ rows }),
    getState: () => ({ sorting: sortingState }),
    setSorting: () => undefined,
  };

  tableRef.current = table;

  return table;
};

export const flexRender = (
  component: React.ReactNode | ((context: CellContext<unknown>) => React.ReactNode),
  context: CellContext<unknown>,
) => {
  return typeof component === "function" ? (component as (ctx: CellContext<unknown>) => React.ReactNode)(context) : component;
};
