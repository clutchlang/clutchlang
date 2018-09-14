/**
 * Returns an error when attempting to access or set an invalid range.
 * @param value What value was out of range
 * @param max Maximum value
 * @param min Minimum value; defaults to 0 if not specified
 */
export function outOfRange(value: number, max: number, min = 0): RangeError {
  return new RangeError(`Out of range: ${value} of ${min} .. ${max}`);
}
