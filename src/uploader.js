const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const { uploadToBackup } = require("./backup_uploader");
const { createRecording, updateRecording, getBatches, createRecordingBatch, createJobActivityLog } = require("./apiClient");
require("dotenv").config();

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
  console.log("Starting upload for:", filePath);

  try {
    const youtube = google.youtube({ version: "v3", auth });
    const fileSize = fs.statSync(filePath).size;

    const fileName = path.basename(filePath);
    const parts = fileName.split("_");

    // Extract pieces
    const classDate = parts[1];                  // "2025-11-11"
    const batchNumber = parts[2];                // "12"
    const subject = parts[4];                    // "ML"
    const batchSuffix = parts[parts.length - 1].split(".")[0]; // "_2025-09"
    const subjectId = subjectMapping[subject];

    if (!subjectId) {
      console.error("Invalid subject:", subject);
      return;
    }

    // Clean filename (remove batch suffix)
    const cleanFileName = parts.slice(0, -1).join("_") + path.extname(fileName);

    // Description for DB (remove batch suffix)
    const description = parts.slice(0, -1).join("_");

    // YouTube title (remove batch suffix and number after date)
    const titleParts = [...parts.slice(0, 2), ...parts.slice(3, -1)]; // remove batch number (parts[2])
    let youtubeTitle = titleParts.join(" ").replace(/_/g, " ");

    // Trim to 100 chars if longer
    if (youtubeTitle.length > 100) {
      youtubeTitle = youtubeTitle.substring(0, 100);
    }

    // Upload to YouTube
    console.log("Uploading to YouTube...");
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
          console.log(`Upload progress: ${Math.round(progress)}%`);
        },
      }
    );

    console.log("Upload complete. Video ID:", res.data.id);

    // Prepare data
    const lastModDateTime = new Date().toISOString().slice(0, 10);
    const youtubeLink = `https://www.youtube.com/watch?v=${res.data.id}`;

    // Upload to BACKUP CHANNEL first (before creating DB record)
    let backupUrl = null;
    try {
      console.log("[BACKUP] Starting backup upload...");
      backupUrl = await uploadToBackup(filePath, youtubeTitle, description, "class");
      console.log("[BACKUP] Backup upload successful:", backupUrl);
    } catch (backupError) {
      console.error("[BACKUP] Backup upload failed (continuing without backup):", backupError.message);
    }

    // Create recording with BOTH URLs at once
    const recordingData = {
      description: description,
      type: "class",
      classdate: classDate,
      link: youtubeLink,
      videoid: res.data.id,
      backup_url: backupUrl,  // Include backup URL from the start
      subject: subject,
      filename: cleanFileName,
      lastmoddatetime: lastModDateTime,
      new_subject_id: subjectId,
    };

    let createdRecording;
    try {
      console.log("[RECORDING] Creating recording with both URLs...");
      createdRecording = await createRecording(recordingData);
      console.log("[RECORDING] Recording created successfully with backup URL");
    } catch (apiError) {
      console.error("[RECORDING] Failed to create recording via API:", apiError.message);
      throw apiError;
    }

    // Get batch by name (from batchSuffix) and create recording-batch mapping
    try {
      console.log(`[MAPPING] Looking up batch with name: ${batchSuffix}`);
      const batches = await getBatches(batchSuffix);

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

          // Create recording-batch mapping
          const mappingData = {
            recording_id: createdRecording.id,
            batch_id: batch.batchid
          };

          console.log(`[MAPPING] Creating mapping:`, JSON.stringify(mappingData, null, 2));
          const recordingBatch = await createRecordingBatch(mappingData);
          console.log("[MAPPING] Recording mapped to batch successfully:", recordingBatch);
        }
      } else {
        console.warn(`[MAPPING] No batch found with name: ${batchSuffix}`);
        console.warn("[MAPPING] Recording created but not mapped to any batch");
      }
    } catch (mappingError) {
      console.error("[MAPPING] Failed to create recording-batch mapping:", mappingError.message);
      console.error("[MAPPING] Recording was created but mapping failed");
    }

    // Log job activity
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

      console.log("[JOB_LOG] Creating job activity log...");
      await createJobActivityLog(logData);
      console.log("[JOB_LOG] Job activity logged successfully");
    } catch (logError) {
      console.error("[JOB_LOG] Failed to log job activity:", logError.message);
      console.error("[JOB_LOG] Upload was successful but logging failed (non-critical)");
    }

    return res.data;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

module.exports = uploadVideo;

