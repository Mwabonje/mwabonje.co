import { createClient } from '@insforge/sdk';

const apiKey = import.meta.env.VITE_INSFORGE_API_KEY;
const baseUrl = import.meta.env.VITE_INSFORGE_API_BASE_URL;

if (!apiKey || !baseUrl) {
    console.warn('InsForge credentials missing in environment variables.');
}

export const insforge = createClient({
    baseUrl: baseUrl || '',
    anonKey: apiKey || '',
});
