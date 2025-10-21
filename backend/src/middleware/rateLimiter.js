const attempts = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 20;

export const rateLimiter = (req, res, next) => {
  try {
    const key = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    const entry = attempts.get(key) || { count: 0, first: now };

    if (now - entry.first > WINDOW_MS) {
      entry.count = 0;
      entry.first = now;
    }

    entry.count += 1;
    attempts.set(key, entry);

    if (entry.count > MAX_ATTEMPTS) {
      return res.status(429).json({ success: false, message: 'Too many requests' });
    }

    return next();
  } catch (err) {
    return next();
  }
};

export default rateLimiter;
