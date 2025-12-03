/**
 * Standardized API Response Utilities
 * Ensures consistent response format across all API endpoints
 */

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: Record<string, string[]>; // For validation errors
    meta?: {
        timestamp: string;
        requestId?: string;
        pagination?: PaginationMeta;
    };
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

/**
 * Create a success response
 */
export function successResponse<T>(
    data: T,
    meta?: Partial<ApiResponse['meta']>
): ApiResponse<T> {
    return {
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            ...meta,
        },
    };
}

/**
 * Create an error response
 */
export function errorResponse(
    error: string,
    errors?: Record<string, string[]>
): ApiResponse {
    return {
        success: false,
        error,
        errors,
        meta: {
            timestamp: new Date().toISOString(),
        },
    };
}

/**
 * Handle common API errors and return appropriate response
 */
export function handleApiError(error: unknown): {
    response: ApiResponse;
    statusCode: number;
} {
    console.error('API Error:', error);

    if (error instanceof Error) {
        // Prisma errors
        if (error.name === 'PrismaClientInitializationError') {
            return {
                response: errorResponse('Database connection failed. Please try again later.'),
                statusCode: 503,
            };
        }

        if (error.name === 'PrismaClientKnownRequestError') {
            const prismaError = error as any;

            // Unique constraint violation
            if (prismaError.code === 'P2002') {
                return {
                    response: errorResponse('A record with this information already exists.'),
                    statusCode: 409,
                };
            }

            // Foreign key constraint failed
            if (prismaError.code === 'P2003') {
                return {
                    response: errorResponse('Referenced record does not exist.'),
                    statusCode: 400,
                };
            }

            // Record not found
            if (prismaError.code === 'P2025') {
                return {
                    response: errorResponse('Record not found.'),
                    statusCode: 404,
                };
            }

            return {
                response: errorResponse('Database operation failed.'),
                statusCode: 500,
            };
        }

        // Validation errors
        if (error.name === 'ValidationError') {
            return {
                response: errorResponse('Validation failed', (error as any).errors),
                statusCode: 400,
            };
        }

        // Generic error with message
        return {
            response: errorResponse(error.message),
            statusCode: 500,
        };
    }

    // Unknown error
    return {
        response: errorResponse('An unexpected error occurred'),
        statusCode: 500,
    };
}

/**
 * Validation error builder
 */
export class ValidationError extends Error {
    errors: Record<string, string[]>;

    constructor(errors: Record<string, string[]>) {
        super('Validation failed');
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
    page: number,
    limit: number,
    total: number
): PaginationMeta {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
}
