import { fireEvent, screen } from 'expo-router/testing-library';

import * as ScreenSecurity from '@/modules/screen-security';
import { respondWithPayout } from '@/test/msw';
import { renderApp } from '@/test/render-app';

function sendPayout(amount = '400') {
  fireEvent.changeText(screen.getByLabelText('Amount'), amount);
  fireEvent.changeText(screen.getByLabelText('IBAN'), 'GB29NWBK60161331926819');
  fireEvent.press(screen.getByRole('button', { name: 'Confirm' }));
  fireEvent.press(screen.getByRole('button', { name: 'Confirm payout' }));
}

describe('Device ID on Payouts', () => {
  it('sends the Device ID with the Payout', async () => {
    jest.mocked(ScreenSecurity.getDeviceId).mockResolvedValue('device-123');
    const requests = respondWithPayout({ payoutStatus: 'completed' });
    renderApp('/payouts');

    sendPayout();

    expect(await screen.findByRole('header', { name: 'Payout Completed' })).toBeOnTheScreen();
    expect(requests).toEqual([
      { amount: 40000, currency: 'GBP', iban: 'GB29NWBK60161331926819', device_id: 'device-123' },
    ]);
  });

  it.each([
    ['the native call fails', () => jest.mocked(ScreenSecurity.getDeviceId).mockRejectedValue(new Error('boom'))],
    ['the platform has no ID yet', () => jest.mocked(ScreenSecurity.getDeviceId).mockResolvedValue(null)],
  ])('still sends the Payout, without a Device ID, when %s', async (_case, arrange) => {
    arrange();
    const requests = respondWithPayout({ payoutStatus: 'completed' });
    renderApp('/payouts');

    sendPayout();

    expect(await screen.findByRole('header', { name: 'Payout Completed' })).toBeOnTheScreen();
    expect(requests).toEqual([{ amount: 40000, currency: 'GBP', iban: 'GB29NWBK60161331926819' }]);
  });

  it('reads the Device ID from the device only once per session', async () => {
    jest.mocked(ScreenSecurity.getDeviceId).mockResolvedValue('device-123');
    const requests = respondWithPayout({ payoutStatus: 'completed' });
    renderApp('/payouts');

    sendPayout('400');
    fireEvent.press(await screen.findByRole('button', { name: 'Create Another Payout' }));
    sendPayout('500');
    await screen.findByRole('button', { name: 'Create Another Payout' });

    expect(requests.map((body) => body.device_id)).toEqual(['device-123', 'device-123']);
    expect(ScreenSecurity.getDeviceId).toHaveBeenCalledTimes(1);
  });
});
