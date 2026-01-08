// YouTube-Automation/src/session_fileWatcher.js



// **************************for sessions recordings**********************



const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const uploadVideo = require('./session_uploader');
const { getRecordings, getSessions } = require('./apiClient');
require('dotenv').config();

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
        console.log(`File added: ${filePath}`);

        try {
            const fileName = path.basename(filePath);

            if (fileName.startsWith('Class')) {
                // Check for existing Class recording via API
                try {
                    const recordings = await getRecordings(fileName);
                    const existingRecording = recordings.find(r => r.filename === fileName);

                    if (existingRecording) {
                        console.log(`Video already uploaded and saved to DB: ${fileName}`);
                        return; // Exit if video already exists
                    }
                } catch (apiError) {
                    console.error('Error checking for existing recording via API:', apiError.message);
                    // Continue with upload even if API check fails
                }

                const videoDetails = await uploadVideo(filePath, auth);
                console.log(`Video uploaded successfully. YouTube Video ID: ${videoDetails.id}`);

                const doneFilePath = path.join(donePath, fileName);
                fs.renameSync(filePath, doneFilePath);
                console.log(`Moved uploaded file to: ${doneFilePath}`);
            } else if (fileName.startsWith('Session')) {
                // Check for existing Session via API
                try {
                    const sessions = await getSessions(fileName);
                    const existingSession = sessions.find(s => s.title === fileName);

                    if (existingSession) {
                        console.log(`Session already uploaded and saved to DB: ${fileName}`);
                        return; // Exit if session already exists
                    }
                } catch (apiError) {
                    console.error('Error checking for existing session via API:', apiError.message);
                    // Continue with upload even if API check fails
                }

                const videoDetails = await uploadVideo(filePath, auth);
                console.log(`Video uploaded successfully. YouTube Video ID: ${videoDetails.id}`);

                const doneFilePath = path.join(donePath, fileName);
                fs.renameSync(filePath, doneFilePath);
                console.log(`Moved uploaded file to: ${doneFilePath}`);
            }
        } catch (error) {
            console.error(`Error processing file ${filePath}:`, error);
        }
    });

    watcher.on('error', (error) => {
        console.error('Error watching folder:', error);
    });

}

module.exports = watchFolder;


// ***************************************-------------------------------*********************************************





