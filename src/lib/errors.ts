/**
 * Custom error classes for structured error handling
 * Provides consistent error responses across the API
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;

    // Maintain proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * 400 Bad Request - Invalid input or validation failure
 */
export class ValidationError extends AppError {
  constructor(message: string, public details?: unknown) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

/**
 * 401 Unauthorized - Authentication required or failed
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

/**
 * 403 Forbidden - Authenticated but not allowed
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

/**
 * 404 Not Found - Resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

/**
 * 409 Conflict - Resource already exists or state conflict
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class RateLimitError extends AppError {
  constructor(
    public retryAfter: number,
    message: string = "Too many requests. Please try again later."
  ) {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
  }
}

/**
 * 500 Internal Server Error - Unexpected server error
 */
export class InternalError extends AppError {
  constructor(message: string = "An unexpected error occurred") {
    super(message, 500, "INTERNAL_ERROR");
  }
}

/**
 * Handle error and return appropriate response data
 * Use this in API routes to standardize error responses
 */
export function handleError(error: unknown): {
  message: string;
  statusCode: number;
  code?: string;
} {
  // Handle known application errors
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Log unexpected errors for debugging
    console.error("Unexpected error:", error);

    // Don't expose internal error details in production
    return {
      message: process.env.NODE_ENV === "development"
        ? error.message
        : "An unexpected error occurred",
      statusCode: 500,
      code: "INTERNAL_ERROR",
    };
  }

  // Handle unknown error types
  console.error("Unknown error type:", error);
  return {
    message: "An unexpected error occurred",
    statusCode: 500,
    code: "INTERNAL_ERROR",
  };
}
