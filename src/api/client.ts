import { telegram } from '../shared/lib/telegram';

export class ApiError extends Error {
  public code: string;
  public status: number;
  public traceId?: string;
  public details?: any;

  constructor(message: string, code: string, status: number, traceId?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.traceId = traceId;
    this.details = details;
  }
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const initData = telegram.getInitData();
  const headers = new Headers(options.headers || {});

  // Inject Telegram initData
  if (initData) {
    headers.set('X-Telegram-Init-Data', initData);
  }

  // Ensure JSON content-type if body is object or string
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (!response.ok) {
      throw new ApiError(`Request failed with status ${response.status}`, 'HTTP_ERROR', response.status);
    }
    return (await response.text()) as any;
  }

  const data = await response.json();

  if (!response.ok) {
    const err = data.error || {};
    throw new ApiError(
      err.message || `Request failed with status ${response.status}`,
      err.code || 'UNKNOWN_ERROR',
      response.status,
      err.traceId,
      err.details
    );
  }

  return data as T;
}
