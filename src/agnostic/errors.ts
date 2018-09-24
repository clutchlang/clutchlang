/**
 * Throws an error if @param value is below the range of @param min.
 */
export function assertMin(name: string, value: number, min = 0): void {
  if (value < min) {
    throw new RangeError(`Invalid ${name}: ${value} is below the range of ${min}.`)
  }
}

/**
 * Throws an error if @param value is above the range of @param max.
 */
export function assertMax(name: string, value: number, max: number): void {
  if (value > max) {
    throw new RangeError(`Invalid ${name}: ${value} is above the range of ${max}.`);
  }
}

/**
 * Throws an error if @param value is not between @param min and @param max.
 */
export function assertRange(name: string, value: number, min: number, max: number): void {
  assertMin(name, value, min);
  assertMax(name, value, max);
}
