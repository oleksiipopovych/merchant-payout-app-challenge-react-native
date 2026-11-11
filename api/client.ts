/**
 * Typed API client. Every response is parsed at this boundary, so callers only
 * ever see well-formed data or an `ApiError`.
 */
import type { z } from 'zod';

import { API_BASE_URL } from '@/constants';
import type {
  CreatePayoutRequest,
  MerchantDataResponse,
  PaginatedActivityResponse,
  PayoutResponse,
} from '@/types/api';

import { merchantDataSchema, paginatedActivitySchema, payoutResponseSchema } from './schemas';

export type ApiErrorReason =
  | { kind: 'http'; status: number; message: string }
  | { kind: 'network' }
  | { kind: 'invalid-response' };

export class ApiError extends Error {
  constructor(readonly reason: ApiErrorReason) {
    super(reason.kind === 'http' ? reason.message : reason.kind);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError({ kind: 'network' });
  }

  const body: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    const message =
      typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
        ? body.error
        : response.statusText;
    throw new ApiError({ kind: 'http', status: response.status, message });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError({ kind: 'invalid-response' });
  }
  return parsed.data;
}

export function getMerchant(): Promise<MerchantDataResponse> {
  return request('/api/merchant', merchantDataSchema);
}

export const ACTIVITY_PAGE_SIZE = 15;

export function getActivityPage(
  cursor: string | null,
  limit = ACTIVITY_PAGE_SIZE,
): Promise<PaginatedActivityResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor !== null) params.set('cursor', cursor);
  return request(`/api/merchant/activity?${params}`, paginatedActivitySchema);
}

export function createPayout(payout: CreatePayoutRequest): Promise<PayoutResponse> {
  return request('/api/payouts', payoutResponseSchema, {
    method: 'POST',
    body: JSON.stringify(payout),
  });
}
