/**
 * Typed API client using openapi-fetch.
 *
 * Types come from schema.d.ts (auto-generated via `bun run generate`).
 * This eliminates manual types — the backend IS the source of truth.
 */
import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from './schema';

/**
 * Create an openapi-fetch client with auth token.
 * Use this inside hooks where you have the session token.
 */
export function createApiClient(token: string) {
  // NEXT_PUBLIC_BACKEND_URL is e.g. "http://127.0.0.1:8000/api/v1"
  // Schema paths already include "/api/v1/..." so we strip it to avoid doubling
  const rawUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const baseUrl = rawUrl.replace(/\/api\/v1\/?$/, '');

  const client = createClient<paths>({
    baseUrl
  });

  // Auth middleware — attaches Bearer token to every request
  const authMiddleware: Middleware = {
    async onRequest({ request }) {
      request.headers.set('Authorization', `Bearer ${token}`);
      return request;
    }
  };

  client.use(authMiddleware);

  return client;
}

/**
 * Helper type to extract response body from a GET endpoint.
 *
 * Usage:
 *   type Countries = ApiResponse<'/api/v1/data-admin/countries/'>;
 *   // → automatically typed as PaginatedCountryListList
 */
export type ApiResponse<
  P extends keyof paths,
  M extends keyof paths[P] = 'get'
> = paths[P][M] extends {
  responses: { 200: { content: { 'application/json': infer R } } };
}
  ? R
  : never;

/**
 * Helper type to extract the request body for a POST/PATCH endpoint.
 */
export type ApiRequestBody<
  P extends keyof paths,
  M extends keyof paths[P] = 'post'
> = paths[P][M] extends {
  requestBody: { content: { 'application/json': infer R } };
}
  ? R
  : never;
