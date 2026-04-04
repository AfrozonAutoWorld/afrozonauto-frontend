/**
 * NEXT_PUBLIC_BASE_URL should include the `/api` prefix (e.g. https://host/api).
 */
export function getPublicApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_BASE_URL;
  if (!url) {
    throw new Error('API base URL is not configured.');
  }
  return url.replace(/\/$/, '');
}
