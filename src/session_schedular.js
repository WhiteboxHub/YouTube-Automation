const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const watchFolder = require('./session_fileWatcher');
const authenticate = require('./auth');

const instanceConfigs = [
    {
        uploadPath: process.env.SESSION_UPLOAD_PATH || path.join(__dirname, '../uploads/instance1'),
        donePath: process.env.SESSION_DONE_PATH || path.join(__dirname, '../done/instance1'),
    }
];

// async function startSchedulers() {
//     try {
//         const auth = await authenticate();

//         instanceConfigs.forEach((config) => {
//             cron.schedule('* * * * *', () => {
//                 watchFolder(config.uploadPath, config.donePath, auth);
//             });
//         });
//     } catch (error) {
//         console.error('Failed to authenticate:', error);
//     }
// }

// startSchedulers();

async function startSchedulers() {
    try {

        const auth = await authenticate();
        console.log('-----------------------------------session_scheduler is started----------------------------------------')
        instanceConfigs.forEach((config) => {
            // cron.schedule('* * * * *', () => {
            console.log(`Watching folder: ${config.uploadPath}`);
            watchFolder(config.uploadPath, config.donePath, auth);
            // });
        });
    } catch (error) {
        console.error('Failed to authenticate:', error);
    }
}

startSchedulers();


// const cron = require('node-cron');
// const path = require('path');
// const watchFolder = require('./fileWatcher');
// const authenticate = require('./auth');

// const instanceConfigs = [
//     {
//         uploadPath: path.join(__dirname, '../uploads/instance1'),
//         donePath: path.join(__dirname, '../done/instance1'),
//     },
//     {

//         uploadPath: path.join(__dirname, '../uploads/instance2'),
//         donePath: path.join(__dirname, '../done/instance2'),
//     },
// ];

// async function startSchedulers() {
//     try {
//         const auth = await authenticate();

//         instanceConfigs.forEach((config) => {
//             cron.schedule('* * * * *', () => {
//                 watchFolder(config.uploadPath, config.donePath, auth);
//             });
//         });
//     } catch (error) {
//         console.error('Failed to authenticate:', error);
//     }
// }

// startSchedulers();
