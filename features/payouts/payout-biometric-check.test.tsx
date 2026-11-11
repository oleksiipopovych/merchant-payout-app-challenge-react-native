import { fireEvent, screen } from 'expo-router/testing-library';

import * as ScreenSecurity from '@/modules/screen-security';
import { respondWithPayout } from '@/test/msw';
import { sendPayout } from '@/test/app-driver';
import { renderApp } from '@/test/render-app';

function nativeError(code: string) {
  return Object.assign(new Error(code), { code });
}

describe('Biometric Check for High-value Payouts', () => {
  it('runs the Biometric Check before sending a High-value Payout, and sends it on a pass', async () => {
    const requests = respondWithPayout({ payoutStatus: 'completed' });
    let requestsSentBeforeCheck: number | undefined;
    jest.mocked(ScreenSecurity.isBiometricAuthenticated).mockImplementation(async () => {
      requestsSentBeforeCheck = requests.length;
      return true;
    });
    renderApp('/payouts');

    sendPayout({ amount: '1000.01' });

    expect(await screen.findByRole('header', { name: 'Payout Completed' })).toBeOnTheScreen();
    expect(ScreenSecurity.isBiometricAuthenticated).toHaveBeenCalledTimes(1);
    expect(requestsSentBeforeCheck).toBe(0);
    expect(requests).toHaveLength(1);
  });

  it.each(['1000', '1000.00', '400'])('sends a %s GBP Payout without a Biometric Check', async (amount) => {
    const requests = respondWithPayout({ payoutStatus: 'completed' });
    renderApp('/payouts');

    sendPayout({ amount });

    expect(await screen.findByRole('header', { name: 'Payout Completed' })).toBeOnTheScreen();
    expect(ScreenSecurity.isBiometricAuthenticated).not.toHaveBeenCalled();
    expect(requests).toHaveLength(1);
  });

  it('aborts the Payout when the Biometric Check fails, and keeps the details for Try Again', async () => {
    jest.mocked(ScreenSecurity.isBiometricAuthenticated).mockResolvedValue(false);
    const requests = respondWithPayout({ payoutStatus: 'completed' });
    renderApp('/payouts');

    sendPayout({ amount: '1500' });

    expect(await screen.findByRole('header', { name: 'Unable to Process Payout' })).toBeOnTheScreen();
    expect(screen.getByText('Biometric authentication was cancelled.')).toBeOnTheScreen();
    expect(requests).toHaveLength(0);

    fireEvent.press(screen.getByRole('button', { name: 'Try Again' }));
    expect(screen.getByLabelText('Amount')).toHaveDisplayValue('1500');
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled();
  });

  it('tells the merchant to set up biometrics in Settings when none are enrolled, and does not send', async () => {
    jest
      .mocked(ScreenSecurity.isBiometricAuthenticated)
      .mockRejectedValue(nativeError('E_BIOMETRICS_NOT_ENROLLED'));
    const requests = respondWithPayout({ payoutStatus: 'completed' });
    renderApp('/payouts');

    sendPayout({ amount: '1500' });

    expect(await screen.findByRole('header', { name: 'Biometrics Not Set Up' })).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Payouts over 1,000.00 need Face ID, Touch ID or fingerprint. Set up biometrics in your device Settings, then try again.',
      ),
    ).toBeOnTheScreen();
    expect(requests).toHaveLength(0);
  });

  it('treats biometrics being unavailable on the device like not set up, and does not send', async () => {
    jest
      .mocked(ScreenSecurity.isBiometricAuthenticated)
      .mockRejectedValue(nativeError('E_BIOMETRICS_UNAVAILABLE'));
    const requests = respondWithPayout({ payoutStatus: 'completed' });
    renderApp('/payouts');

    sendPayout({ amount: '1500' });

    expect(await screen.findByRole('header', { name: 'Biometrics Not Set Up' })).toBeOnTheScreen();
    expect(requests).toHaveLength(0);
  });

  it('never sends a High-value Payout when the Biometric Check errors unexpectedly', async () => {
    jest.mocked(ScreenSecurity.isBiometricAuthenticated).mockRejectedValue(new Error('activity gone'));
    const requests = respondWithPayout({ payoutStatus: 'completed' });
    renderApp('/payouts');

    sendPayout({ amount: '1500' });

    expect(await screen.findByText('Biometric authentication was cancelled.')).toBeOnTheScreen();
    expect(requests).toHaveLength(0);
  });
});
