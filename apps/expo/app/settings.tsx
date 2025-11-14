import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';

import { Settings } from "@money/ui";

export default function HomeScreen() {
  return (
    <SafeAreaView>
      <Header />
      <Settings />
    </SafeAreaView>
  );
}

