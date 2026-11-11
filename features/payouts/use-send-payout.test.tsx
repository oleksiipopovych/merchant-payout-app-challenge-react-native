/**
 * Tests at the useSendPayout seam: guarantees of `send()` that the screen can't exercise,
 * because its locked Confirm button already blocks a second tap in the test renderer.
 */
import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { bank } from '@/test/fake-bank';

import { useSendPayout } from './use-send-payout';

const draft = { amount: 40000, currency: 'GBP', iban: 'GB29NWBK60161331926819' } as const;

function renderSendPayout() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useSendPayout(), { wrapper }).result;
}

describe('useSendPayout', () => {
  it('sends at most one Payout at a time: a second send while one is running shares its outcome', async () => {
    bank.payoutReply = { payoutStatus: 'completed', delayMs: 50 };
    const requests = bank.requestsTo('POST /api/payouts');
    const { send } = renderSendPayout().current;

    const first = send(draft);
    const second = send(draft);

    expect(second).toBe(first);
    expect((await first).kind).toBe('completed');
    expect(requests).toHaveLength(1);
  });

  it('allows the next Payout once the previous one has finished', async () => {
    bank.payoutReply = { payoutStatus: 'completed' };
    const requests = bank.requestsTo('POST /api/payouts');
    const { send } = renderSendPayout().current;

    await send(draft);
    await send({ ...draft, amount: 50000 });

    expect(requests.map((body) => body.amount)).toEqual([40000, 50000]);
  });
});
