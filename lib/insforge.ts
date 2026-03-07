import { createClient } from '@insforge/sdk';

// The anon JWT is used for client-side requests (including storage uploads)
// The admin API key is used for privileged database access
const PRODUCTION_URL = 'https://9se6drpg.us-east.insforge.app';
const ANON_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzOTUxNjR9.v5-yWbHc51pr-Hf7Ns590nga4Vn6XSGaeKuppthEmx4';

const baseUrl = import.meta.env.VITE_INSFORGE_API_BASE_URL || PRODUCTION_URL;
const apiKey = import.meta.env.VITE_INSFORGE_API_KEY;

console.log('InsForge Init:', { 
  baseUrl, 
  isProduction: baseUrl === PRODUCTION_URL,
  hasApiKey: !!apiKey
});

export const insforge = createClient({
    baseUrl: baseUrl || PRODUCTION_URL,
    anonKey: apiKey || ANON_JWT,
});
