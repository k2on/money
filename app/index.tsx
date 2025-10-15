import { authClient } from '@/lib/auth-client';
import { Button, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useQuery, useZero } from "@rocicorp/zero/react";
import { queries, type Mutators, type Schema } from '@money/shared';
import { useEffect, useState } from 'react';
import { transaction } from '@/shared/src/db';

export default function HomeScreen() {
  const { data: session } = authClient.useSession();

  const z = useZero<Schema, Mutators>();
  const [plaidLink] = useQuery(queries.getPlaidLink(session)); 
  const [transactions] = useQuery(queries.allTransactions(session));
  const [balances] = useQuery(queries.getBalances(session));

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "j") {
        setIdx((prevIdx) => {
          if (prevIdx + 1 == transactions.length) return prevIdx;
          return prevIdx + 1
        });
      } else if (event.key === "k") {
        setIdx((prevIdx) => prevIdx == 0 ? 0 : prevIdx - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [transactions]);

  return (
    <View>
      {plaidLink && <Button onPress={() => {
        z.mutate.link.updateTransactions();
      }} title="Update transactions" />}
      {plaidLink && <Button onPress={() => {
        z.mutate.link.updateBalences();
      }} title="Update bal" />}

      <View style={{ flexDirection: "row" }}>
        <View style={{ backgroundColor: '' }}>
          {balances.map(bal => <View key={bal.id}>
            <Text style={{ fontFamily: 'mono',  }}>{bal.name}: {bal.current} ({bal.avaliable})</Text>
          </View>)}
        </View>

        <View>
          {transactions.map((t, i) => <Pressable onHoverIn={() => {
            setIdx(i);
          }} style={{ backgroundColor: i == idx ? 'black' : undefined, cursor: 'default' as 'auto' }} key={t.id}>
            <Text style={{ fontFamily: 'mono', color: i == idx ? 'white' : undefined }}>{new Date(t.datetime!).toDateString()} {t.name.substring(0, 50)} {t.amount}</Text>
          </Pressable>)}
        </View>
        <ScrollView>
          <Text style={{ fontFamily: 'mono' }}>{JSON.stringify(JSON.parse(transactions.at(idx)?.json || "null"), null, 4)}</Text>
        </ScrollView>
      </View>
    </View>
  );
}
