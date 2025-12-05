import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { View, Text } from "react-native";
import type { KeyEvent } from "@opentui/core";
import { useShortcut } from "../lib/shortcuts/hooks";

const HEADER_COLOR = "#7158e2";
const TABLE_COLORS = ["#ddd", "#eee"];
const SELECTED_COLOR = "#f7b730";

const EXTRA = 5;

export type ValidRecord = Record<string, string | number | null>;

interface TableState {
  data: unknown[];
  columns: Column[];
  columnMap: Map<string, number>;
  idx: number;
  selectedFrom: number | undefined;
}

const INITAL_STATE = {
  data: [],
  columns: [],
  columnMap: new Map(),
  idx: 0,
  selectedFrom: undefined,
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

export interface ProviderProps<T> {
  data: T[];
  columns: Column[];
  children: ReactNode;
  onKey?: (event: KeyEvent, selected: T[]) => void;
}
export function Provider<T extends ValidRecord>({
  data,
  columns,
  children,
  onKey,
}: ProviderProps<T>) {
  const [idx, setIdx] = useState(0);
  const [selectedFrom, setSelectedFrom] = useState<number>();

  useShortcut("j", () => {
    setIdx((prev) => Math.min(prev + 1, data.length - 1));
  });
  useShortcut("k", () => {
    setIdx((prev) => Math.max(prev - 1, 0));
  });

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
    <Context.Provider value={{ data, columns, columnMap, idx, selectedFrom }}>
      {children}
    </Context.Provider>
  );
}

export function Body() {
  const { columns, data, columnMap, idx, selectedFrom } = use(Context);
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
        const isSelected =
          index == idx ||
          (selectedFrom != undefined &&
            ((selectedFrom <= index && index <= idx) ||
              (idx <= index && index <= selectedFrom)));

        return (
          <View
            key={index}
            style={{
              backgroundColor: isSelected
                ? SELECTED_COLOR
                : TABLE_COLORS[index % 2],
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
