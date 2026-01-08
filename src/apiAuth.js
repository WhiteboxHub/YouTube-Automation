const axios = require('axios');
const qs = require('qs');
require('dotenv').config();

// Configuration
const API_BASE_URL = process.env.WBL_API_BASE_URL || 'https://whitebox-learning.com/api';
const WBL_EMAIL = process.env.WBL_EMAIL;
const WBL_PASSWORD = process.env.WBL_PASSWORD;

// In-memory token storage
let cachedToken = null;
let tokenExpiry = null;

/**
 * Authenticate with WhiteBox Learning API and get JWT token
 * @returns {Promise<string>} JWT access token
 */
async function authenticate() {
    try {
        console.log('[AUTH] Authenticating with WhiteBox Learning API...');

        if (!WBL_EMAIL || !WBL_PASSWORD) {
            throw new Error('WBL_EMAIL and WBL_PASSWORD must be set in environment variables');
        }

        // Prepare form data for OAuth2PasswordRequestForm
        const formData = qs.stringify({
            username: WBL_EMAIL,
            password: WBL_PASSWORD,
            grant_type: 'password'
        });

        const response = await axios.post(
            `${API_BASE_URL}/login`,
            formData,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        if (!response.data || !response.data.access_token) {
            throw new Error('No access token received from API');
        }

        const token = response.data.access_token;

        // Cache token for 50 minutes (assuming 60-minute expiry)
        cachedToken = token;
        tokenExpiry = Date.now() + (50 * 60 * 1000);

        console.log('[AUTH] Authentication successful');
        console.log('[AUTH] Token type:', response.data.token_type);
        console.log('[AUTH] Team:', response.data.team);
        console.log('[AUTH] Login count:', response.data.login_count);

        return token;
    } catch (error) {
        console.error('[AUTH] Authentication failed:', error.message);
        if (error.response) {
            console.error('[AUTH] Response status:', error.response.status);
            console.error('[AUTH] Response data:', error.response.data);
        }
        throw error;
    }
}

/**
 * Get valid JWT token (from cache or by authenticating)
 * @returns {Promise<string>} Valid JWT access token
 */
async function getAuthToken() {
    // Check if we have a valid cached token
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
        console.log('[AUTH] Using cached token');
        return cachedToken;
    }

    // Token expired or doesn't exist, authenticate
    console.log('[AUTH] Token expired or not found, re-authenticating...');
    return await authenticate();
}

/**
 * Clear cached token (useful for testing or forcing re-authentication)
 */
function clearToken() {
    cachedToken = null;
    tokenExpiry = null;
    console.log('[AUTH] Token cache cleared');
}

module.exports = {
    getAuthToken,
    clearToken,
    authenticate
};
