const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const watchFolder = require('./unifiedFileWatcher');
const authenticate = require('./auth');

async function startApp() {
    try {
        console.log('------------------------------------------------------------');
        console.log('      YOUTUBE AUTOMATION - UNIFIED SCHEDULER STARTED        ');
        console.log('------------------------------------------------------------');

        const auth = await authenticate();

        // Define which folder to watch. 
        // We use a single input folder but since the logic is unified, 
        // it can handle both Class and Session files in that same folder.

        const uploadPath = process.env.WATCH_UPLOAD_PATH || path.join(__dirname, '../uploads');
        const donePath = process.env.WATCH_DONE_PATH || path.join(__dirname, '../done');

        console.log(`[APP] Monitoring folder: ${uploadPath}`);
        console.log(`[APP] Moving finished files to: ${donePath}`);

        watchFolder(uploadPath, donePath, auth);

        console.log('[APP] System is active and waiting for files...');

    } catch (error) {
        console.error('[APP] Failed to start:', error);
    }
}

startApp();
