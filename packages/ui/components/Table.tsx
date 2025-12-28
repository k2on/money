import { createContext, use, useEffect, useState, type ReactNode } from "react";
import { View, Text } from "react-native";
import { useShortcut } from "../lib/shortcuts/hooks";
import type { Key } from "../lib/shortcuts";

const HEADER_COLOR = "#7158e2";

const COLORS = {
  focused: "#ddd",
  selected: "#eaebf6",
  focused_selected: "#d5d7ef",
};

const EXTRA = 5;

export type ValidRecord = Record<
  string,
  string | number | null | undefined | unknown
>;

interface TableState {
  data: unknown[];
  columns: Column[];
  columnMap: Map<string, number>;
  idx: number;
  selectedIdx: Set<number>;
}

const INITAL_STATE = {
  data: [],
  columns: [],
  columnMap: new Map(),
  idx: 0,
  selectedIdx: new Set(),
} satisfies TableState;

export const Context = createContext<TableState>(INITAL_STATE);

export type Column = {
  name: string;
  label: string;
  render?: (i: number | string) => string;
};

function renderCell(row: ValidRecord, column: Column): string {
  const cell = row[column.name];
  if (cell == undefined) return "n/a";
  if (cell == null) return "null";
  if (column.render) return column.render(cell);
  return cell.toString();
}

interface TableShortcut<T> {
  key: Key;
  handler: (params: { selected: T[]; index: number }) => void;
}

export interface ProviderProps<T> {
  data: T[];
  columns: Column[];
  children: ReactNode;
  shortcuts?: TableShortcut<T>[];
}
export function Provider<T extends ValidRecord>({
  data,
  columns,
  children,
  shortcuts,
}: ProviderProps<T>) {
  const [idx, setIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(new Set<number>());

  useShortcut("j", () => {
    setIdx((prev) => Math.min(prev + 1, data.length - 1));
  });
  useShortcut("down", () => {
    setIdx((prev) => Math.min(prev + 1, data.length - 1));
  });
  useShortcut("k", () => {
    setIdx((prev) => Math.max(prev - 1, 0));
  });
  useShortcut("up", () => {
    setIdx((prev) => Math.max(prev - 1, 0));
  });

  useShortcut("escape", () => {
    setSelectedIdx(new Set());
  });
  useShortcut("x", () => {
    setSelectedIdx((last) => {
      const newSelected = new Set(last);
      newSelected.add(idx);
      return newSelected;
    });
  });

  useEffect(() => {
    setIdx((prev) => Math.max(Math.min(prev, data.length - 1), 0));
  }, [data]);

  if (shortcuts) {
    for (const shortcut of shortcuts) {
      useShortcut(shortcut.key, () => {
        const selected = data.filter(
          (_, index) => idx == index || selectedIdx.has(index),
        );
        shortcut.handler({ selected, index: idx });
      });
    }
  }

  const columnMap = new Map(
    columns.map((col) => {
      return [
        col.name,
        Math.max(
          col.label.length,
          ...data.map((row) => renderCell(row, col).length),
        ),
      ];
    }),
  );

  return (
    <Context.Provider value={{ data, columns, columnMap, idx, selectedIdx }}>
      {children}
    </Context.Provider>
  );
}

export function Body() {
  const { columns, data, columnMap, idx, selectedIdx } = use(Context);
  return (
    <View>
      <View style={{ backgroundColor: HEADER_COLOR, flexDirection: "row" }}>
        {columns.map((column) => (
          <Text
            key={column.name}
            style={{ fontFamily: "mono", color: "white" }}
          >
            {rpad(
              column.label,
              columnMap.get(column.name)! - column.label.length + EXTRA,
            )}
          </Text>
        ))}
      </View>
      {data.map((row, index) => {
        const isSelected = selectedIdx.has(index);
        const isFocused = index == idx;

        return (
          <View
            key={index}
            style={{
              backgroundColor:
                isSelected && isFocused
                  ? COLORS.focused_selected
                  : isFocused
                    ? COLORS.focused
                    : isSelected
                      ? COLORS.selected
                      : undefined,
            }}
          >
            <TableRow
              key={index}
              row={row as ValidRecord}
              index={index}
              isSelected={isSelected}
            />
          </View>
        );
      })}
    </View>
  );
}

interface RowProps<T> {
  row: T;
  index: number;
  isSelected: boolean;
}
function TableRow<T extends ValidRecord>({ row, isSelected }: RowProps<T>) {
  const { columns, columnMap } = use(Context);

  return (
    <View style={{ flexDirection: "row" }}>
      {columns.map((column) => {
        const rendered = renderCell(row, column);
        return (
          <Text
            key={column.name}
            style={{
              fontFamily: "mono",
              color: isSelected ? "black" : "black",
            }}
          >
            {rpad(
              rendered,
              columnMap.get(column.name)! - rendered.length + EXTRA,
            )}
          </Text>
        );
      })}
    </View>
  );
}

function rpad(input: string, length: number): string {
  return (
    input +
    Array.from({ length })
      .map((_) => " ")
      .join("")
  );
}
