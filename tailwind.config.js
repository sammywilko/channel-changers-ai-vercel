/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
        "!./node_modules/**",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: '#0f172a',
                foreground: '#f8fafc',
                primary: {
                    DEFAULT: '#D4AF37', // Premium Gold
                    foreground: '#0f172a',
                },
                secondary: {
                    DEFAULT: '#1e293b',
                    foreground: '#f8fafc',
                },
                muted: {
                    DEFAULT: '#334155',
                    foreground: '#94a3b8',
                },
                accent: {
                    DEFAULT: '#1e293b',
                    foreground: '#D4AF37',
                },
                destructive: {
                    DEFAULT: '#ef4444',
                    foreground: '#f8fafc',
                },
                border: '#334155',
                input: '#334155',
                ring: '#D4AF37',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'pulse-slow': 'pulse 3s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
