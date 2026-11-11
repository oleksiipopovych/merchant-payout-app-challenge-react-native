import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Alert } from 'react-native';

import { addScreenshotListener } from '@/modules/screen-security';

const TITLE = 'Security Reminder';
const MESSAGE =
  'Please keep your financial data private. Screenshots may contain sensitive information.';

/**
 * Shows the Security Reminder alert when the merchant takes a screenshot, listening only while
 * the calling screen is focused. At most one alert is shown at a time; once dismissed, the next
 * screenshot alerts again.
 */
export function useScreenshotWarning() {
  const alertShowing = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const subscription = addScreenshotListener(() => {
        if (alertShowing.current) return;
        alertShowing.current = true;
        const reset = () => {
          alertShowing.current = false;
        };
        Alert.alert(TITLE, MESSAGE, [{ text: 'OK', onPress: reset }], {
          // Android: tapping outside dismisses without pressing OK.
          cancelable: true,
          onDismiss: reset,
        });
      });
      return () => subscription.remove();
    }, []),
  );
}
