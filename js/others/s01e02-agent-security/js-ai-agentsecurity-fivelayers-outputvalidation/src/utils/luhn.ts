export function isValidLuhn(digits: string): boolean {
  if (!/^\d+$/.test(digits) || digits.length < 13) return false;

  let sum = 0;
  let double = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }

  return sum % 10 === 0;
}
