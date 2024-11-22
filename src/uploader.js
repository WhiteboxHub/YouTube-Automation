// -----------------------------------------------------------***************************----------------------

const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const mysql = require("mysql");
require("dotenv").config();

// MySQL database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Create a MySQL connection
const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

// Subject to subjectid mapping
const subjectMapping = {
  SDLC: 65,
  "JIRA-Agile": 4,
  UNIX: 12,
  HttpAndWebservices: 1,
  RestAssured: 23,
  SQL1: 5,
  SQL2: 5,
  SQL3: 5,
  SQL4: 5,
  SQL5: 5,
  PythonProgramming: 10,
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
  GraphQL: 13,
  NodeJS: 34,
  ExpressJS: 35,
  ReactNative: 43,
  "Software Architecture": 2,
  Python: 59,
  Numpy: 54,
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

// async function uploadVideo(filePath, auth) {
//     console.log('Starting upload process for:', filePath);
//     try {
//         const youtube = google.youtube({ version: 'v3', auth });
//         const fileSize = fs.statSync(filePath).size;

//         // Extract batch ID and subject from the file name
//         const fileName = path.basename(filePath);
//         const parts = fileName.split('_');
//         const batchId = parts[1]; // Assuming batch ID is after the first underscore
//         const subject = parts[4].split('.')[0]; // Assuming subject is the part before the file extension
//         const subjectId = subjectMapping[subject];

//         if (!subjectId) {
//             console.error('Invalid subject:', subject);
//             return;
//         }

//         const res = await youtube.videos.insert({
//             part: 'snippet,status',
//             notifySubscribers: false,
//             requestBody: {
//                 snippet: {
//                     title: fileName,
//                     description: fileName, // Use filename as description
//                 },
//                 status: {
//                     privacyStatus: 'unlisted',
//                     quality: 'high',
//                 },
//             },
//             media: {
//                 body: fs.createReadStream(filePath),
//             },
//         }, {
//             onUploadProgress: (evt) => {
//                 const progress = (evt.bytesRead / fileSize) * 100;
//                 console.log(`${Math.round(progress)}% complete`);
//             },
//         });

//         console.log('Upload complete:', res.data);
//         console.log('YouTube Video ID:', res.data.id);

//         // Insert video ID into MySQL database
//         const videoId = res.data.id;
//         const videoTitle = res.data.snippet.title;
//         const currentDate = new Date();
//         const batchname = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
//         const classDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

//         const lastModDateTime = currentDate.toISOString().slice(0, 10);
//         const youtubeLink = `https://www.youtube.com/watch?v=${videoId}`;

//         const query = `
//             INSERT INTO new_recording (
//                 batchname, description, type, classdate, link, videoid, subject, filename, lastmoddatetime, new_subject_id
//             ) VALUES (?, ?, 'class', ?, ?, ?, ?, ?, ?, ?)
//         `;

//         const values = [batchname, videoTitle, classDate, youtubeLink, videoId, subject, fileName, lastModDateTime, subjectId];

//         connection.query(query, values, (err, results) => {
//             if (err) {
//                 console.error('Error inserting video ID into MySQL:', err);
//             } else {
//                 console.log('Video ID inserted into MySQL:', results);
//             // }
// // ---------------------------------------------------

//     // Execute the additional query to insert into new_recording_batch
//     const additionalQuery = `
//     INSERT INTO whiteboxqa.new_recording_batch (recording_id, batch_id)
//     SELECT nr.id AS recording_id, b.batchid AS batch_id
//     FROM new_recording nr
//     JOIN batch b ON nr.batchname = b.batchname
//     WHERE NOT EXISTS (
//         SELECT 1
//         FROM new_recording_batch rb
//         WHERE rb.recording_id = nr.id
//         AND rb.batch_id = b.batchid
//     );
// `;

// connection.query(additionalQuery, (err, results) => {
//     if (err) {
//         console.error('Error executing additional query:', err);
//     } else {
//         console.log('Additional query executed successfully:', results);
//     }
// });
// }
// // ---------------------------------------------------

//         });

//         return res.data;

//     } catch (error) {
//         console.error('Error uploading video to YouTube:', error);
//         throw error;
//     }
// }

// ******************----------------------------------------------***************************************

async function uploadVideo(filePath, auth) {
  console.log("Starting upload process for:", filePath);
  try {
    const youtube = google.youtube({ version: "v3", auth });
    const fileSize = fs.statSync(filePath).size;

    // Extract filename and identify the type
    const fileName = path.basename(filePath);
    const parts = fileName.split("_");
    const prefix = parts[0]; // Either 'Class' or 'Session'

    if (prefix === "Class") {
      // Existing Class logic
      const batchId = parts[1]; // Assuming batch ID is after the first underscore
      const subject = parts[4].split(".")[0]; // Assuming subject is the part before the file extension
      const subjectId = subjectMapping[subject];

      if (!subjectId) {
        console.error("Invalid subject:", subject);
        return;
      }

      const res = await youtube.videos.insert(
        {
          part: "snippet,status",
          notifySubscribers: false,
          requestBody: {
            snippet: {
              title: fileName,
              description: fileName, // Use filename as description
            },
            status: {
              privacyStatus: "unlisted",
              quality: "high",
            },
          },
          media: {
            body: fs.createReadStream(filePath),
          },
        },
        {
          onUploadProgress: (evt) => {
            const progress = (evt.bytesRead / fileSize) * 100;
            console.log(`${Math.round(progress)}% complete`);
          },
        }
      );

      console.log("Upload complete:", res.data);
      console.log("YouTube Video ID:", res.data.id);

      // Insert data into new_recording table
      const videoId = res.data.id;
      const videoTitle = res.data.snippet.title;
      const currentDate = new Date();
      const batchname = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}`;
      const classDate = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

      const lastModDateTime = currentDate.toISOString().slice(0, 10);
      const youtubeLink = `https://www.youtube.com/watch?v=${videoId}`;

      connection.beginTransaction((err) => {
        if (err) {
          console.error("Error starting transaction:", err);
          return;
        }

        const query = `
                INSERT INTO new_recording (
                    batchname, description, type, classdate, link, videoid, subject, filename, lastmoddatetime, new_subject_id
                ) VALUES (?, ?, 'class', ?, ?, ?, ?, ?, ?, ?)
            `;

        const values = [
          batchname,
          videoTitle,
          classDate,
          youtubeLink,
          videoId,
          subject,
          fileName,
          lastModDateTime,
          subjectId,
        ];

        // connection.query(query, values, (err, results) => {
        //     if (err) {
        //         console.error('Error inserting video ID into MySQL:', err);
        //     } else {
        //         console.log('Video ID inserted into MySQL:', results);
        //     }
        // });

        // connection.query(query, values, (err, results) => {
        //     if (err) {
        //         console.error('Error inserting video ID into MySQL:', err);
        //         return;
        //     }
        //     const recordingId = results.insertId; // Ensure `id` is captured

        // })

        connection.query(query, values, (err, results) => {
          if (err) {
            console.error("Error inserting into new_recording:", err);

            // Rollback if an error occurs
            return connection.rollback(() => {
              console.error("Transaction rolled back due to an error.");
            });
          }

          console.log("Successfully inserted into new_recording:", results);
          // Execute the additional query to insert into new_recording_batch
          const additionalQuery = `
    INSERT INTO whiteboxqa.new_recording_batch (recording_id, batch_id)
    SELECT nr.id AS recording_id, b.batchid AS batch_id
    FROM new_recording nr
    JOIN batch b ON nr.batchname = b.batchname
    WHERE NOT EXISTS (
        SELECT 1
        FROM new_recording_batch rb
        WHERE rb.recording_id = nr.id
        AND rb.batch_id = b.batchid
    );
`;

          // Execute the additional query
          //  connection.query(additionalQuery, (err, results) => {
          //     if (err) {
          //         console.error('Error executing additional query for new_recording_batch:', err);
          //         return;
          //     }
          //     console.log('Successfully inserted into new_recording_batch:', results);
          // });
          // connection.query(additionalQuery, (err, results) => {
          //     if (err) {
          //         console.error('Error executing additional query:', err);
          //     } else {
          //         console.log('Additional query executed successfully:', results);
          //     }
          // });
          // }connection.query(additionalQuery, (err, results) => {
          if (err) {
            console.error("Error executing additional query:", err);

            // Rollback if an error occurs
            return connection.rollback(() => {
              console.error("Transaction rolled back due to an error.");
            });
          }

          console.log(
            "Successfully inserted into new_recording_batch:",
            results
          );

          // Commit the transaction
          connection.commit((err) => {
            if (err) {
              console.error("Error committing transaction:", err);

              // Rollback if commit fails
              return connection.rollback(() => {
                console.error("Transaction rolled back due to commit error.");
              });
            }

            console.log("Transaction committed successfully.");
          });
        });
      });
    } else if (prefix === "Session") {
      // New Session logic
      const sessionDate = parts[1]; // Extract date
      const subjectId = parseInt(parts[2], 10); // Extract subject ID
      const instructorName = parts[3]; // Extract instructor name
      const sessionType = parts[4].split(".")[0]; // Extract session type

      if (!subjectId || !sessionDate || !sessionType) {
        console.error("Invalid session metadata in filename:", fileName);
        return;
      }

      const res = await youtube.videos.insert(
        {
          part: "snippet,status",
          notifySubscribers: false,
          requestBody: {
            snippet: {
              title: fileName,
              description: `Session by ${instructorName}`, // Customize description
            },
            status: {
              privacyStatus: "unlisted",
              quality: "high",
            },
          },
          media: {
            body: fs.createReadStream(filePath),
          },
        },
        {
          onUploadProgress: (evt) => {
            const progress = (evt.bytesRead / fileSize) * 100;
            console.log(`${Math.round(progress)}% complete`);
          },
        }
      );

      console.log("Upload complete:", res.data);
      console.log("YouTube Video ID:", res.data.id);

      // Insert data into new_session table
      const videoId = res.data.id;
      const videoLink = `https://www.youtube.com/watch?v=${videoId}`;
      const currentDate = new Date();
      const lastModDateTime = currentDate.toISOString().slice(0, 10);

      const query = `
                INSERT INTO new_session (
                    title, status, sessiondate, type, subject, recorded, uploaded, link, videoid,
                    invitation, lastmoddatetime, subject_id
                ) VALUES (?, 'Completed', ?, ?, ?, 'Y', 'Y', ?, ?, 'Y', ?, ?)
            `;

      const values = [
        fileName,
        sessionDate,
        sessionType,
        instructorName,
        videoLink,
        videoId,
        lastModDateTime,
        subjectId,
      ];

      connection.query(query, values, (err, results) => {
        if (err) {
          console.error("Error inserting session metadata into MySQL:", err);
        } else {
          console.log("Session metadata inserted into MySQL:", results);
        }
      });
    } else {
      console.error("Unknown file prefix:", prefix);
    }
  } catch (error) {
    console.error("Error uploading video:", error);
    throw error;
  }
}

module.exports = uploadVideo;
