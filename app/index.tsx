import { ThemedText } from '@/components/themed-text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authClient } from '@/lib/auth-client';
import { Button } from 'react-native';

export default function HomeScreen() {
  const { data } = authClient.useSession();
  const onLogout = () => {
    authClient.signOut();
  }

  return (
    <SafeAreaView>
      <ThemedText>Hello {data?.user.name}</ThemedText>
      <Button onPress={onLogout} title="Logout" />
    </SafeAreaView>
  );
}
