import { createClient } from '@insforge/sdk';

const PRODUCTION_URL = 'https://9se6drpg.us-east.insforge.app';
const ANON_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzOTUxNjR9.v5-yWbHc51pr-Hf7Ns590nga4Vn6XSGaeKuppthEmx4';

export const INSFORGE_BASE_URL = import.meta.env.VITE_INSFORGE_API_BASE_URL || PRODUCTION_URL;
export const INSFORGE_API_KEY = import.meta.env.VITE_INSFORGE_API_KEY;

// Standard client using anon key (for public read/write via storage policies)
export const insforge = createClient({
    baseUrl: INSFORGE_BASE_URL,
    anonKey: ANON_JWT,
});

// Admin client using the API key – used for privileged operations like storage listing
export const insforgeAdmin = createClient({
    baseUrl: INSFORGE_BASE_URL,
    anonKey: INSFORGE_API_KEY || ANON_JWT,
});
