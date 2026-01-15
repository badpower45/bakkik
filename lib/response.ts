import { NextResponse } from 'next/server';

/**
 * Success response
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Error response
 */
export function errorResponse(message: string, status: number = 400, errors?: any) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
}

/**
 * Validation error response
 */
export function validationError(errors: any) {
  return errorResponse('Validation failed', 422, errors);
}

/**
 * Unauthorized error
 */
export function unauthorizedError(message: string = 'Unauthorized') {
  return errorResponse(message, 401);
}

/**
 * Forbidden error
 */
export function forbiddenError(message: string = 'Forbidden') {
  return errorResponse(message, 403);
}

/**
 * Not found error
 */
export function notFoundError(message: string = 'Resource not found') {
  return errorResponse(message, 404);
}

/**
 * Internal server error
 */
export function serverError(message: string = 'Internal server error') {
  return errorResponse(message, 500);
}
