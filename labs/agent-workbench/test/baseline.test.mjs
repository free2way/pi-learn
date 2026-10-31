import assert from 'node:assert/strict'
import test from 'node:test'
import { orderTotalCents } from '../src/order-total.mjs'

test('empty order totals zero', () => {
  assert.equal(orderTotalCents([]), 0)
})

test('adds one line', () => {
  assert.equal(orderTotalCents([{ unitPriceCents: 1299, quantity: 2 }]), 2598)
})

test('adds several lines using integer cents', () => {
  assert.equal(orderTotalCents([
    { unitPriceCents: 999, quantity: 1 },
    { unitPriceCents: 250, quantity: 4 },
  ]), 1999)
})

test('rejects non-array input', () => {
  assert.throws(() => orderTotalCents(null), /lines must be an array/)
})

test('rejects negative or fractional prices', () => {
  assert.throws(() => orderTotalCents([{ unitPriceCents: -1, quantity: 1 }]), /unitPriceCents/)
  assert.throws(() => orderTotalCents([{ unitPriceCents: 10.5, quantity: 1 }]), /unitPriceCents/)
})

test('rejects invalid quantities', () => {
  assert.throws(() => orderTotalCents([{ unitPriceCents: 100, quantity: 0 }]), /quantity/)
  assert.throws(() => orderTotalCents([{ unitPriceCents: 100, quantity: 1.5 }]), /quantity/)
})

