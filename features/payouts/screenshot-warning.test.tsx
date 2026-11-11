import { act, fireEvent, screen } from 'expo-router/testing-library';
import { Alert, type AlertButton } from 'react-native';

import { goToTab } from '@/test/app-driver';
import { renderApp } from '@/test/render-app';
import { screenSecurityMock } from '@/test/screen-security';

const TITLE = 'Security Reminder';
const MESSAGE =
  'Please keep your financial data private. Screenshots may contain sensitive information.';

function takeScreenshot() {
  act(() => {
    screenSecurityMock().emitScreenshotTaken();
  });
}

/** Presses the given button on the most recent Alert, as the merchant would. */
function pressAlertButton(text: string) {
  const buttons = jest.mocked(Alert.alert).mock.lastCall?.[2] as AlertButton[] | undefined;
  const button = buttons?.find((b) => b.text === text);
  if (!button) throw new Error(`No "${text}" button on the last Alert`);
  act(() => button.onPress?.());
}

describe('Screenshot warning', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.mocked(Alert.alert).mockRestore();
  });

  it('shows the Security Reminder alert when the merchant takes a screenshot on Payouts', () => {
    renderApp('/payouts');

    expect(Alert.alert).not.toHaveBeenCalled();
    takeScreenshot();

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(Alert.alert).toHaveBeenCalledWith(
      TITLE,
      MESSAGE,
      [expect.objectContaining({ text: 'OK' })],
      expect.anything(),
    );
  });

  it('ignores screenshots taken on other tabs, even after Payouts has been visited', async () => {
    renderApp('/payouts');

    goToTab('Home');
    await screen.findByLabelText('Available balance £5,000.00');
    takeScreenshot();

    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('stops listening when Payouts loses focus, so switching tabs never stacks listeners', async () => {
    renderApp('/payouts');
    expect(screenSecurityMock().activeScreenshotListenerCount()).toBe(1);

    for (let i = 0; i < 3; i++) {
      goToTab('Home');
      expect(screenSecurityMock().activeScreenshotListenerCount()).toBe(0);
      goToTab('Payouts');
    }

    expect(screenSecurityMock().activeScreenshotListenerCount()).toBe(1);
  });

  it('never stacks alerts: one at a time, and the next screenshot after OK alerts again', () => {
    renderApp('/payouts');

    takeScreenshot();
    takeScreenshot();
    expect(Alert.alert).toHaveBeenCalledTimes(1);

    pressAlertButton('OK');
    takeScreenshot();
    expect(Alert.alert).toHaveBeenCalledTimes(2);
  });
});
