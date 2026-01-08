const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const { uploadToBackup } = require("./backup_uploader");
const { createRecording, createSession, updateRecording, updateSession, getRecordings, getSessions, getBatches, createRecordingBatch, createJobActivityLog } = require("./apiClient");

require("dotenv").config();

// Subject to subjectid mapping
const subjectMapping = {
    SDLC: 65,
    "JIRA-Agile": 4,
    UNIX: 12,
    "HTTP Webservices": 1,
    RestAssured: 23,
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
    "NaturalLanguageProcess(NLP)": 51,
    "Gen AI": 52,
    "ComputerVisionTechnigues(CVT)": 53,
    Docker: 67,
    GitHub: 66,
    RestApi: 68,
};

// --------------------******************session*************************----------------------------------------
async function uploadVideo(filePath, auth) {
    console.log("[PRIMARY] Starting upload process for:", filePath);

    try {
        const youtube = google.youtube({ version: "v3", auth });
        const fileSize = fs.statSync(filePath).size;

        // Extract metadata from file name
        const fileName = path.basename(filePath);
        const parts = fileName.split("_");
        const prefix = parts[0]; // 'Class' or 'Session'

        if (!prefix) {
            console.error("[PRIMARY] Invalid file prefix:", fileName);
            return;
        }

        // Upload video to YouTube (PRIMARY CHANNEL)
        console.log("[PRIMARY] Uploading to primary channel...");
        const res = await youtube.videos.insert(
            {
                part: "snippet,status",
                notifySubscribers: false,
                requestBody: {
                    snippet: {
                        title: fileName,
                        description: fileName,
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
                    console.log(`[PRIMARY] ${Math.round(progress)}% complete`);
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

        if (prefix === "Class") {
            // Process "Class" videos
            const batchId = parts[1];
            const subject = parts[4]?.split(".")[0];
            const subjectId = subjectMapping[subject];

            if (!subjectId) {
                console.error("[PRIMARY] Invalid subject:", subject);
                return;
            }

            const batchname = `${currentDate.getFullYear()}-${String(
                currentDate.getMonth() + 1
            ).padStart(2, "0")}`;
            const classDate = `${currentDate.getFullYear()}-${String(
                currentDate.getMonth() + 1
            ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

            // Create recording via API (matching original INSERT statement)
            const recordingData = {
                batchname: batchname,
                description: fileName,
                type: "class",
                classdate: classDate,
                link: youtubeLink,
                videoid: videoId,
                subject: subject,
                filename: fileName,
                lastmoddatetime: lastModDateTime,
                new_subject_id: subjectId,
            };

            let createdRecording;
            try {
                createdRecording = await createRecording(recordingData);
                console.log("[PRIMARY] Class recording created via API:", createdRecording);
                console.log("[PRIMARY] Class video uploaded and record inserted successfully.");

                // Create recording-batch mapping
                try {
                    console.log(`[MAPPING] Looking up batch with name: ${batchname}`);
                    const batches = await getBatches(batchname);

                    console.log(`[MAPPING] API returned ${batches?.length || 0} batches`);
                    if (batches && batches.length > 0) {
                        console.log(`[MAPPING] First batch:`, JSON.stringify(batches[0], null, 2));
                    }

                    if (batches && batches.length > 0) {
                        const batch = batches[0];

                        // Validate batch has batchid
                        if (!batch.batchid) {
                            console.error(`[MAPPING] ERROR: Batch found but has no 'batchid' field!`);
                            console.error(`[MAPPING] Batch object:`, batch);
                            console.warn("[MAPPING] Recording created but not mapped - batch missing batchid");
                        } else {
                            console.log(`[MAPPING] Found batch ID: ${batch.batchid}`);

                            const mappingData = {
                                recording_id: createdRecording.id,
                                batch_id: batch.batchid
                            };

                            console.log(`[MAPPING] Creating mapping:`, JSON.stringify(mappingData, null, 2));
                            const recordingBatch = await createRecordingBatch(mappingData);
                            console.log("[MAPPING] Recording mapped to batch successfully:", recordingBatch);
                        }
                    } else {
                        console.warn(`[MAPPING] No batch found with name: ${batchname}`);
                        console.warn("[MAPPING] Recording created but not mapped to any batch");
                    }
                } catch (mappingError) {
                    console.error("[MAPPING] Failed to create recording-batch mapping:", mappingError.message);
                    console.error("[MAPPING] Recording was created but mapping failed");
                }
            } catch (apiError) {
                console.error("[PRIMARY] Failed to create recording via API:", apiError.message);
                throw apiError;
            }

            // Upload to BACKUP CHANNEL for Class videos
            try {
                console.log("[BACKUP] Starting backup upload for Class video...");
                const backupUrl = await uploadToBackup(
                    filePath,
                    fileName,
                    fileName,
                    'class'
                );

                // Update backup_url via API
                try {
                    const recordings = await getRecordings(videoId);
                    if (recordings && recordings.length > 0) {
                        const recordingId = recordings[0].id;
                        await updateRecording(recordingId, { backup_url: backupUrl });
                        console.log("[BACKUP] Backup URL updated via API:", backupUrl);
                    }
                } catch (updateError) {
                    console.error("[BACKUP] Error updating backup_url via API:", updateError);
                }

                console.log("[BACKUP] Backup process completed successfully for Class video");

            } catch (backupError) {
                console.log("[BACKUP] Backup upload failed (non-critical):", backupError.message);
                console.log("[PRIMARY] Primary workflow completed successfully despite backup failure");
            }

            // Log job activity for Class
            try {
                const employeeId = process.env.EMPLOYEE_ID ? parseInt(process.env.EMPLOYEE_ID, 10) : null;
                const currentDate = new Date().toISOString().slice(0, 10);

                const logData = {
                    job_id: 123, // Bot Class Recording Uploader
                    employee_id: employeeId,
                    activity_date: currentDate,
                    activity_count: 1,
                    notes: fileName
                };

                console.log("[JOB_LOG] Creating job activity log for Class...");
                await createJobActivityLog(logData);
                console.log("[JOB_LOG] Job activity logged successfully");
            } catch (logError) {
                console.error("[JOB_LOG] Failed to log job activity:", logError.message);
                console.error("[JOB_LOG] Upload was successful but logging failed (non-critical)");
            }

        } else if (prefix === "Session") {
            // Process "Session" videos
            const sessionDate = parts[1];
            const subjectId = parseInt(parts[2], 10);
            const instructorName = parts[3];
            let sessionType = parts[4]?.split(".")[0];

            if (!sessionDate || !subjectId || !sessionType) {
                console.error("[PRIMARY] Invalid session metadata:", fileName);
                return;
            }

            const lowerTitle = fileName.toLowerCase();

            if (lowerTitle.includes("group")) {
                sessionType = "Group Mock";
            } else if (lowerTitle.includes("individual")) {
                sessionType = "Individual Mock";
            } else if (lowerTitle.includes("resume")) {
                sessionType = "Resume Session";
            } else if (lowerTitle.includes("prep") || lowerTitle.includes("preparation")) {
                sessionType = "Interview Prep";
            } else if (lowerTitle.includes("job")) {
                sessionType = "Job Help";
            } else if (lowerTitle.includes("internal")) {
                sessionType = "Internal Sessions";
            } else {
                sessionType = "Misc"; // Default
            }

            // Create session via API (matching original INSERT statement)
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

            try {
                const createdSession = await createSession(sessionData);
                console.log("[PRIMARY] Session created via API:", createdSession);
                console.log("[PRIMARY] Session video uploaded and record inserted successfully.");
            } catch (apiError) {
                console.error("[PRIMARY] Failed to create session via API:", apiError.message);
                throw apiError;
            }

            try {
                console.log("[BACKUP] Starting backup upload for Session video...");
                const backupUrl = await uploadToBackup(
                    filePath,
                    fileName,
                    fileName,
                    'session'
                );

                // Update backup_url via API
                try {
                    const sessions = await getSessions(fileName);
                    if (sessions && sessions.length > 0) {
                        const sessionId = sessions[0].sessionid;
                        await updateSession(sessionId, { backup_url: backupUrl });
                        console.log("[BACKUP] Backup URL updated via API:", backupUrl);
                    }
                } catch (updateError) {
                    console.error("[BACKUP] Error updating backup_url via API:", updateError);
                }

                console.log("[BACKUP] Backup process completed successfully for Session video");

            } catch (backupError) {
                console.log("[BACKUP] Backup upload failed (non-critical):", backupError.message);
                console.log("[PRIMARY] Primary workflow completed successfully despite backup failure");
            }

            // Log job activity for Session
            try {
                const employeeId = process.env.EMPLOYEE_ID ? parseInt(process.env.EMPLOYEE_ID, 10) : null;
                const currentDate = new Date().toISOString().slice(0, 10);

                const logData = {
                    job_id: 123, // Bot Class Recording Uploader (same for sessions)
                    employee_id: employeeId,
                    activity_date: currentDate,
                    activity_count: 1,
                    notes: fileName
                };

                console.log("[JOB_LOG] Creating job activity log for Session...");
                await createJobActivityLog(logData);
                console.log("[JOB_LOG] Job activity logged successfully");
            } catch (logError) {
                console.error("[JOB_LOG] Failed to log job activity:", logError.message);
                console.error("[JOB_LOG] Upload was successful but logging failed (non-critical)");
            }

        } else {
            console.error("[PRIMARY] Unknown file prefix:", prefix);
            return;
        }

        return { id: videoId, link: youtubeLink };
    } catch (error) {
        console.error("[PRIMARY] Error in uploadVideo:", error);
        throw error;
    }
}

module.exports = uploadVideo;
