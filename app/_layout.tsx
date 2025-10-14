import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { authClient } from '@/lib/auth-client';
import { ZeroProvider } from '@rocicorp/zero/react';
import { zero } from '@/lib/zero';

export const unstable_settings = {
  anchor: '(tabs)',
};


export default function RootLayout() {
  const { data, isPending } = authClient.useSession();

  return (
    <ZeroProvider zero={zero}>
      <Stack>
        <Stack.Protected guard={!isPending && !!data}>
          <Stack.Screen name="index" />
        </Stack.Protected>
        <Stack.Protected guard={!isPending && !data}>
          <Stack.Screen name="auth" />
        </Stack.Protected>
      </Stack>
    </ZeroProvider>
  );
}
