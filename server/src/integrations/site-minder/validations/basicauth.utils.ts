// utils/basic-auth.util.ts

export interface BasicAuthCredentials {
    username: string;
    password: string;
}

export function decodeBasicAuth(
    authHeader: string
): BasicAuthCredentials | null {
    try {
        // Header format: "Basic dXNlcjpwYXNzd29yZA=="
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return null;
        }

        const base64Encoded = authHeader.slice(6); // remove "Basic "
        const decoded = Buffer.from(base64Encoded, 'base64').toString('utf-8');
        // decoded = "username:password"

        const colonIndex = decoded.indexOf(':');
        if (colonIndex === -1) return null;

        return {
            username: decoded.substring(0, colonIndex),
            password: decoded.substring(colonIndex + 1),
        };
    } catch {
        return null;
    }
}
