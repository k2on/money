import { authClient } from '@/lib/auth-client';
import {  RefreshControl, ScrollView, StatusBar, Text, View } from 'react-native';
import { useQuery, useZero } from "@rocicorp/zero/react";
import { queries, type Mutators, type Schema } from '@money/shared';
import { useState } from 'react';

export default function HomeScreen() {
  const { data: session } = authClient.useSession();

  const [balances] = useQuery(queries.getBalances(session));
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // simulate async work
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ paddingTop: StatusBar.currentHeight, flexGrow: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} style={{ paddingHorizontal: 10 }}>
        {balances.map(balance => <Balance key={balance.id} balance={balance} />)}
      </ScrollView>
    </>
  );
}

function Balance({ balance }: { balance: { name: string, current: number, avaliable: number } }) {
  return <View style={{ backgroundColor: "#eee", borderColor: "#ddd", borderWidth: 1, marginBottom: 10, borderRadius: 10 }}>
    <Text style={{ fontSize: 15, textAlign: "center" }}>{balance.name}</Text>
    <Text style={{ fontSize: 30, textAlign: "center" }}>{balance.current}</Text>
  </View>
}
