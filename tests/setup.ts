import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

// Mock sessionStorage
const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
});

// Mock crypto.randomUUID
Object.defineProperty(crypto, 'randomUUID', {
    value: () => 'test-uuid-1234',
});

// Mock Supabase
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                order: vi.fn(() => Promise.resolve({ data: [], error: null })),
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
                })),
            })),
            insert: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
                })),
            })),
            update: vi.fn(() => ({
                eq: vi.fn(() => ({
                    select: vi.fn(() => ({
                        single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
                    })),
                })),
            })),
            delete: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ error: null })),
            })),
        })),
        auth: {
            getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
            getUser: vi.fn(() => Promise.resolve({ data: { user: null } })),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
            signInWithPassword: vi.fn(),
            signUp: vi.fn(),
            signOut: vi.fn(),
        },
    },
    getUser: vi.fn(() => Promise.resolve({ id: 'test-user-id' })),
    getSession: vi.fn(() => Promise.resolve(null)),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
}));

// Reset all mocks before each test
beforeEach(() => {
    vi.clearAllMocks();
});
