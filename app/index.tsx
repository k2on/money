import { SafeAreaView } from 'react-native-safe-area-context';
import { authClient } from '@/lib/auth-client';
import { Button, Text } from 'react-native';
import { useQuery, useZero } from "@rocicorp/zero/react";
import { queries, type Mutators, type Schema } from '@money/shared';
import { randomUUID } from "expo-crypto";

export default function HomeScreen() {
  const { data: session } = authClient.useSession();

  const onLogout = () => {
    authClient.signOut();
  }
  const z = useZero<Schema, Mutators>();
  const [transactions] = useQuery(queries.allTransactions(session));
  const [user] = useQuery(queries.me(session));

  const onNew = () => {
    z.mutate.transaction.create({
      id: randomUUID(),
      name: "Uber",
      amount: 100,
    })
  };

  return (
    <SafeAreaView>
      <Text>Hello {user?.name}</Text>
      <Button onPress={onLogout} title="Logout" />
      <Text>Transactions: {JSON.stringify(transactions, null, 4)}</Text>
      <Button onPress={onNew} title="New" />
      <Button onPress={() => {
        z.mutate.transaction.deleteAll();
      }} title="Delete" />
      <Button onPress={() => {
        z.mutate.link.create();
      }} title="Open link" />
    </SafeAreaView>
  );
}
