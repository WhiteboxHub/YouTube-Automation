
// ---------------****************************---------working------------------




// const chokidar = require('chokidar');
// const path = require('path');
// const fs = require('fs');
// const mysql = require('mysql');
// const uploadVideo = require('./uploader');
// require('dotenv').config();


// // Set up MySQL connection
// const dbConfig = {
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// };
// const connection = mysql.createConnection(dbConfig);

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
//             const fileName = path.basename(filePath);

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
//             });
//         } catch (error) {
//             console.error(`Error processing file ${filePath}:`, error);
//         }
//     });

//     watcher.on('error', (error) => {
//         console.error('Error watching folder:', error);
//     });
// }

// module.exports = watchFolder;






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


// **************************testinomial**********************


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

            if (fileName.startsWith('Class')) {
                // Existing logic for Class files
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

                    const videoDetails = await uploadVideo(filePath, auth);
                    console.log(`Video uploaded successfully. YouTube Video ID: ${videoDetails.id}`);

                    const doneFilePath = path.join(donePath, fileName);
                    fs.renameSync(filePath, doneFilePath);
                    console.log(`Moved uploaded file to: ${doneFilePath}`);
                });
            } else if (fileName.startsWith('Session')) {
                // New logic for Session files
                const query = 'SELECT COUNT(*) AS count FROM new_session WHERE title = ?';
                connection.query(query, [fileName], async (err, results) => {
                    if (err) {
                        console.error('Error querying MySQL:', err);
                        return;
                    }

                    if (results[0].count > 0) {
                        console.log(`Session already uploaded and saved to DB: ${fileName}`);
                        return; // Exit if session already exists
                    }

                    const videoDetails = await uploadVideo(filePath, auth);
                    console.log(`Video uploaded successfully. YouTube Video ID: ${videoDetails.id}`);

                    const doneFilePath = path.join(donePath, fileName);
                    fs.renameSync(filePath, doneFilePath);
                    console.log(`Moved uploaded file to: ${doneFilePath}`);
                });
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





// const chokidar = require('chokidar');
// const path = require('path');
// const fs = require('fs');
// const mysql = require('mysql');
// const uploadVideo = require('./uploader');
// require('dotenv').config();

// // Set up MySQL connection
// const dbConfig = {
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
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

//         // Debounce logic
//         if (
//             lastProcessed[filePath] &&
//             currentTime - lastProcessed[filePath] < DEBOUNCE_TIME
//         ) {
//             console.log(`Skipping file due to debounce: ${fileName}`);
//             return;
//         }

//         if (currentlyUploading[filePath]) {
//             console.log(`File is already uploading: ${fileName}`);
//             return;
//         }

//         currentlyUploading[filePath] = true;
//         lastProcessed[filePath] = currentTime;

//         console.log(`Processing file: ${filePath}`);

//         try {
//             const tableName = fileName.startsWith('Class')
//                 ? 'new_recording'
//                 : fileName.startsWith('Session')
//                 ? 'new_session'
//                 : null;

//             if (!tableName) {
//                 console.warn(`Skipping unrecognized file type: ${fileName}`);
//                 return;
//             }

//             const column = fileName.startsWith('Class') ? 'filename' : 'title';

//             // Check if the file has already been processed
//             const query = `SELECT COUNT(*) AS count FROM ${tableName} WHERE ${column} = ?`;
//             connection.query(query, [fileName], async (err, results) => {
//                 if (err) {
//                     console.error('Error querying MySQL:', err);
//                     return;
//                 }

//                 if (results[0].count > 0) {
//                     console.log(`File already processed and saved to DB: ${fileName}`);
//                     return;
//                 }

//                 // Upload video
//                 const videoDetails = await uploadVideo(filePath, auth);
//                 if (!videoDetails || !videoDetails.id) {
//                     throw new Error('Video upload failed or returned invalid details.');
//                 }

//                 console.log(`Video uploaded successfully. YouTube Video ID: ${videoDetails.id}`);

//                 // Move the file after processing
//                 const doneFilePath = path.join(donePath, fileName);
//                 fs.rename(filePath, doneFilePath, (renameErr) => {
//                     if (renameErr) {
//                         console.error(`Error moving file ${fileName}:`, renameErr);
//                         return;
//                     }
//                     console.log(`Moved uploaded file to: ${doneFilePath}`);
//                 });

//                 // Insert into the appropriate table
//                 const insertQuery = `INSERT INTO ${tableName} (${column}, video_id) VALUES (?, ?)`;
//                 connection.query(insertQuery, [fileName, videoDetails.id], (insertErr) => {
//                     if (insertErr) {
//                         console.error('Error inserting into MySQL:', insertErr);
//                     } else {
//                         console.log(`File inserted into MySQL for table ${tableName}: ${fileName}`);
//                     }
//                 });
//             });
//         } catch (error) {
//             console.error(`Error processing file ${filePath}:`, error);
//         } finally {
//             delete currentlyUploading[filePath];
//         }
//     });

//     watcher.on('error', (error) => {
//         console.error('Error watching folder:', error);
//     });
// }

// module.exports = watchFolder;



// const chokidar = require('chokidar');
// const path = require('path');
// const fs = require('fs');
// const mysql = require('mysql');
// const uploadVideo = require('./uploader');
// require('dotenv').config();

// // MySQL Connection
// const dbConfig = {
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// };
// const connection = mysql.createConnection(dbConfig);

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
//         const fileName = path.basename(filePath);

//         // Dynamic handling for Class and Session files
//         let tableName, columnName;

//         if (fileName.startsWith('Class')) {
//             tableName = 'new_recording';
//             columnName = 'filename';
//         } else if (fileName.startsWith('Session')) {
//             tableName = 'new_session';
//             columnName = 'title';
//         } else {
//             console.log(`Skipping file as it doesn't match required naming convention: ${fileName}`);
//             return; // Skip files that do not start with Class or Session
//         }

//         try {
//             // Check if the file has already been uploaded
//             const query = `SELECT COUNT(*) AS count FROM ${tableName} WHERE ${columnName} = ?`;
//             connection.query(query, [fileName], async (err, results) => {
//                 if (err) {
//                     console.error('Error querying MySQL:', err);
//                     return;
//                 }

//                 if (results[0].count > 0) {
//                     console.log(`${fileName} already exists in ${tableName}`);
//                     return; // Skip if the file is already in the database
//                 }

//                 // Upload the video
//                 const videoDetails = await uploadVideo(filePath, auth);

//                 // Validate the videoDetails object
//                 if (!videoDetails || !videoDetails.id) {
//                     console.error('Upload failed or videoDetails is invalid:', videoDetails);
//                     return; // Stop further processing if upload fails
//                 }

//                 console.log(`Video uploaded successfully. YouTube Video ID: ${videoDetails.id}`);

//                 // Insert record into the database
//                 const insertQuery = `INSERT INTO ${tableName} (${columnName}) VALUES (?)`;
//                 connection.query(insertQuery, [fileName], (insertErr, result) => {
//                     if (insertErr) {
//                         console.error('Error inserting record into MySQL:', insertErr);
//                         return;
//                     }
//                     console.log(`Record inserted into ${tableName}:`, result);

//                     // Move the file to the done folder
//                     const doneFilePath = path.join(donePath, fileName);
//                     try {
//                         fs.renameSync(filePath, doneFilePath);
//                         console.log(`File moved to: ${doneFilePath}`);
//                     } catch (renameErr) {
//                         console.error('Error moving file to done folder:', renameErr);
//                     }
//                 });
//             });
//         } catch (error) {
//             console.error(`Error processing file ${filePath}:`, error);
//         }
//     });

//     watcher.on('error', (error) => {
//         console.error('Error watching folder:', error);
//     });
// }

// module.exports = watchFolder;
