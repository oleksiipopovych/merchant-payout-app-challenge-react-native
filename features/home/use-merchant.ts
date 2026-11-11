import { useQuery } from '@tanstack/react-query';

import { getMerchant } from '@/api/client';

export const merchantQueryKey = ['merchant'] as const;

export function useMerchant() {
  return useQuery({ queryKey: merchantQueryKey, queryFn: getMerchant });
}
