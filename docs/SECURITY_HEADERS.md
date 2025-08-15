# Security Headers Template

Add these headers at your CDN / reverse proxy (e.g., Netlify, Vercel, Nginx, Cloudflare). Adjust `connect-src` and font/image domains to your environment.

- Content-Security-Policy:
  - default-src 'self';
  - script-src 'self' 'nonce-<nonce>';
  - style-src 'self' 'unsafe-inline';
  - img-src 'self' data: blob:;
  - font-src 'self' data:;
  - connect-src 'self' https://api.yourdomain.tld;
  - frame-ancestors 'self';
  - base-uri 'self';
- Referrer-Policy: no-referrer
- X-Content-Type-Options: nosniff
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Cross-Origin-Opener-Policy: same-origin

Notes:

- If you can hash inline styles, replace 'unsafe-inline' with hashed rules.
- Consider Trusted Types for script sinks if you add third-party widgets.
