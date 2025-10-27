import { SafeAreaView } from 'react-native-safe-area-context';
import { authClient } from '@/lib/auth-client';
import { Button, Linking, Platform, Pressable, Text, View } from 'react-native';
import { useQuery, useZero } from "@rocicorp/zero/react";
import { queries, type Mutators, type Schema } from '@money/shared';
import Header from '@/components/Header';
import { useEffect, useState, type ReactNode } from 'react';

export default function HomeScreen() {
  const { data: session } = authClient.useSession();

  const onLogout = () => {
    authClient.signOut();
  }
  const z = useZero<Schema, Mutators>();
  const [plaidLink] = useQuery(queries.getPlaidLink(session)); 
  const [items] = useQuery(queries.getItems(session));

  return (
    <SafeAreaView>
      <Header />

      <UI 
        columns={[
          {
            name: "Banks",
            items: items,
            renderItem: (item, props) => <Row {...props}>{item.name}</Row>
          },
          {
            name: "Family",
            items: [],
            renderItem() {
              return <View></View>;
            },
          }
        ]}
      />
    </SafeAreaView>
  );
}

type Col<T> = {
  name: string;
  items: T[];
  renderItem: (item: T, props: { isSelected: boolean, isActive: boolean }) => ReactNode;
}

type State = {
  idx: number;
  columns: Map<number, State>;
};

function UI({ columns }: { columns: Col<any>[] }) {
  const [col, setCol] = useState(0);
  const [state, setState] = useState<State>({
    idx: 0,
    columns: new Map(
      Array.from({ length: columns.length })
        .map((_, i) => ([i, { idx: 0, columns: new Map() }]))
    )
  });

  const getColState = (res: State): State => {
    let i = col;
    while (i > 0) {
      res = res.columns.get(res.idx)!;
      i--;
    }
    return res;

  }

  const colState = getColState(state);

  const curr = columns.at(col)!;


  useEffect(() => {
    if (Platform.OS != 'web') return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "j") {
        setState((prev) => {
          if (prev.idx + 1 == colState.columns.size) return prev;
          return {...prev, ...{ idx: prev.idx + 1 }};
        });
      } else if (event.key === "k") {
        setState((prev) => {
          if (prev.idx == 0) return prev;
          return {...prev, ...{ idx: prev.idx - 1 }};
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <View style={{ flexDirection: "row" }}>
      <Column>
        {columns.map((c, i) => <Pressable onPress={() => { setCol(i) }}><Row isSelected={col == i} isActive={col == 0}>{c.name}</Row></Pressable>)}
      </Column>
      <Column>
        {curr.items.map((item, i) => curr.renderItem(item, { isSelected: colState.idx == i, isActive: col == 1 }))}
      </Column>
    </View>
  );
}

function Column({ children }: { children: ReactNode }) {
  return (
    <View>
      {children}
    </View>
  );
}

function Row({ children, isSelected, isActive }: { children: ReactNode, isSelected: boolean, isActive: boolean }) {
  const color = isSelected ? 'white': undefined;
  const backgroundColor = isSelected ? (isActive ? 'black' : 'gray'): undefined;
  return (
    <View>
      <Text style={{ fontFamily: 'mono', color, backgroundColor }}>{children}</Text>
    </View>
  );
}
