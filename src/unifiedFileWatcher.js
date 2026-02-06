const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const uploadVideo = require('./unifiedUploader');
const { getRecordings, getSessions } = require('./apiClient');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

function watchFolder(uploadPath, donePath, auth) {
    const watcher = chokidar.watch(uploadPath, {
        persistent: true,
        ignoreInitial: true,
        followSymlinks: false,
        depth: 0,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100,
        },
    });

    watcher.on('add', async (filePath) => {
        console.log(`[WATCHER] File added: ${filePath}`);

        try {
            const fileName = path.basename(filePath);

            // 1. Detect Type
            const isClass = fileName.startsWith('Class');
            const isSession = fileName.startsWith('Session');

            if (!isClass && !isSession) {
                console.log(`[WATCHER] Unknown file type (doesn't start with Class or Session): ${fileName}`);
                return;
            }

            // 2. Duplicate Check via API
            try {
                if (isClass) {
                    const recordings = await getRecordings(fileName);
                    if (recordings.some(r => r.filename === fileName)) {
                        console.log(`[WATCHER] Class already exists in DB: ${fileName}`);
                        return;
                    }
                } else if (isSession) {
                    const sessions = await getSessions(fileName);
                    if (sessions.some(s => s.title === fileName)) {
                        console.log(`[WATCHER] Session already exists in DB: ${fileName}`);
                        return;
                    }
                }
            } catch (apiError) {
                console.error('[WATCHER] API check failed, proceeding anyway:', apiError.message);
            }

            // 3. Process Upload
            const result = await uploadVideo(filePath, auth);
            console.log(`[WATCHER] Uploaded: ${fileName}. ID: ${result.id}`);

            // 4. Move to Done
            if (!fs.existsSync(donePath)) {
                fs.mkdirSync(donePath, { recursive: true });
            }
            const doneFilePath = path.join(donePath, fileName);
            fs.renameSync(filePath, doneFilePath);
            console.log(`[WATCHER] Moved to: ${doneFilePath}`);

        } catch (error) {
            console.error(`[WATCHER] Error processing ${filePath}:`, error);
        }
    });

    watcher.on('error', (error) => {
        console.error('[WATCHER] Error:', error);
    });

    return watcher;
}

module.exports = watchFolder;
