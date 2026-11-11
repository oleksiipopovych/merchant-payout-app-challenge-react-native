/**
 * Fake bank API: the test adapter at the network seam.
 *
 * A fresh bank is installed before every test (jest.setup.js) with defaults: the merchant
 * fixture, one empty Activity page, and Payouts that come back Completed. Tests change only
 * what they need, at any point, by assigning to `bank`:
 *
 *   bank.merchant = { status: 500 };
 *   bank.activityPages = [[null, firstPage], ['act_1', { status: 500 }]];
 *   bank.payoutReply = { payoutStatus: 'failed' };
 *
 * Every endpoint takes the same Reply: a success value, `{ status, error? }`,
 * `{ networkError: true }` or `{ malformed: body }`, each with an optional `delayMs`.
 * Requests are recorded in arrival order; `requestsTo` returns a live array for one endpoint
 * (URLs for GETs, bodies for POSTs).
 */
import { delay, http, HttpResponse, type JsonBodyType } from 'msw';

import { API_BASE_URL } from '@/constants';
import { server } from '@/mocks/server.test';
import type {
  ActivityItem,
  CreatePayoutRequest,
  MerchantDataResponse,
  PaginatedActivityResponse,
  PayoutResponse,
  PayoutStatus,
} from '@/types/api';

type Outcome<T> =
  T | { status: number; error?: string } | { networkError: true } | { malformed: JsonBodyType };
export type Reply<T> = Outcome<T> & { delayMs?: number };

type Endpoint = 'GET /api/merchant' | 'GET /api/merchant/activity' | 'POST /api/payouts';
type RequestPayload = {
  'GET /api/merchant': URL;
  'GET /api/merchant/activity': URL;
  'POST /api/payouts': CreatePayoutRequest;
};

export type RecordedRequest = {
  method: string;
  path: string;
  query: URLSearchParams;
  body: unknown;
};

export const merchantFixture: MerchantDataResponse = {
  available_balance: 500000,
  pending_balance: 25000,
  currency: 'GBP',
  activity: [],
};

export function activityItem(
  overrides: Partial<ActivityItem> & Pick<ActivityItem, 'id'>,
): ActivityItem {
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

const emptyActivityPage: PaginatedActivityResponse = {
  items: [],
  next_cursor: null,
  has_more: false,
};

function createBank() {
  const requests: RecordedRequest[] = [];
  const byEndpoint: { [E in Endpoint]: RequestPayload[E][] } = {
    'GET /api/merchant': [],
    'GET /api/merchant/activity': [],
    'POST /api/payouts': [],
  };

  return {
    merchant: merchantFixture as Reply<MerchantDataResponse>,
    /** Pages keyed by the cursor the app sends (`null` = first page). */
    activityPages: [[null, emptyActivityPage]] as [
      cursor: string | null,
      reply: Reply<PaginatedActivityResponse>,
    ][],
    payoutReply: { payoutStatus: 'completed' } as Reply<{ payoutStatus: PayoutStatus }>,

    /** Every request, in arrival order. */
    requests,
    /** A live array of what was sent to one endpoint: the URL (with its query) for GETs, the body for POSTs. */
    requestsTo<E extends Endpoint>(endpoint: E): RequestPayload[E][] {
      return byEndpoint[endpoint];
    },
    record<E extends Endpoint>(endpoint: E, request: RecordedRequest, payload: RequestPayload[E]) {
      requests.push(request);
      byEndpoint[endpoint].push(payload);
    },
  };
}

export type FakeBank = ReturnType<typeof createBank>;

/** The current test's bank. Replaced with a fresh one before every test. */
export let bank: FakeBank = createBank();

async function respond<T>(reply: Reply<T>, success: (value: T) => Response): Promise<Response> {
  if (reply.delayMs) await delay(reply.delayMs);
  if (typeof reply === 'object' && reply !== null) {
    if ('networkError' in reply) return HttpResponse.error();
    if ('malformed' in reply) return HttpResponse.json(reply.malformed);
    if ('status' in reply && typeof reply.status === 'number') {
      return HttpResponse.json(
        { error: reply.error ?? 'Internal Server Error' },
        { status: reply.status },
      );
    }
  }
  return success(reply as T);
}

function recordGet(
  endpoint: 'GET /api/merchant' | 'GET /api/merchant/activity',
  request: Request,
): URL {
  const url = new URL(request.url);
  bank.record(
    endpoint,
    { method: 'GET', path: url.pathname, query: url.searchParams, body: undefined },
    url,
  );
  return url;
}

const handlers = [
  http.get(`${API_BASE_URL}/api/merchant`, ({ request }) => {
    recordGet('GET /api/merchant', request);
    return respond(bank.merchant, (merchant) => HttpResponse.json(merchant));
  }),

  http.get(`${API_BASE_URL}/api/merchant/activity`, ({ request }) => {
    const cursor = recordGet('GET /api/merchant/activity', request).searchParams.get('cursor');
    const reply = bank.activityPages.find(([key]) => key === cursor)?.[1];
    if (!reply) return HttpResponse.json({ error: `Unexpected cursor ${cursor}` }, { status: 404 });
    return respond(reply, (page) => HttpResponse.json(page));
  }),

  http.post(`${API_BASE_URL}/api/payouts`, async ({ request }) => {
    const url = new URL(request.url);
    const body = (await request.json()) as CreatePayoutRequest;
    bank.record(
      'POST /api/payouts',
      { method: 'POST', path: url.pathname, query: url.searchParams, body },
      body,
    );
    return respond(bank.payoutReply, ({ payoutStatus }) => {
      const payout: PayoutResponse = {
        id: 'payout_test',
        status: payoutStatus,
        amount: body.amount,
        currency: body.currency,
        iban: body.iban,
        created_at: '2026-01-23T12:00:00.000Z',
      };
      return HttpResponse.json(payout, { status: 201 });
    });
  }),
];

/** Called from jest.setup.js before every test. */
export function installFakeBank() {
  bank = createBank();
  server.use(...handlers);
}
