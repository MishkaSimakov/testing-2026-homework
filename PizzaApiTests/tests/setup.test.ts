import { expect, test } from 'vitest';

test('native fetch is available', () => {
  expect(typeof fetch).toBe('function');
});
