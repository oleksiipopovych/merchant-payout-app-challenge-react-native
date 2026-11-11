import type { QueryClient } from '@tanstack/react-query';

import { getDeviceId } from '@/modules/screen-security';

const deviceIdQueryKey = ['device-id'] as const;

/**
 * The Device ID for this app session, read from the native module at most once.
 * Resolves undefined when it can't be read; the Payout is then sent without it (ADR-0003).
 */
export async function readDeviceId(queryClient: QueryClient): Promise<string | undefined> {
  try {
    const id = await queryClient.fetchQuery({
      queryKey: deviceIdQueryKey,
      queryFn: getDeviceId,
      staleTime: Infinity,
      gcTime: Infinity,
    });
    return id ?? undefined;
  } catch (error) {
    if (__DEV__) console.warn('Device ID unavailable; sending Payout without it.', error);
    return undefined;
  }
}
