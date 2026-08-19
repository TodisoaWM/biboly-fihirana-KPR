import { Tabs } from 'expo-router';

import { TabBar } from '@/components/TabBar';
import { useTheme } from '@/theme/ThemeProvider';

export default function TabsLayout() {
  const { theme } = useTheme();
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: theme.bg } }}
      tabBar={(props: any) => <TabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="baiboly" />
      <Tabs.Screen name="fihirana" />
      <Tabs.Screen name="vavaka" />
      <Tabs.Screen name="tiana" />
    </Tabs>
  );
}
