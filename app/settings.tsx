import { SafeAreaView } from 'react-native-safe-area-context';
import { authClient } from '@/lib/auth-client';
import { Button, Linking, Text } from 'react-native';
import { useQuery, useZero } from "@rocicorp/zero/react";
import { queries, type Mutators, type Schema } from '@money/shared';

export default function HomeScreen() {
  const { data: session } = authClient.useSession();

  const onLogout = () => {
    authClient.signOut();
  }
  const z = useZero<Schema, Mutators>();
  const [user] = useQuery(queries.me(session));
  const [plaidLink] = useQuery(queries.getPlaidLink(session)); 

  return (
    <SafeAreaView>
      <Text>Hello {user?.name}</Text>
      <Button onPress={onLogout} title="Logout" />

      <Text>{JSON.stringify(plaidLink)}</Text>
      {plaidLink ? <Button onPress={() => {
        Linking.openURL(plaidLink.link);
      }} title="Open Plaid" /> : <Text>No plaid link</Text>}

      <Button onPress={() => {
        z.mutate.link.create();
      }} title="Generate Link" />

      {plaidLink && <Button onPress={() => {
        z.mutate.link.get({ link_token: plaidLink.token });
      }} title="Check Link" />}

      {plaidLink && <Button onPress={() => {
        z.mutate.link.updateTransactions();
      }} title="Update transactions" />}
    </SafeAreaView>
  );
}

