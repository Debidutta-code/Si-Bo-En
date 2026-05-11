interface ErrorSource {
    parameter?: string;
    pointer?: string;
}

export interface ErrorResponse {
    status: number;
    code: number;
    title: string;
    message: string;
    source?: ErrorSource;
}

export interface ErrorFormat {
    errors: ErrorResponse[];
}

export const ErrorMessages = {
    INVALID_ID: {
        status: 400,
        code: 4001,
        title: 'INVALID FORMAT',
        message: 'Invalid user ID format',
        source: { parameter: 'id' },
    },
    USER_NOT_FOUND: {
        status: 404,
        code: 4041,
        title: 'NOT FOUND',
        message: 'No user found with the provided ID',
        source: { parameter: 'id' },
    },
    UNAUTHORIZED_ACTION: {
        status: 403,
        code: 4031,
        title: 'FORBIDDEN',
        message: 'You are not authorized to perform this action',
    },
    ROLE_UPDATE_NOT_ALLOWED: {
        status: 403,
        code: 4032,
        title: 'FORBIDDEN',
        message: 'You cannot update the user role',
    },
    SUPERADMIN_ROLE_ONLY: {
        status: 403,
        code: 4033,
        title: 'FORBIDDEN',
        message: 'Only superadmin can update the user role',
    },
    PROFILE_UPDATE_FAILED: {
        status: 500,
        code: 5001,
        title: 'SERVER ERROR',
        message: 'Failed to update user profile',
    },
    INVALID_QUERY_PARAM: {
        status: 400,
        code: 4002,
        title: 'INVALID FORMAT',
        message: 'Invalid query parameter format',
        source: { parameter: 'page | limit' },
    },
    NO_TOKEN_PROVIDED: {
        status: 401,
        code: 4011,
        title: 'UNAUTHORIZED',
        message: 'No token provided, please log in to continue',
        source: { parameter: 'authorization' },
    },
    INVALID_TOKEN: {
        status: 401,
        code: 4012,
        title: 'UNAUTHORIZED',
        message: 'Invalid or malformed token',
        source: { parameter: 'authorization' },
    },
    EXPIRED_TOKEN: {
        status: 401,
        code: 4013,
        title: 'UNAUTHORIZED',
        message: 'Token has expired, please log in again',
        source: { parameter: 'authorization' },
    },
    MISSING_REGISTRATION_FIELDS: {
        status: 400,
        code: 4003,
        title: 'INVALID INPUT',
        message: 'Please fill all the required fields',
        source: { parameter: 'firstName | lastName | email | password' },
    },
    USER_ALREADY_EXISTS: {
        status: 400,
        code: 4004,
        title: 'CONFLICT',
        message: 'User already exists with this email',
        source: { parameter: 'email' },
    },
    USER_ROLE_ALREADY_EXISTS: {
        status: 400,
        code: 4005,
        title: 'CONFLICT',
        message: 'A user with this role already exists',
        source: { parameter: 'role' },
    },

    MISSING_LOGIN_CREDENTIALS: {
        status: 400,
        code: 4005,
        title: 'INVALID INPUT',
        message: 'Please provide email and password',
        source: { parameter: 'email | password' },
    },
    INVALID_LOGIN_CREDENTIALS: {
        status: 401,
        code: 4014,
        title: 'UNAUTHORIZED',
        message: 'Invalid email or password',
        source: { parameter: 'email | password' },
    },
    MISSING_EMAIL: {
        status: 400,
        code: 4006,
        title: 'INVALID INPUT',
        message: 'Please provide a valid email',
        source: { parameter: 'email' },
    },
    EMAIL_NOT_FOUND: {
        status: 404,
        code: 4042,
        title: 'NOT FOUND',
        message: 'User with this email does not exist',
        source: { parameter: 'email' },
    },
    MISSING_PASSWORD_UPDATE_FIELDS: {
        status: 400,
        code: 4007,
        title: 'INVALID INPUT',
        message: 'Email and new password are required',
        source: { parameter: 'email | newPassword' },
    },
};

export const formatError = (error: ErrorResponse): ErrorFormat => ({
    errors: [error],
});
