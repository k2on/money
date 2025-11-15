import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { authClient } from '@/lib/auth-client';
import { ZeroProvider } from '@rocicorp/zero/react';
import { useMemo } from 'react';
import { authDataSchema } from '@money/shared/auth';
import { Platform } from 'react-native';
import type { ZeroOptions } from '@rocicorp/zero';
import { schema, type Schema, createMutators, type Mutators, BASE_URL } from '@money/shared';
import { expoSQLiteStoreProvider } from "@rocicorp/zero/react-native";

export const unstable_settings = {
  anchor: 'index',
};

const kvStore = Platform.OS === "web" ? undefined : expoSQLiteStoreProvider();

export default function RootLayout() {
  const { data: session, isPending } = authClient.useSession();

  const authData = useMemo(() => {
    const result = authDataSchema.safeParse(session);
    return result.success ? result.data : null;
  }, [session]);

  const cookie = useMemo(() => {
    return Platform.OS == 'web' ? undefined : authClient.getCookie();
  }, [session, isPending]);

  const zeroProps = useMemo(() => {
    return {
      storageKey: 'money',
      kvStore,
      server: process.env.NODE_ENV == 'production' ? 'https://zero.koon.us' : `${BASE_URL}:4848`,
      userID: authData?.user.id ?? "anon",
      schema,
      mutators: createMutators(authData),
      auth: cookie,
    } as const satisfies ZeroOptions<Schema, Mutators>; 
  }, [authData, cookie]);

  return (
    <ZeroProvider {...zeroProps}>
      <Stack>
        <Stack.Protected guard={!isPending && !!session}>
          <Stack.Screen name="[...route]" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!isPending && !session}>
          <Stack.Screen name="auth" />
        </Stack.Protected>
      </Stack>
    </ZeroProvider>
  );
}
