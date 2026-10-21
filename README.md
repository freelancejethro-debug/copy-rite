# Copy Rite

A focused creative copywriting studio: paste rough copy, choose a writing direction, set the brief, and generate a polished rewrite plus three alternatives.

## Stack
- Static HTML/CSS/JavaScript frontend
- Vercel serverless function at `/api/rewrite`
- Vercel AI Gateway hosted inference
- Default model: `inclusionai/ling-3.0-flash-sante-free`

## Deploy
Import this repository into Vercel as a new project named `copy-rite`. The API key is never sent to the browser. The endpoint prefers `AI_GATEWAY_API_KEY`, then `VERCEL_OIDC_TOKEN` if Vercel OIDC is enabled for the deployment.

The AI Gateway requires authentication. If OIDC is not available to this project's serverless function, create an AI Gateway API key in Vercel and add it as an encrypted environment variable named `AI_GATEWAY_API_KEY`. Avoid committing secrets to Git.

## Endpoints
- `GET /api/rewrite` reports whether server-side authentication is configured.
- `POST /api/rewrite` accepts the original copy, main prompt, and three alternative prompts.

## Notes
Model availability, free-tier limits, and provider terms can change. The frontend displays API errors rather than silently substituting fake rewrites.
