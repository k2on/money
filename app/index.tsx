import { authClient } from '@/lib/auth-client';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useQuery, useZero } from "@rocicorp/zero/react";
import { queries, type Mutators, type Schema } from '@money/shared';
import { useEffect, useState } from 'react';

export default function HomeScreen() {
  const { data: session } = authClient.useSession();

  const z = useZero<Schema, Mutators>();
  const [transactions] = useQuery(queries.allTransactions(session));
  const [balances] = useQuery(queries.getBalances(session));

  const [idx, setIdx] = useState(0);
  const [accountIdx, setAccountIdx] = useState(0);

  const account = balances.at(accountIdx)!;

  const filteredTransactions = transactions
    .filter(t => t.account_id == account.plaid_id)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "j") {
        setIdx((prevIdx) => {
          if (prevIdx + 1 == filteredTransactions.length) return prevIdx;
          return prevIdx + 1
        });
      } else if (event.key === "k") {
        setIdx((prevIdx) => prevIdx == 0 ? 0 : prevIdx - 1);
      } else if (event.key == 'g') {
        setIdx(0);
      } else if (event.key == "G") {
        setIdx(transactions.length - 1);
      } else if (event.key == 'R') {
        z.mutate.link.updateTransactions();
        z.mutate.link.updateBalences();
      } else if (event.key == 'h') {
        setAccountIdx((prevIdx) => prevIdx == 0 ? 0 : prevIdx - 1);
      } else if (event.key == 'l') {
        setAccountIdx((prevIdx) => {
          if (prevIdx + 1 == balances.length) return prevIdx;
          return prevIdx + 1
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [filteredTransactions, balances]);

  function lpad(n: number): string {
    const LEN = 9;
    const nstr = n.toFixed(2).toLocaleString();
    return Array.from({ length: LEN - nstr.length }).join(" ") + nstr;
  }

  function uuu(t: typeof filteredTransactions[number]): string | undefined {
    if (!t.json) return;
    const j = JSON.parse(t.json);
    return j.counterparties.filter((c: any) => !!c.logo_url).at(0)?.logo_url || j.personal_finance_category_icon_url;
  }

  return (
    <View>
      <View style={{ flexDirection: "row" }}>
        <View style={{ backgroundColor: '' }}>
          {balances.map((bal, i) => <View key={bal.id} style={{ backgroundColor: i == accountIdx ? 'black' : undefined}}>
            <Text style={{ fontFamily: 'mono', color: i == accountIdx ? 'white' : undefined  }}>{bal.name}: {bal.current} ({bal.avaliable})</Text>
          </View>)}
        </View>

        <View>
          {filteredTransactions.map((t, i) => <Pressable onHoverIn={() => {
            setIdx(i);
          }} style={{ backgroundColor: i == idx ? 'black' : undefined, cursor: 'default' as 'auto' }} key={t.id}>
            <Text style={{ fontFamily: 'mono', color: i == idx ? 'white' : undefined }}>
              {new Date(t.datetime!).toDateString()}
              <Text style={{ color: t.amount > 0 ? 'red' : 'green' }}> {lpad(t.amount)}</Text>
              <Image style={{ width: 15, height: 15, marginHorizontal: 10 }} source={{ uri: uuu(t) || "" }} />
              {t.name.substring(0, 50)}
            </Text>
          </Pressable>)}
        </View>
        <ScrollView>
          <Text style={{ fontFamily: 'mono' }}>{JSON.stringify(JSON.parse(filteredTransactions.at(idx)?.json || "null"), null, 4)}</Text>
        </ScrollView>
      </View>
    </View>
  );
}
