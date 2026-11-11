import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type PrimaryButtonProps = {
  title: string;
  /** Accessible name when it should differ from the visible title. */
  accessibilityLabel?: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
};

export function PrimaryButton({
  title,
  accessibilityLabel,
  onPress,
  disabled = false,
  busy = false,
}: PrimaryButtonProps) {
  const primary = useThemeColor({}, 'primary');
  const onPrimary = useThemeColor({}, 'onPrimary');
  const disabledBackground = useThemeColor({}, 'disabled');
  const disabledText = useThemeColor({}, 'disabledText');
  const inactive = disabled || busy;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactive, busy }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: disabled ? disabledBackground : primary, opacity: pressed ? 0.8 : 1 },
      ]}>
      {busy ? (
        <ActivityIndicator color={onPrimary} />
      ) : (
        <ThemedText type="defaultSemiBold" style={[styles.title, { color: disabled ? disabledText : onPrimary }]}>
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  title: { fontSize: 18 },
});
