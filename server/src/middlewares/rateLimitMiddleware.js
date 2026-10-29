/**
 * Zero-dependency, memory-efficient sliding-window rate limiter middleware for StaffSync Express API.
 * Protects sensitive endpoints (e.g. auth login) from automated credential stuffing and brute-force attacks.
 */
export function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
  const maxRequests = options.maxRequests || 30; // 30 attempts per window
  const message = options.message || 'Too many requests from this IP address. Please try again later.';

  // Map of client identifier -> Array of timestamps [t1, t2, ...]
  const requestHistory = new Map();

  // Periodic cleanup of stale client keys to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of requestHistory.entries()) {
      const validTimestamps = timestamps.filter((t) => now - t < windowMs);
      if (validTimestamps.length === 0) {
        requestHistory.delete(key);
      } else {
        requestHistory.set(key, validTimestamps);
      }
    }
  }, Math.max(windowMs, 60000));

  // Ensure timer does not prevent process termination during unit tests
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    // In test environment, allow bypassing rate limits if configured
    if (process.env.NODE_ENV === 'test' && !options.enforceInTest) {
      return next();
    }

    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();

    const clientTimestamps = requestHistory.get(clientIp) || [];
    const validTimestamps = clientTimestamps.filter((t) => now - t < windowMs);

    if (validTimestamps.length >= maxRequests) {
      const oldestValid = validTimestamps[0];
      const resetTimeMs = oldestValid + windowMs;
      const retryAfterSeconds = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(resetTimeMs / 1000));

      return res.status(429).json({
        success: false,
        statusCode: 429,
        error: 'TooManyRequests',
        message,
        retryAfterSeconds
      });
    }

    // Record this request
    validTimestamps.push(now);
    requestHistory.set(clientIp, validTimestamps);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - validTimestamps.length));

    return next();
  };
}

export default createRateLimiter;

