import { Platform, ViewStyle } from 'react-native';

/**
 * Ombre de carte cross-platform.
 * RN Web 0.21 ignore les props `shadow*` (dépréciées) → on émet un `boxShadow`
 * explicite sur le web, et on garde les props natives ailleurs.
 */
export function cardShadow(color: string, level: 'sm' | 'md' | 'lg' = 'md'): ViewStyle {
  const y = level === 'lg' ? 16 : level === 'md' ? 10 : 5;
  const blur = level === 'lg' ? 34 : level === 'md' ? 26 : 14;
  if (Platform.OS === 'web') {
    return { boxShadow: `0px ${y}px ${blur}px -8px ${color}` } as ViewStyle;
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: y },
    shadowOpacity: 0.55,
    shadowRadius: blur,
    elevation: level === 'lg' ? 6 : level === 'md' ? 4 : 2,
  };
}
