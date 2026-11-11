import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const tint = useThemeColor({}, 'tint');

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <ThemedText>{message}</ThemedText>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [styles.button, { borderColor: tint, opacity: pressed ? 0.6 : 1 }]}>
        <ThemedText style={{ color: tint }}>Retry</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, alignItems: 'flex-start' },
  button: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
});
