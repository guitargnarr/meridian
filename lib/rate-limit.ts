// Simple in-memory rate limiter for API routes
// Note: For production with multiple instances, use Redis

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

interface RateLimitOptions {
  windowMs: number    // Time window in milliseconds
  maxRequests: number // Max requests per window
}

const defaultOptions: RateLimitOptions = {
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 10       // 10 requests per minute
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = defaultOptions
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries()
  }

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + options.windowMs
    })
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetIn: options.windowMs
    }
  }

  if (entry.count >= options.maxRequests) {
    // Rate limited
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now
    }
  }

  // Increment count
  entry.count++
  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetIn: entry.resetTime - now
  }
}

function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Get client IP from request headers (works with Vercel)
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  return 'unknown'
}
