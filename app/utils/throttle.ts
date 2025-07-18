const functionCache = new Map<string, number>();

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  key: string,
  seconds: number = 120
): T {
  return ((...args: any[]) => {
    const now = Date.now();
    const lastRun = functionCache.get(key);

    if (!lastRun || now - lastRun > seconds * 1000) {
      functionCache.set(key, now);
      return fn(...args);
    }

    return null;
  }) as T;
}
