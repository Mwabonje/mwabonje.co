import { createClient } from '@insforge/sdk';

// Trigger rebuild: 2026-03-01 20:58
// Robust environment variable resolution for both dev and prod (Netlify)
const apiKey = import.meta.env.VITE_INSFORGE_API_KEY || (typeof process !== 'undefined' ? process.env.VITE_INSFORGE_API_KEY : 'ik_1fcf8fb6d99b0b21df0b34e78fbf7808');
const baseUrl = import.meta.env.VITE_INSFORGE_API_BASE_URL || (typeof process !== 'undefined' ? process.env.VITE_INSFORGE_API_BASE_URL : 'https://9se6drpg.us-east.insforge.app');

console.log('InsForge Production Debug:', {
    hasKey: !!apiKey,
    baseUrl: baseUrl,
    isLocalhost: baseUrl?.includes('localhost')
});

if (!apiKey || !baseUrl) {
    console.warn('InsForge credentials missing. Falling back to defaults.');
}

export const insforge = createClient({
    baseUrl: baseUrl || 'https://9se6drpg.us-east.insforge.app', // Explicit fallback to production
    anonKey: apiKey || 'ik_1fcf8fb6d99b0b21df0b34e78fbf7808',
});
