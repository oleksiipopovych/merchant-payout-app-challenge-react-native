/**
 * Per-test MSW overrides. The shared handlers add 500–2000ms of random latency;
 * these respond immediately with exactly what a test needs.
 */
import { delay, http, HttpResponse } from 'msw';

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

type ActivityPageReply =
  | PaginatedActivityResponse
  | { status: number }
  | { page: PaginatedActivityResponse; delayMs: number };

/**
 * Serves Activity pages keyed by cursor (`null` = first page). A reply can be a page or
 * an HTTP error status. Returns the cursors requested, in order.
 */
export function respondWithActivityPages(
  pages: [cursor: string | null, reply: ActivityPageReply][],
): (string | null)[] {
  const requested: (string | null)[] = [];
  server.use(
    http.get(`${API_BASE_URL}/api/merchant/activity`, async ({ request }) => {
      const cursor = new URL(request.url).searchParams.get('cursor');
      requested.push(cursor);
      const reply = pages.find(([key]) => key === cursor)?.[1];
      if (!reply) return HttpResponse.json({ error: 'Unexpected cursor' }, { status: 404 });
      if ('delayMs' in reply) {
        await delay(reply.delayMs);
        return HttpResponse.json(reply.page);
      }
      if ('status' in reply) return HttpResponse.json({ error: 'Internal Server Error' }, { status: reply.status });
      return HttpResponse.json(reply);
    }),
  );
  return requested;
}
