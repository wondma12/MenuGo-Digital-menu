import test from 'node:test'
import assert from 'node:assert/strict'
import { safeParseDate } from './dateUtils.js'

test('safeParseDate returns null for empty or missing values', () => {
  assert.equal(safeParseDate(undefined), null)
  assert.equal(safeParseDate(''), null)
  assert.equal(safeParseDate('   '), null)
})

test('safeParseDate parses valid ISO dates', () => {
  const parsed = safeParseDate('2024-01-02')
  assert.ok(parsed instanceof Date)
  assert.equal(parsed.getFullYear(), 2024)
  assert.equal(parsed.getMonth() + 1, 1)
  assert.equal(parsed.getDate(), 2)
})

test('safeParseDate returns null for invalid dates', () => {
  assert.equal(safeParseDate('not-a-date'), null)
})
