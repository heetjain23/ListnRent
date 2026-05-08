# ListnRent Admin App

## Environment-Based Rendering

The admin app supports `VITE_SITE_MODE` for deployment-aware rendering.

- `VITE_SITE_MODE=production` -> renders only the Coming Soon page
- `VITE_SITE_MODE=preview` -> renders the full admin app
- `VITE_SITE_MODE=development` -> renders the full admin app
- `VITE_SITE_MODE=comingsoon` -> forces the Coming Soon page

Default files included:

- `.env.production` sets `VITE_SITE_MODE=production`
- `.env.preview` sets `VITE_SITE_MODE=preview`
- `.env.development` sets `VITE_SITE_MODE=development`

Vercel behavior:

- Production deployments build with `VITE_SITE_MODE=production`
- Preview deployments build with `VITE_SITE_MODE=preview`
- Development deployments build with `VITE_SITE_MODE=development`