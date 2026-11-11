/**
 * Per-test MSW overrides. The shared handlers add 500–2000ms of random latency;
 * these respond immediately with exactly what a test needs.
 */
import { http, HttpResponse } from 'msw';

import { API_BASE_URL } from '@/constants';
import { server } from '@/mocks/server.test';
import type {
  ActivityItem,
  MerchantDataResponse,
  PaginatedActivityResponse,
} from '@/types/api';

export function activityItem(overrides: Partial<ActivityItem> & Pick<ActivityItem, 'id'>): ActivityItem {
  return {
    type: 'deposit',
    amount: 10000,
    currency: 'GBP',
    date: '2026-01-20T10:00:00.000Z',
    description: `Activity ${overrides.id}`,
    status: 'completed',
    ...overrides,
  };
}

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

/** Serves `body` for every Activity page request; returns the URLs requested, in order. */
export function respondWithActivityPage(body: PaginatedActivityResponse): URL[] {
  const requests: URL[] = [];
  server.use(
    http.get(`${API_BASE_URL}/api/merchant/activity`, ({ request }) => {
      requests.push(new URL(request.url));
      return HttpResponse.json(body);
    }),
  );
  return requests;
}

export function respondWithActivityError(status = 500) {
  server.use(
    http.get(`${API_BASE_URL}/api/merchant/activity`, () =>
      HttpResponse.json({ error: 'Internal Server Error' }, { status }),
    ),
  );
}
