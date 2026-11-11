import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({ label, hint, error, ...inputProps }: TextFieldProps) {
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');
  const surface = useThemeColor({}, 'surface');
  const muted = useThemeColor({}, 'icon');
  const negative = useThemeColor({}, 'negative');

  return (
    <View style={styles.field}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        placeholderTextColor={muted}
        style={[
          styles.input,
          { color: text, backgroundColor: surface, borderColor: error ? negative : border },
        ]}
        {...inputProps}
      />
      {error ? (
        <ThemedText style={[styles.helper, { color: negative }]} accessibilityLiveRegion="polite">
          {error}
        </ThemedText>
      ) : hint ? (
        <ThemedText style={[styles.helper, { color: muted }]}>{hint}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
  },
  helper: { fontSize: 14 },
});
