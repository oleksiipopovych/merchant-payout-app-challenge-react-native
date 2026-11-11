/**
 * Per-test MSW overrides. The shared handlers add 500–2000ms of random latency;
 * these respond immediately with exactly what a test needs.
 */
import { http, HttpResponse } from 'msw';

import { API_BASE_URL } from '@/constants';
import { server } from '@/mocks/server.test';
import type { MerchantDataResponse } from '@/types/api';

export const merchantFixture: MerchantDataResponse = {
  available_balance: 500000,
  pending_balance: 25000,
  currency: 'GBP',
  activity: [],
};

export function respondWithMerchant(body: MerchantDataResponse = merchantFixture) {
  server.use(http.get(`${API_BASE_URL}/api/merchant`, () => HttpResponse.json(body)));
}

export function respondWithMerchantError(status = 500) {
  server.use(
    http.get(`${API_BASE_URL}/api/merchant`, () =>
      HttpResponse.json({ error: 'Internal Server Error' }, { status }),
    ),
  );
}

export function respondWithMalformedMerchant() {
  server.use(
    http.get(`${API_BASE_URL}/api/merchant`, () =>
      HttpResponse.json({ available_balance: 'lots', currency: 'USD' }),
    ),
  );
}
