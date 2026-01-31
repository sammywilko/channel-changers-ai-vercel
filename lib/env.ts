/**
 * Environment Configuration with Zod Validation
 * Validates required environment variables on startup with type safety.
 */
import { z } from 'zod';

// Client-side environment schema (safe to expose)
const clientEnvSchema = z.object({
    SUPABASE_URL: z
        .string()
        .url('SUPABASE_URL must be a valid URL')
        .min(1, 'SUPABASE_URL is required'),
    SUPABASE_ANON_KEY: z
        .string()
        .min(1, 'SUPABASE_ANON_KEY is required'),
});

// Server-side environment schema (never expose to client)
const serverEnvSchema = z.object({
    GEMINI_API_KEY: z
        .string()
        .min(1, 'GEMINI_API_KEY is required for AI features'),
});

// Parse environment with helpful error messages
const parseEnv = <T extends z.ZodSchema>(
    schema: T,
    values: Record<string, string | undefined>,
    context: string
): z.infer<T> | null => {
    const result = schema.safeParse(values);

    if (!result.success) {
        const errors = result.error.issues
            .map(issue => `  • ${issue.path.join('.')}: ${issue.message}`)
            .join('\n');

        console.warn(
            `⚠️ ${context} environment validation failed:\n${errors}\n` +
            'Create a .env.local file with the required variables.'
        );
        return null;
    }

    return result.data;
};

// Client environment (used in browser)
const clientEnvValues = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
};

const parsedClientEnv = parseEnv(clientEnvSchema, clientEnvValues, 'Client');

// Type-safe environment access
export const env = {
    get supabaseUrl(): string {
        return parsedClientEnv?.SUPABASE_URL || '';
    },
    get supabaseAnonKey(): string {
        return parsedClientEnv?.SUPABASE_ANON_KEY || '';
    },
    get isValid(): boolean {
        return parsedClientEnv !== null;
    },
};

// Validate on module load (development warning only)
export const validateEnv = (): boolean => {
    return parsedClientEnv !== null;
};

// For server-side validation (call from server/index.js)
export const validateServerEnv = (envVars: Record<string, string | undefined>): boolean => {
    const fullSchema = clientEnvSchema.merge(serverEnvSchema);
    const result = parseEnv(fullSchema, envVars, 'Server');
    return result !== null;
};

// Export schemas for external use
export { clientEnvSchema, serverEnvSchema };

export default env;
