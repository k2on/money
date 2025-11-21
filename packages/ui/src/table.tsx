import { createContext, use, useState, type ReactNode } from "react";
import { View, Text, ScrollView } from "react-native";
import { useKeyboard } from "./useKeyboard";
import type { KeyEvent } from "@opentui/core";

const HEADER_COLOR = '#7158e2';
const TABLE_COLORS = [
  '#ddd',
  '#eee'
];
const SELECTED_COLOR = '#f7b730';


const EXTRA = 5;

export type ValidRecord = Record<string, string | number | null>;

interface TableState {
  data: unknown[];
  columns: Column[];
  columnMap: Map<string, number>;
  idx: number;
  selectedFrom: number | undefined;
};


const INITAL_STATE = {
  data: [],
  columns: [],
  columnMap: new Map(),
  idx: 0,
  selectedFrom: undefined,
} satisfies TableState;

export const Context = createContext<TableState>(INITAL_STATE); 

export type Column = { name: string, label: string, render?: (i: number | string) => string };


function renderCell(row: ValidRecord, column: Column): string {
  const cell = row[column.name];
  if (cell == undefined) return 'n/a';
  if (cell == null) return 'null';
  if (column.render) return column.render(cell);
  return cell.toString();
}


export interface ProviderProps<T> {
  data: T[];
  columns: Column[];
  children: ReactNode;
  onKey?: (event: KeyEvent, selected: T[]) => void;
};
export function Provider<T extends ValidRecord>({ data, columns, children, onKey }: ProviderProps<T>) {
  const [idx, setIdx] = useState(0);
  const [selectedFrom, setSelectedFrom] = useState<number>();

  useKeyboard((key) => {
    if (key.name == 'j' || key.name == 'down') {
      if (key.shift && selectedFrom == undefined) {
        setSelectedFrom(idx);
      }
      setIdx((prev) => Math.min(prev + 1, data.length - 1));
    } else if (key.name == 'k' || key.name == 'up') {
      if (key.shift && selectedFrom == undefined) {
        setSelectedFrom(idx);
      }
      setIdx((prev) => Math.max(prev - 1, 0));
    } else if (key.name == 'g' && key.shift) {
      setIdx(data.length - 1);
    } else if (key.name == 'v') {
      setSelectedFrom(idx);
    } else if (key.name == 'escape') {
      setSelectedFrom(undefined);
    } else {
      const from = selectedFrom ? Math.min(idx, selectedFrom) : idx;
      const to = selectedFrom ? Math.max(idx, selectedFrom) : idx;
      const selected = data.slice(from, to + 1);
      if (onKey) onKey(key, selected);
    }
  }, [data, idx, selectedFrom]);


  const columnMap = new Map(columns.map(col => {
    return [col.name, Math.max(col.label.length, ...data.map(row => renderCell(row, col).length))]
  }));


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
      <View style={{ backgroundColor: HEADER_COLOR, flexDirection: 'row' }}>
        {columns.map(column => <Text key={column.name} style={{ fontFamily: 'mono', color: 'white' }}>{rpad(column.label, columnMap.get(column.name)! - column.label.length + EXTRA)}</Text>)}
      </View>
        {data.map((row, index) => {
          const isSelected = index == idx || (selectedFrom != undefined && ((selectedFrom <= index && index <= idx) || (idx <= index && index <= selectedFrom)))

          return (
            <View key={index} style={{ backgroundColor: isSelected ? SELECTED_COLOR : TABLE_COLORS[index % 2] }}>
              <TableRow key={index} row={row as ValidRecord} index={index} isSelected={isSelected} />
            </View>
          );
        })}
    </View>
  )

}

interface RowProps<T> {
  row: T;
  index: number;
  isSelected: boolean;
}
function TableRow<T extends ValidRecord>({ row, isSelected }: RowProps<T>) {
  const { data, columns, columnMap } = use(Context);


  return <View style={{ flexDirection: 'row' }}>
    {columns.map(column => {
      const rendered = renderCell(row, column);
      return <Text key={column.name} style={{ fontFamily: 'mono', color: isSelected ? 'black' : 'black' }}>{rpad(rendered, columnMap.get(column.name)! - rendered.length + EXTRA)}</Text>;
    })}
  </View>
}

function rpad(input: string, length: number): string {
  return input + Array.from({ length })
    .map(_ => " ")
    .join("");
}


