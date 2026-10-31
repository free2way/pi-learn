# Tiered discount task

Add an optional second argument to `orderTotalCents(lines, options)`.

Acceptance rules:

- `options.loyaltyTier` may be `"none"`, `"silver"`, or `"gold"`; omitted options behave as `"none"`.
- Discounts apply only when the pre-discount order total is at least 5,000 cents.
- Silver receives 5% off; gold receives 10% off.
- Round only the final discounted total with `Math.round`; all inputs and outputs remain integer cents.
- Reject unknown tiers with a clear `RangeError`.
- Preserve all baseline behavior.
- Add focused tests for the threshold boundary and invalid tier.

Run both gates:

```bash
npm test
npm run acceptance
```

Report changed files, command output, and unresolved risks. Do not claim completion if either gate fails.

