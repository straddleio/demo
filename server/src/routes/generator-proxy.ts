import { Router, Request, Response } from 'express';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';

const router = Router();

/**
 * Proxy the Python paykey-generator (default http://localhost:8081)
 * to avoid mixed-content issues when the UI is served over HTTPS.
 *
 * Mount path: /api/generator
 */
router.use('*', async (req: Request, res: Response) => {
  const targetBase = config.generator.url.replace(/\/$/, '');
  const targetPath = req.url === '/' ? '/' : req.url;
  const targetUrl = `${targetBase}${targetPath}`;

  try {
    const headers: Record<string, string> = {};
    Object.entries(req.headers).forEach(([key, value]) => {
      if (!value || key.toLowerCase() === 'host' || key.toLowerCase() === 'content-length') {
        return;
      }
      headers[key] = Array.isArray(value) ? value.join(',') : value;
    });

    const isBodyAllowed = req.method !== 'GET' && req.method !== 'HEAD';
    const body =
      isBodyAllowed && req.body
        ? typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body)
        : undefined;

    if (body && !headers['content-type']) {
      headers['content-type'] = 'application/json';
    }

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'content-length') {
        return;
      }
      res.setHeader(key, value);
    });

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (error) {
    logger.error('Generator proxy error', error as Error);
    res.status(502).json({ error: 'Generator service unavailable' });
  }
});

export default router;
