/**
 * Unified API error response builder.
 *
 * All API routes must use this for error responses to ensure:
 * 1. Consistent JSON shape: { error, code, retryable }
 * 2. No stack traces leak in production
 * 3. Sensitive internal details are masked from the client
 *
 * The shape is intentionally minimal — clients can switch on `code`
 * for programmatic handling and display `error` for human-readable context.
 */

import { NextResponse } from 'next/server';

export interface ApiErrorBody {
  error: string;
  code: string;
  retryable: boolean;
}

/**
 * Builds a standardized error NextResponse.
 *
 * @param status  — HTTP status code (4xx or 5xx)
 * @param code    — machine-readable error code (e.g. 'UNAUTHORIZED', 'RATE_LIMITED')
 * @param message — human-readable message (safe for client display)
 * @param opts.retryable — hint to the client whether retrying may succeed
 */
export function apiError(
  status: number,
  code: string,
  message: string,
  opts?: { retryable?: boolean },
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    {
      error: message,
      code,
      retryable: opts?.retryable ?? false,
    },
    { status },
  );
}

/**
 * Converts an unknown caught error into a safe 500 response.
 * Logs the full error server-side but returns only a generic message to the client.
 */
export function apiInternalError(
  context: string,
  err: unknown,
): NextResponse<ApiErrorBody> {
  // Log the real error server-side for debugging
  console.error(`[${context}]`, err instanceof Error ? err.message : err);

  return apiError(500, 'INTERNAL_ERROR', 'An unexpected error occurred', {
    retryable: true,
  });
}
