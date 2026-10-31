import assert from 'node:assert/strict'
import test from 'node:test'
import { orderTotalCents } from '../src/order-total.mjs'

const acceptance = process.env.RUN_ACCEPTANCE === '1' ? test : test.skip

acceptance('silver receives 5% off orders of at least 5,000 cents', () => {
  assert.equal(
    orderTotalCents([{ unitPriceCents: 2500, quantity: 2 }], { loyaltyTier: 'silver' }),
    4750,
  )
})

acceptance('gold receives 10% off orders of at least 5,000 cents', () => {
  assert.equal(
    orderTotalCents([{ unitPriceCents: 2000, quantity: 3 }], { loyaltyTier: 'gold' }),
    5400,
  )
})

acceptance('rounds the final discounted total to the nearest integer cent', () => {
  assert.equal(
    orderTotalCents([{ unitPriceCents: 1667, quantity: 3 }], { loyaltyTier: 'silver' }),
    4751,
  )
})

