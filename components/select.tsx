import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type SelectProps<T extends string> = {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
};

/** A small dropdown: a field showing the current value that opens a list of options. */
export function Select<T extends string>({ label, value, options, onChange }: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');
  const surface = useThemeColor({}, 'surface');
  const background = useThemeColor({}, 'background');
  const muted = useThemeColor({}, 'icon');
  const tint = useThemeColor({}, 'tint');

  const choose = (option: T) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <View style={styles.field}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <Pressable
        accessibilityRole="combobox"
        accessibilityLabel={label}
        accessibilityValue={{ text: value }}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={[styles.trigger, { backgroundColor: surface, borderColor: border }]}>
        <ThemedText style={[styles.value, { color: text }]}>{value}</ThemedText>
        <ThemedText style={{ color: muted }}>▼</ThemedText>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={styles.backdrop}
          accessibilityLabel={`Close ${label} options`}
          onPress={() => setOpen(false)}>
          <View style={[styles.menu, { backgroundColor: background }]} accessibilityRole="menu">
            {options.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="menuitem"
                accessibilityLabel={option}
                accessibilityState={{ selected: option === value }}
                onPress={() => choose(option)}
                style={({ pressed }) => [styles.option, { opacity: pressed ? 0.6 : 1 }]}>
                <ThemedText
                  type={option === value ? 'defaultSemiBold' : 'default'}
                  style={option === value ? { color: tint } : undefined}>
                  {option}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  value: { fontSize: 18 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 32,
  },
  menu: { borderRadius: 14, paddingVertical: 8 },
  option: { paddingVertical: 14, paddingHorizontal: 20 },
});
