import { describe, expect, it } from 'vitest';
import { mergeUserSelection, normalizeUserIds } from './index';

const user = (userId: string) => ({ userId, nickName: `用户${userId}` });

describe('workflow user selection compatibility', () => {
  it('normalizes scalar and list preselection ids', () => {
    expect(normalizeUserIds('7')).toEqual(['7']);
    expect(normalizeUserIds([7, '8'])).toEqual([7, '8']);
    expect(normalizeUserIds(undefined)).toEqual([]);
  });

  it('retains selections from other pages and replaces current-page selection', () => {
    expect(mergeUserSelection([user('1'), user('9')], [user('1'), user('2')], [user('2')], true)).toEqual([
      user('9'),
      user('2')
    ]);
    expect(mergeUserSelection([user('1')], [user('2')], [user('2')], false)).toEqual([user('2')]);
  });
});
