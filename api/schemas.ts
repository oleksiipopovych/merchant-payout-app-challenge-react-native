/**
 * Runtime schemas for API responses. Each is checked against the provided
 * hand-written types in `types/api.ts`, which remain the source of truth.
 */
import { z } from 'zod';

import type {
  ActivityItem,
  Currency,
  MerchantDataResponse,
  PaginatedActivityResponse,
  PayoutResponse,
} from '@/types/api';

export const currencySchema = z.enum(['GBP', 'EUR']) satisfies z.ZodType<Currency>;

export const activityItemSchema = z.object({
  id: z.string(),
  type: z.enum(['payout', 'deposit', 'refund', 'fee']),
  amount: z.number().int(),
  currency: currencySchema,
  date: z.string(),
  description: z.string(),
  status: z.enum(['completed', 'pending', 'processing', 'failed']),
}) satisfies z.ZodType<ActivityItem>;

export const merchantDataSchema = z.object({
  available_balance: z.number().int(),
  pending_balance: z.number().int(),
  currency: currencySchema,
  activity: z.array(activityItemSchema),
}) satisfies z.ZodType<MerchantDataResponse>;

export const paginatedActivitySchema = z.object({
  items: z.array(activityItemSchema),
  next_cursor: z.string().nullable(),
  has_more: z.boolean(),
}) satisfies z.ZodType<PaginatedActivityResponse>;

export const payoutResponseSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  amount: z.number().int(),
  currency: currencySchema,
  iban: z.string(),
  created_at: z.string(),
}) satisfies z.ZodType<PayoutResponse>;
