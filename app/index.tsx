import { SafeAreaView } from 'react-native-safe-area-context';
import { authClient } from '@/lib/auth-client';
import { Button, Text } from 'react-native';
import { useQuery, useZero } from "@rocicorp/zero/react";
import { queries } from '@money/shared';

export default function HomeScreen() {
  const { data } = authClient.useSession();
  const onLogout = () => {
    authClient.signOut();
  }
  const [transactions] = useQuery(queries.allTransactions());

  return (
    <SafeAreaView>
      <Text>Hello {data?.user.name}</Text>
      <Button onPress={onLogout} title="Logout" />
      <Text>Transactions: {JSON.stringify(transactions, null, 4)}</Text>
    </SafeAreaView>
  );
}
