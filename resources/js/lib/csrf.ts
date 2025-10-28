export function getCsrfToken(): string {
  const token = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content');
  if (!token) {
    console.error('CSRF token not found in meta tag');
  }
  return token ?? '';
}
