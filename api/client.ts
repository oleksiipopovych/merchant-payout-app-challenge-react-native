/**
 * Typed API client. Every response is parsed at this boundary, so callers only
 * ever see well-formed data or an `ApiError`.
 */
import type { z } from 'zod';

import { API_BASE_URL } from '@/constants';
import type { MerchantDataResponse } from '@/types/api';

import { merchantDataSchema } from './schemas';

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
