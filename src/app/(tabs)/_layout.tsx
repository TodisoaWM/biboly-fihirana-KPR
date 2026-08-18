import { Tabs } from 'expo-router';

import { TabBar } from '@/components/TabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
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
