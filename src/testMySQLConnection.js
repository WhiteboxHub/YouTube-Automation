// const mysql = require('mysql');

// // MySQL database connection configuration
// const dbConfig = {
//     host: '35.232.56.51',
//     user: 'whiteboxqa',
//     password: 'Innovapath1',
//     database: 'whiteboxqa',
// };

// // Create a MySQL connection
// const connection = mysql.createConnection(dbConfig);

// connection.connect((err) => {
//     if (err) {
//         console.error('Error connecting to MySQL:', err);
//         return;
//     }
//     console.log('Connected to MySQL');

//     // Close the connection after successful connection test
//     connection.end((err) => {
//         if (err) {
//             console.error('Error disconnecting from MySQL:', err);
//         } else {
//             console.log('Disconnected from MySQL');
//         }
//     });
// });
const mysql = require('mysql2/promise');

// Create a database pool
const pool = mysql.createPool({
    host: '35.232.56.51',
    user: 'whiteboxqa',
    password: 'Innovapath1',
    database: 'whiteboxqa',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Function to execute a query within a transaction
async function executeTransaction(query, values) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction(); // Start transaction
        const [result] = await connection.execute(query, values); // Execute query
        await connection.commit(); // Commit transaction
        return result; // Return query result
    } catch (error) {
        await connection.rollback(); // Rollback transaction on error
        console.error("Transaction failed:", error.message);
        throw error;
    } finally {
        connection.release(); // Release the connection
    }
}

module.exports = { executeTransaction };
