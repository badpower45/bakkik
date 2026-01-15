import { NextResponse } from 'next/server';

export class APIError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
    }
}

export class ValidationError extends APIError {
    constructor(message: string) {
        super(message, 400);
        this.name = 'ValidationError';
    }
}

export class UnauthorizedError extends APIError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends APIError {
    constructor(message: string = 'Forbidden') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

export class NotFoundError extends APIError {
    constructor(message: string = 'Resource not found') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

/**
 * Error handler middleware wrapper
 */
export function withErrorHandler(handler: Function) {
    return async (request: Request, context?: any) => {
        try {
            return await handler(request, context);
        } catch (error) {
            console.error('API Error:', error);

            if (error instanceof APIError) {
                return NextResponse.json(
                    {
                        error: error.message,
                        type: error.name
                    },
                    { status: error.statusCode }
                );
            }

            // Handle authentication errors
            if (error instanceof Error) {
                if (error.message.includes('authorization') || error.message.includes('token')) {
                    return NextResponse.json(
                        { error: 'Authentication required' },
                        { status: 401 }
                    );
                }

                if (error.message.includes('Admin access required')) {
                    return NextResponse.json(
                        { error: 'Admin access required' },
                        { status: 403 }
                    );
                }
            }

            // Generic error
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}
