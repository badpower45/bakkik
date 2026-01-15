import { NextResponse } from 'next/server';

/**
 * Successful response helper
 */
export function successResponse<T>(data: T, status: number = 200) {
    return NextResponse.json({ success: true, data }, { status });
}

/**
 * Created response helper (201)
 */
export function createdResponse<T>(data: T) {
    return NextResponse.json({ success: true, data }, { status: 201 });
}

/**
 * No content response (204)
 */
export function noContentResponse() {
    return new NextResponse(null, { status: 204 });
}

/**
 * Error response helper
 */
export function errorResponse(message: string, status: number = 400) {
    return NextResponse.json({ success: false, error: message }, { status });
}

/**
 * Paginated response helper
 */
export function paginatedResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
) {
    return NextResponse.json({
        success: true,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total,
        },
    });
}
