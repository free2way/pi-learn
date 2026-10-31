export function orderTotalCents(lines) {
  if (!Array.isArray(lines)) {
    throw new TypeError('lines must be an array')
  }

  return lines.reduce((total, line) => {
    if (!Number.isInteger(line.unitPriceCents) || line.unitPriceCents < 0) {
      throw new RangeError('unitPriceCents must be a non-negative integer')
    }
    if (!Number.isInteger(line.quantity) || line.quantity < 1) {
      throw new RangeError('quantity must be a positive integer')
    }
    return total + line.unitPriceCents * line.quantity
  }, 0)
}

