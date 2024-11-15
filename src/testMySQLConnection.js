const mysql = require('mysql');

// MySQL database connection configuration
const dbConfig = {
    host: '35.232.56.51',
    user: 'whiteboxqa',
    password: 'Innovapath1',
    database: 'whiteboxqa',
};

// Create a MySQL connection
const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');

    // Close the connection after successful connection test
    connection.end((err) => {
        if (err) {
            console.error('Error disconnecting from MySQL:', err);
        } else {
            console.log('Disconnected from MySQL');
        }
    });
});
