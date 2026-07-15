const axios = require('axios');
const { getAuthToken } = require('./apiAuth');
require('dotenv').config();

// Configuration
const API_BASE_URL = process.env.WBL_API_BASE_URL || 'https://whitebox-learning.com/api';

/**
 * Create axios instance with authentication
 * @returns {Promise<axios.AxiosInstance>}
 */
async function createAuthenticatedClient() {
    const token = await getAuthToken();

    return axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
}

/**
 * Create a new recording via API
 * @param {Object} recordingData - Recording data matching RecordingCreate schema
 * @returns {Promise<Object>} Created recording object
 */
async function createRecording(recordingData) {
    try {
        console.log('[API] Creating recording via API...');
        console.log('[API] Recording data:', JSON.stringify(recordingData, null, 2));

        const client = await createAuthenticatedClient();
        const response = await client.post('/recordings', recordingData);

        console.log('[API] Recording created successfully');
        console.log('[API] Response:', JSON.stringify(response.data, null, 2));

        return response.data;
    } catch (error) {
        console.error('[API] Failed to create recording:', error.message);
        if (error.response) {
            console.error('[API] Response status:', error.response.status);
            console.error('[API] Response data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

/**
 * Update a recording via API
 * @param {number} recordingId - Recording ID
 * @param {Object} updateData - Update data matching RecordingUpdate schema
 * @returns {Promise<Object>} Updated recording object
 */
async function updateRecording(recordingId, updateData) {
    try {
        console.log(`[API] Updating recording ${recordingId} via API...`);
        console.log('[API] Update data:', JSON.stringify(updateData, null, 2));

        const client = await createAuthenticatedClient();
        const response = await client.put(`/recordings/${recordingId}`, updateData);

        console.log('[API] Recording updated successfully');
        return response.data;
    } catch (error) {
        console.error(`[API] Failed to update recording ${recordingId}:`, error.message);
        if (error.response) {
            console.error('[API] Response status:', error.response.status);
            console.error('[API] Response data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

/**
 * Get recordings from API
 * @param {string} search - Optional search query (ID, batch name, subject, or description)
 * @returns {Promise<Array>} Array of recording objects
 */
async function getRecordings(search = null) {
    try {
        console.log('[API] Fetching recordings from API...');

        const client = await createAuthenticatedClient();
        const params = search ? { search } : {};
        const response = await client.get('/recordings', { params });

        console.log(`[API] Found ${response.data.length} recordings`);
        return response.data;
    } catch (error) {
        console.error('[API] Failed to fetch recordings:', error.message);
        if (error.response) {
            console.error('[API] Response status:', error.response.status);
            console.error('[API] Response data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

/**
 * Get a specific recording by ID
 * @param {number} recordingId - Recording ID
 * @returns {Promise<Object>} Recording object
 */
async function getRecording(recordingId) {
    try {
        console.log(`[API] Fetching recording ${recordingId} from API...`);

        const client = await createAuthenticatedClient();
        const response = await client.get(`/recordings/${recordingId}`);

        console.log('[API] Recording fetched successfully');
        return response.data;
    } catch (error) {
        console.error(`[API] Failed to fetch recording ${recordingId}:`, error.message);
        if (error.response) {
            console.error('[API] Response status:', error.response.status);
        }
        throw error;
    }
}

/**
 * Create a new session via API
 * @param {Object} sessionData - Session data matching SessionCreate schema
 * @returns {Promise<Object>} Created session object
 */
async function createSession(sessionData) {
    try {
        console.log('[API] Creating session via API...');
        console.log('[API] Session data:', JSON.stringify(sessionData, null, 2));

        const client = await createAuthenticatedClient();
        const response = await client.post('/session', sessionData);

        console.log('[API] Session created successfully');
        console.log('[API] Response:', JSON.stringify(response.data, null, 2));

        return response.data;
    } catch (error) {
        console.error('[API] Failed to create session:', error.message);
        if (error.response) {
            console.error('[API] Response status:', error.response.status);
            console.error('[API] Response data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

/**
 * Update a session via API
 * @param {number} sessionId - Session ID
 * @param {Object} updateData - Update data matching SessionUpdate schema
 * @returns {Promise<Object>} Updated session object
 */
async function updateSession(sessionId, updateData) {
    try {
        console.log(`[API] Updating session ${sessionId} via API...`);
        console.log('[API] Update data:', JSON.stringify(updateData, null, 2));

        const client = await createAuthenticatedClient();
        const response = await client.put(`/session/${sessionId}`, updateData);

        console.log('[API] Session updated successfully');
        return response.data;
    } catch (error) {
        console.error(`[API] Failed to update session ${sessionId}:`, error.message);
        if (error.response) {
            console.error('[API] Response status:', error.response.status);
            console.error('[API] Response data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

/**
 * Get sessions from API
 * @param {string} searchTitle - Optional search query for title
 * @returns {Promise<Array>} Array of session objects
 */
async function getSessions(searchTitle = null) {
    try {
        console.log('[API] Fetching sessions from API...');

        const client = await createAuthenticatedClient();
        const params = searchTitle ? { search_title: searchTitle } : {};
        const response = await client.get('/session', { params });

        console.log(`[API] Found ${response.data.length} sessions`);
        return response.data;
    } catch (error) {
        console.error('[API] Failed to fetch sessions:', error.message);
        if (error.response) {
            console.error('[API] Response status:', error.response.status);
            console.error('[API] Response data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

/**
 * Get a specific session by ID
 * @param {number} sessionId - Session ID
 * @returns {Promise<Object>} Session object
 */
async function getSession(sessionId) {
    try {
        console.log(`[API] Fetching session ${sessionId} from API...`);

        const client = await createAuthenticatedClient();
        const response = await client.get(`/session/${sessionId}`);

        console.log('[API] Session fetched successfully');
        return response.data;
    } catch (error) {
        console.error(`[API] Failed to fetch session ${sessionId}:`, error.message);
        if (error.response) {
            console.error('[API] Response status:', error.response.status);
        }
        throw error;
    }
}

/**
 * Get batches from API
 * @param {string} search - Optional search query for batch name
 * @returns {Promise<Array>} Array of batch objects
 */
async function getBatches(search = null) {
    try {
        console.log('[API] Fetching batches from API...');

        const client = await createAuthenticatedClient();
        const params = search ? { search } : {};
        const response = await client.get('/batch', { params });

        console.log(`[API] Found ${response.data.length} batches`);
        return response.data;
    } catch (error) {
        console.error('[API] Failed to fetch batches:', error.message);
        if (error.response) {
            console.error('[API] Response status:', error.response.status);
            console.error('[API] Response data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

/**
 * Get a specific batch by ID
 * @param {number} batchId - Batch ID
 * @returns {Promise<Object>} Batch object
 */
async function getBatch(batchId) {
    try {
        console.log(`[API] Fetching batch ${batchId} from API...`);

        const client = await createAuthenticatedClient();
        const response = await client.get(`/batch/${batchId}`);

        console.log('[API] Batch fetched successfully');
        return response.data;
    } catch (error) {
        console.error(`[API] Failed to fetch batch ${batchId}:`, error.message);
        if (error.response) {
            console.error('[API] Response status:', error.response.status);
        }
        throw error;
    }
}

/**
 * Create a new batch via API
 * @param {Object} batchData - Batch data matching BatchCreate schema
 * @returns {Promise<Object>} Created batch object
 */
async function createBatch(batchData) {
    try {
        console.log('[API] Creating batch via API...');
        console.log('[API] Batch data:', JSON.stringify(batchData, null, 2));

        const client = await createAuthenticatedClient();
        const response = await client.post('/batch', batchData);

        console.log('[API] Batch created successfully');
        console.log('[API] Response:', JSON.stringify(response.data, null, 2));

        return response.data;
    } catch (error) {
        console.error('[API] Failed to create batch:', error.message);
        if (error.response) {
            console.error('[API] Response status:', error.response.status);
            console.error('[API] Response data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

/**
 * Create a new recording-batch mapping via API
 * @param {Object} recordingBatchData - RecordingBatchCreate schema { recording_id, batch_id }
 * @returns {Promise<Object>} Created recording batch mapping
 */
async function createRecordingBatch(recordingBatchData) {
    try {
        console.log('[API] Creating recording-batch mapping via API...');
        console.log('[API] Mapping data:', JSON.stringify(recordingBatchData, null, 2));

        const client = await createAuthenticatedClient();
        const response = await client.post('/recording-batches', recordingBatchData);

        console.log('[API] Recording-batch mapping created successfully');
        return response.data;
    } catch (error) {
        console.error('[API] Failed to create recording-batch mapping:', error.message);
        if (error.response) {
            console.error('[API] Response status:', error.response.status);
            console.error('[API] Response data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

/**
 * Get all batches for a specific recording
 * @param {number} recordingId - Recording ID
 * @returns {Promise<Array>} Array of recording batch mappings
 */
async function getBatchesForRecording(recordingId) {
    try {
        console.log(`[API] Fetching batches for recording ${recordingId}...`);

        const client = await createAuthenticatedClient();
        const response = await client.get(`/recording-batches/recording/${recordingId}`);

        console.log(`[API] Found ${response.data.length} batch mappings`);
        return response.data;
    } catch (error) {
        console.error(`[API] Failed to fetch batches for recording ${recordingId}:`, error.message);
        if (error.response) {
            console.error('[API] Response status:', error.response.status);
        }
        throw error;
    }
}

/**
 * Get all recordings for a specific batch
 * @param {number} batchId - Batch ID
 * @returns {Promise<Array>} Array of recording batch mappings
 */
async function getRecordingsForBatch(batchId) {
    try {
        console.log(`[API] Fetching recordings for batch ${batchId}...`);

        const client = await createAuthenticatedClient();
        const response = await client.get(`/recording-batches/batch/${batchId}`);

        console.log(`[API] Found ${response.data.length} recording mappings`);
        return response.data;
    } catch (error) {
        console.error(`[API] Failed to fetch recordings for batch ${batchId}:`, error.message);
        if (error.response) {
            console.error('[API] Response status:', error.response.status);
        }
        throw error;
    }
}

/**
 * Delete a recording-batch mapping
 * @param {number} recordingId - Recording ID
 * @param {number} batchId - Batch ID
 * @returns {Promise<Object>} Success response
 */
async function deleteRecordingBatch(recordingId, batchId) {
    try {
        console.log(`[API] Deleting recording-batch mapping (recording: ${recordingId}, batch: ${batchId})...`);

        const client = await createAuthenticatedClient();
        const response = await client.delete(`/recording-batches/${recordingId}/${batchId}`);

        console.log('[API] Recording-batch mapping deleted successfully');
        return response.data;
    } catch (error) {
        console.error('[API] Failed to delete recording-batch mapping:', error.message);
        if (error.response) {
            console.error('[API] Response status:', error.response.status);
        }
        throw error;
    }
}

/**
 * Create a job activity log entry
 * @param {Object} logData - JobActivityLogCreate schema
 * @returns {Promise<Object>} Created job activity log
 */
async function createJobActivityLog(logData) {
    try {
        console.log('[API] Creating job activity log...');
        console.log('[API] Log data:', JSON.stringify(logData, null, 2));

        const client = await createAuthenticatedClient();
        const response = await client.post('/job_activity_logs', logData);

        console.log('[API] Job activity log created successfully');
        return response.data;
    } catch (error) {
        console.error('[API] Failed to create job activity log:', error.message);
        if (error.response) {
            console.error('[API] Response status:', error.response.status);
            console.error('[API] Response data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

/**
 * Search candidates from API by query
 * @param {string} search - Search query for candidate
 * @returns {Promise<Array>} Array of candidate objects
 */
async function searchCandidates(search = null) {
    try {
        console.log(`[API] Searching candidates with query: ${search}...`);
        const client = await createAuthenticatedClient();
        const params = search ? { search } : {};
        const response = await client.get('/candidates', { params });
        console.log(`[API] Found ${response.data.data?.length || 0} candidates`);
        return response.data.data || [];
    } catch (error) {
        console.error('[API] Failed to search candidates:', error.message);
        if (error.response) {
            console.error('[API] Response status:', error.response.status);
            console.error('[API] Response data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

module.exports = {
    createRecording,
    updateRecording,
    getRecordings,
    getRecording,
    createSession,
    updateSession,
    getSessions,
    getSession,
    getBatches,
    getBatch,
    createBatch,
    createRecordingBatch,
    getBatchesForRecording,
    getRecordingsForBatch,
    deleteRecordingBatch,
    createJobActivityLog,
    searchCandidates
};
