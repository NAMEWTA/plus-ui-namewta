import type { UserSummary } from '@namewta/domain-workflow';

type IdInput = string | number | readonly (string | number)[] | undefined;

export const normalizeUserIds = (input: IdInput): (string | number)[] =>
  input === undefined ? [] : Array.isArray(input) ? [...input] : [input as string | number];

export const mergeUserSelection = (
  retained: readonly UserSummary[],
  page: readonly UserSummary[],
  pageSelection: readonly UserSummary[],
  multiple: boolean
): UserSummary[] => {
  if (!multiple) return pageSelection.slice(-1);
  const pageIds = new Set(page.map(user => String(user.userId)));
  const merged = new Map(
    retained.filter(user => !pageIds.has(String(user.userId))).map(user => [String(user.userId), user])
  );
  for (const user of pageSelection) merged.set(String(user.userId), user);
  return [...merged.values()];
};
