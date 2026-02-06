const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const { uploadToBackup } = require("./backup_uploader");
const {
    createRecording,
    createSession,
    updateRecording,
    updateSession,
    getRecordings,
    getSessions,
    getBatches,
    createRecordingBatch,
    createJobActivityLog
} = require("./apiClient");

require("dotenv").config();

// Subject to subjectid mapping
const subjectMapping = {
    SDLC: 65,
    "JIRA-Agile": 4,
    UNIX: 12,
    "HTTP Webservices": 1,
    RestAssured: 23,
    NOSQL: 5,
    MYSQL: 5,
    SQL1: 5,
    SQL2: 5,
    SQL3: 5,
    SQL4: 5,
    SQL5: 5,
    Python: 10,
    HTML: 64,
    HTML5: 29,
    CSS: 6,
    "Tailwind CSS": 46,
    DOM: 47,
    ReactJS: 42,
    Router: 48,
    Redux: 27,
    Webpack: 36,
    NextJS: 49,
    Cypress: 11,
    GraphQL: 13,
    MongoDB: 7,
    NodeJS: 34,
    ExpressJS: 35,
    ReactNative: 43,
    "Software Architecture": 2,
    NumPy: 54,
    Pandas: 55,
    Matplotlib: 63,
    EssentialMathForML: 56,
    SuperivisedLearningAlgorithms: 57,
    UnsupervisedLearningAlgorithms: 58,
    "ReinforcementLearning ": 62,
    NeuralNetwork: 60,
    DeepLearning: 61,
    NLP: 51,
    "Gen AI": 52,
    "ComputerVisionTechnigues(CVT)": 53,
    Docker: 67,
    "Git and GitHub": 66,
    RestApi: 68,
    Pytorch: 52,
    ML: 54,
    "Scikit Learn": 56,
    "Deep Learning": 52,
    Kubernetes: 52,
    Jenkins: 54,
    FastAPI: 56,
    AWS: 52,
    Pydantic: 52,
    MLOps: 56,
};

async function uploadVideo(filePath, auth) {
    console.log("[UPLOAD] Starting upload process for:", filePath);

    try {
        const youtube = google.youtube({ version: "v3", auth });
        const fileSize = fs.statSync(filePath).size;
        const fileName = path.basename(filePath);
        const parts = fileName.split("_");
        const prefix = parts[0]; // 'Class' or 'Session'

        if (!prefix) {
            console.error("[UPLOAD] Invalid file prefix:", fileName);
            return;
        }

        // --- YouTube Title Logic ---
        let youtubeTitle = fileName;
        let description = fileName;

        if (prefix === "Class") {
            // Logic from uploader.js
            const titleParts = [...parts.slice(0, 2), ...parts.slice(3, -1)];
            youtubeTitle = titleParts.join(" ").replace(/_/g, " ");
            description = parts.slice(0, -1).join("_");
        }

        if (youtubeTitle.length > 100) {
            youtubeTitle = youtubeTitle.substring(0, 100);
        }

        // --- Upload to Primary YouTube Channel ---
        console.log("[PRIMARY] Uploading to primary channel...");
        const res = await youtube.videos.insert(
            {
                part: "snippet,status",
                notifySubscribers: false,
                requestBody: {
                    snippet: {
                        title: youtubeTitle,
                        description: description,
                    },
                    status: {
                        privacyStatus: "unlisted",
                    },
                },
                media: {
                    body: fs.createReadStream(filePath),
                },
            },
            {
                onUploadProgress: (evt) => {
                    const progress = (evt.bytesRead / fileSize) * 100;
                    console.log(`[PRIMARY] Upload progress: ${Math.round(progress)}%`);
                },
            }
        );

        if (!res.data || !res.data.id) {
            throw new Error("YouTube upload failed: No video ID returned");
        }

        const videoId = res.data.id;
        const youtubeLink = `https://www.youtube.com/watch?v=${videoId}`;
        const currentDate = new Date();
        const lastModDateTime = currentDate.toISOString().slice(0, 10);

        console.log("[PRIMARY] Upload complete. Video ID:", videoId);

        // --- Process by Prefix ---
        if (prefix === "Class") {
            // CLASS Logic
            const classDate = parts[1];
            const batchSuffix = parts[parts.length - 1].split(".")[0];
            const subject = parts[4];
            const subjectId = subjectMapping[subject];

            if (!subjectId) {
                console.error("[CLASS] Invalid subject:", subject);
                return;
            }

            // 1. Upload to BACKUP first for Class
            let backupUrl = null;
            try {
                console.log("[BACKUP] Starting backup upload for Class...");
                backupUrl = await uploadToBackup(filePath, youtubeTitle, description, "class");
                console.log("[BACKUP] Backup successful:", backupUrl);
            } catch (backupErr) {
                console.error("[BACKUP] Backup failed:", backupErr.message);
            }

            // 2. Create Recording Record
            const recordingData = {
                description: description,
                type: "class",
                classdate: classDate,
                link: youtubeLink,
                videoid: videoId,
                backup_url: backupUrl,
                subject: subject,
                filename: fileName, // Using full fileName for consistency
                lastmoddatetime: lastModDateTime,
                new_subject_id: subjectId,
            };

            const createdRecording = await createRecording(recordingData);
            console.log("[CLASS] Recording record created");

            // 3. Batch Mapping
            try {
                const batches = await getBatches(batchSuffix);
                if (batches && batches.length > 0 && batches[0].batchid) {
                    await createRecordingBatch({
                        recording_id: createdRecording.id,
                        batch_id: batches[0].batchid
                    });
                    console.log("[CLASS] Mapped to batch:", batchSuffix);
                }
            } catch (mappingErr) {
                console.error("[CLASS] Mapping failed:", mappingErr.message);
            }

        } else if (prefix === "Session") {
            // SESSION Logic
            const sessionDate = parts[1];
            const subjectId = parseInt(parts[2], 10);
            const instructorName = parts[3];
            let sessionType = "Misc";

            const lowerTitle = fileName.toLowerCase();
            if (lowerTitle.includes("group")) sessionType = "Group Mock";
            else if (lowerTitle.includes("individual")) sessionType = "Individual Mock";
            else if (lowerTitle.includes("resume")) sessionType = "Resume Session";
            else if (lowerTitle.includes("prep") || lowerTitle.includes("preparation")) sessionType = "Interview Prep";
            else if (lowerTitle.includes("job")) sessionType = "Job Help";
            else if (lowerTitle.includes("internal")) sessionType = "Internal Sessions";

            // 1. Create Session Record
            const sessionData = {
                title: fileName,
                status: "Completed",
                sessiondate: sessionDate,
                type: sessionType,
                subject: instructorName,
                link: youtubeLink,
                videoid: videoId,
                lastmoddatetime: lastModDateTime,
                subject_id: subjectId,
            };

            const createdSession = await createSession(sessionData);
            console.log("[SESSION] Session record created");

            // 2. Upload to BACKUP and update
            try {
                console.log("[BACKUP] Starting backup upload for Session...");
                const backupUrl = await uploadToBackup(filePath, fileName, fileName, "session");
                const sessionId = createdSession.sessionid || createdSession.id;
                if (sessionId) {
                    await updateSession(sessionId, { backup_url: backupUrl });
                    console.log("[BACKUP] Updated session with backup URL");
                }
            } catch (backupErr) {
                console.error("[BACKUP] Backup failed:", backupErr.message);
            }
        }

        // --- Job Activity Logging (Shared) ---
        try {
            const employeeId = process.env.EMPLOYEE_ID ? parseInt(process.env.EMPLOYEE_ID, 10) : 52;
            await createJobActivityLog({
                job_id: 123,
                employee_id: employeeId,
                activity_date: lastModDateTime,
                activity_count: 1,
                notes: fileName
            });
            console.log("[JOB_LOG] Activity logged");
        } catch (logErr) {
            console.error("[JOB_LOG] Logging failed:", logErr.message);
        }

        return { id: videoId, link: youtubeLink };
    } catch (error) {
        console.error("[UPLOAD] Fatal error in uploadVideo:", error);
        throw error;
    }
}

module.exports = uploadVideo;
