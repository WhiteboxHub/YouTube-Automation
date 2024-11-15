// const chokidar = require('chokidar');
// const path = require('path');
// const fs = require('fs');
// const uploadVideo = require('./uploader');

// function watchFolder(uploadPath, donePath, auth) {
//     const watcher = chokidar.watch(uploadPath, {
//         persistent: true,
//         ignoreInitial: true,
//         followSymlinks: false,
//         depth: 0,
//         awaitWriteFinish: {
//             stabilityThreshold: 2000,
//             pollInterval: 100,
//         },
//     });

//     watcher.on('add', async (filePath) => {
//         console.log(`File added: ${filePath}`);
//         try {
//             const videoDetails = await uploadVideo(filePath, auth);
//             const videoID = videoDetails.id;
//             console.log(`Video uploaded successfully. YouTube Video ID: ${videoID}`);

//             const doneFilePath = path.join(donePath, path.basename(filePath));
//             fs.renameSync(filePath, doneFilePath);
//             console.log(`Moved uploaded file to: ${doneFilePath}`);
//         } catch (error) {
//             console.error(`Error processing file ${filePath}:`, error);
//         }
//     });

//     watcher.on('error', (error) => {
//         console.error('Error watching folder:', error);
//     });
// }

// module.exports = watchFolder;

// *******-------------working code*********-----------//

// const chokidar = require('chokidar');
// const path = require('path');
// const fs = require('fs');
// const uploadVideo = require('./uploader');

// function watchFolder(uploadPath, donePath, auth) {
//     const watcher = chokidar.watch(uploadPath, {
//         persistent: true,
//         ignoreInitial: true,
//         followSymlinks: false,
//         depth: 0,
//         awaitWriteFinish: {
//             stabilityThreshold: 2000,
//             pollInterval: 100,
//         },
//     });

//     watcher.on('add', async (filePath) => {
//         console.log(`File added: ${filePath}`);
//         try {
//             const videoDetails = await uploadVideo(filePath, auth);
//             const videoID = videoDetails.id;
//             console.log(`Video uploaded successfully. YouTube Video ID: ${videoID}`);

//             const doneFilePath = path.join(donePath, path.basename(filePath));
//             fs.renameSync(filePath, doneFilePath);
//             console.log(`Moved uploaded file to: ${doneFilePath}`);
//         } catch (error) {
//             console.error(`Error processing file ${filePath}:`, error);
//         }
//     });

//     watcher.on('error', (error) => {
//         console.error('Error watching folder:', error);
//     });

// -----------*********************---------------------
// function watchFolder(uploadPath, donePath, auth) {
//     const watcher = chokidar.watch(uploadPath, {
//         persistent: true,
//         ignoreInitial: true,
//         followSymlinks: false,
//         depth: 0,
//         awaitWriteFinish: {
//             stabilityThreshold: 2000,
//             pollInterval: 100,
//         },
//     });

//     watcher.on('add', async (filePath) => {
//         console.log(`File added: ${filePath}`);
//         try {
//             const videoDetails = await uploadVideo(filePath, auth);
//             const videoID = videoDetails.id;
//             console.log(`Video uploaded successfully. YouTube Video ID: ${videoID}`);

//             const doneFilePath = path.join(donePath, path.basename(filePath));
//             fs.renameSync(filePath, doneFilePath);
//             console.log(`Moved uploaded file to: ${doneFilePath}`);
//         } catch (error) {
//             console.error(`Error processing file ${filePath}:`, error);
//         }
//     });

//     watcher.on('error', (error) => {
//         console.error('Error watching folder:', error);
//     });
// }


// module.exports = watchFolder;
// ---------------***************//

// ---------------****************************---------working------------------
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql');
const uploadVideo = require('./uploader');
require('dotenv').config();


// Set up MySQL connection
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};
const connection = mysql.createConnection(dbConfig);

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

            // Check if video has already been uploaded
            const query = 'SELECT COUNT(*) AS count FROM new_recording WHERE filename = ?';
            connection.query(query, [fileName], async (err, results) => {
                if (err) {
                    console.error('Error querying MySQL:', err);
                    return;
                }

                if (results[0].count > 0) {
                    console.log(`Video already uploaded and saved to DB: ${fileName}`);
                    return; // Exit if video already exists
                }

                // Proceed with video upload if not already in DB
                const videoDetails = await uploadVideo(filePath, auth);
                console.log(`Video uploaded successfully. YouTube Video ID: ${videoDetails.id}`);

                // Move file to donePath after upload
                const doneFilePath = path.join(donePath, fileName);
                fs.renameSync(filePath, doneFilePath);
                console.log(`Moved uploaded file to: ${doneFilePath}`);
            });
        } catch (error) {
            console.error(`Error processing file ${filePath}:`, error);
        }
    });

    watcher.on('error', (error) => {
        console.error('Error watching folder:', error);
    });
}

module.exports = watchFolder;
// ---------------****************************---------working------------------


// const chokidar = require('chokidar');
// const path = require('path');
// const fs = require('fs');
// const mysql = require('mysql');
// const uploadVideo = require('./uploader');

// // Set up MySQL connection
// const dbConfig = {
//     host: '35.232.56.51',
//     user: 'whiteboxqa',
//     password: 'Innovapath1',
//     database: 'whiteboxqa',
// };
// const connection = mysql.createConnection(dbConfig);

// // Debounce settings and tracking
// const lastProcessed = {};
// const DEBOUNCE_TIME = 3000; // 3 seconds debounce time
// const currentlyUploading = {};

// function watchFolder(uploadPath, donePath, auth) {
//     const watcher = chokidar.watch(uploadPath, {
//         persistent: true,
//         ignoreInitial: true,
//         followSymlinks: false,
//         depth: 0,
//         awaitWriteFinish: {
//             stabilityThreshold: 2000,
//             pollInterval: 100,
//         },
//     });

//     watcher.on('add', async (filePath) => {
//         const fileName = path.basename(filePath);
//         const currentTime = Date.now();

//         // Debounce logic: Check if the file was processed recently
//         if (
//             lastProcessed[filePath] &&
//             currentTime - lastProcessed[filePath] < DEBOUNCE_TIME
//         ) {
//             console.log(`Skipping file due to debounce: ${fileName}`);
//             return;
//         }

//         // Check if the file is already being uploaded
//         if (currentlyUploading[filePath]) {
//             console.log(`File is already uploading: ${fileName}`);
//             return;
//         }

//         // Mark as uploading and update last processed time
//         currentlyUploading[filePath] = true;
//         lastProcessed[filePath] = currentTime;

//         console.log(`File added: ${filePath}`);

//         try {
//             // Check if video has already been uploaded
//             const query = 'SELECT COUNT(*) AS count FROM new_recording WHERE filename = ?';
//             connection.query(query, [fileName], async (err, results) => {
//                 if (err) {
//                     console.error('Error querying MySQL:', err);
//                     return;
//                 }

//                 if (results[0].count > 0) {
//                     console.log(`Video already uploaded and saved to DB: ${fileName}`);
//                     return; // Exit if video already exists
//                 }

//                 // Proceed with video upload if not already in DB
//                 const videoDetails = await uploadVideo(filePath, auth);
//                 console.log(`Video uploaded successfully. YouTube Video ID: ${videoDetails.id}`);

//                 // Move file to donePath after upload
//                 const doneFilePath = path.join(donePath, fileName);
//                 fs.renameSync(filePath, doneFilePath);
//                 console.log(`Moved uploaded file to: ${doneFilePath}`);

//                 // Save video details to DB
//                 const insertQuery = 'INSERT INTO new_recording (filename, video_id) VALUES (?, ?)';
//                 connection.query(insertQuery, [fileName, videoDetails.id], (err) => {
//                     if (err) {
//                         console.error('Error inserting into MySQL:', err);
//                     } else {
//                         console.log(`Video ID inserted into MySQL for file: ${fileName}`);
//                     }
//                 });
//             });
//         } catch (error) {
//             console.error(`Error processing file ${filePath}:`, error);
//         } finally {
//             // Remove from currently uploading tracker after completion
//             delete currentlyUploading[filePath];
//         }
//     });

//     watcher.on('error', (error) => {
//         console.error('Error watching folder:', error);
//     });
// }

// module.exports = watchFolder;
