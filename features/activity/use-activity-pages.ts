import { useInfiniteQuery } from '@tanstack/react-query';

import { getActivityPage } from '@/api/client';

export const activityQueryKey = ['activity'] as const;

export function useActivityPages() {
  return useInfiniteQuery({
    queryKey: activityQueryKey,
    queryFn: ({ pageParam }) => getActivityPage(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.next_cursor : undefined),
  });
}
