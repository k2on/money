import { createContext, use, useState, type ReactNode } from "react";
import { View, Text } from "react-native";
import { useKeyboard } from "./useKeyboard";

const HEADER_COLOR = '#7158e2';
const TABLE_COLORS = [
  '#3c3c3c',
  '#4b4b4b'
];
const SELECTED_COLOR = '#f7b730';


const EXTRA = 5;

export type ValidRecord = Record<string, string | number | null>;

const TableContext = createContext<{ data: unknown[], columns: Column[], columnMap: Map<string, number> }>({
  data: [],
  columns: [],
  columnMap: new Map(),
}); 

export type Column = { name: string, label: string, render?: (i: number | string) => string };



function renderCell(row: ValidRecord, column: Column): string {
  const cell = row[column.name];
  if (cell == undefined) return 'n/a';
  if (cell == null) return 'null';
  if (column.render) return column.render(cell);
  return cell.toString();
}


export interface TableProps<T> {
  data: T[];
  columns: Column[];
};
export function Table<T extends ValidRecord>({ data, columns }: TableProps<T>) {
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
    }
  }, [data, idx]);


  const columnMap = new Map(columns.map(col => {
    return [col.name, Math.max(col.label.length, ...data.map(row => renderCell(row, col).length))]
  }));


  return (
    <TableContext.Provider value={{ data, columns, columnMap }}>
      <View>
        <View style={{ backgroundColor: HEADER_COLOR, flexDirection: 'row' }}>
          {columns.map(column => <Text key={column.name} style={{ fontFamily: 'mono', color: 'white' }}>{rpad(column.label, columnMap.get(column.name)! - column.label.length + EXTRA)}</Text>)}
        </View>
        {data.map((row, index) => {
          const isSelected = index == idx || (selectedFrom != undefined && ((selectedFrom <= index && index <= idx) || (idx <= index && index <= selectedFrom)))

          return (
            <View key={index} style={{ backgroundColor: isSelected ? SELECTED_COLOR : TABLE_COLORS[index % 2] }}>
              <TableRow key={index} row={row} index={index} isSelected={isSelected} />
            </View>
          );
        })}
      </View>
    </TableContext.Provider>
  );
}

interface RowProps<T> {
  row: T;
  index: number;
  isSelected: boolean;
}
function TableRow<T extends ValidRecord>({ row, isSelected }: RowProps<T>) {
  const { data, columns, columnMap } = use(TableContext);


  return <View style={{ flexDirection: 'row' }}>
    {columns.map(column => {
      const rendered = renderCell(row, column);
      return <Text key={column.name} style={{ fontFamily: 'mono', color: isSelected ? 'black' : 'white' }}>{rpad(rendered, columnMap.get(column.name)! - rendered.length + EXTRA)}</Text>;
    })}
  </View>
}

function rpad(input: string, length: number): string {
  return input + Array.from({ length })
    .map(_ => " ")
    .join("");
}


