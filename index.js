const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vinay'
});

app.get('/api', (request, response) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            return response.status(500).send('Database connection error');
        }

        console.log(`Connected as id ${connection.threadId}`);

        connection.query('SELECT * FROM apiscreating', (err, results) => {
            connection.release();

            if (err) {
                console.error('Error executing query:', err);
                return response.status(500).send('Query execution error');
            }

            response.json(results);
        });
    });
});

app.post('/insert', (request, response) => {
    const { name, image, summary } = request.body;

    // Log the received request body
    console.log('Received POST data:', request.body);

    if (!name || !image || !summary) {
        console.error('Missing fields:', { name, image, summary });
        return response.status(400).send('All fields (name, image, summary) are required');
    }

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            return response.status(500).send('Database connection error');
        }

        console.log(`Connected as id ${connection.threadId}`);

        const query = 'INSERT INTO apiscreating (name, image, summary) VALUES (?, ?, ?)';
        connection.query(query, [name, image, summary], (err, results) => {
            connection.release();

            if (err) {
                console.error('Error executing query:', err);
                return response.status(500).send('Query execution error');
            }

            response.status(201).send(`Record added with ID: ${results.insertId}`);
        });
    });
});

app.delete('/delete/:id', (request, response) => {
    const { id } = request.params;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            return response.status(500).send('Database connection error');
        }

        console.log(`Connected as id ${connection.threadId}`);

        const query = 'DELETE FROM apiscreating WHERE id = ?';
        connection.query(query, [id], (err, results) => {
            connection.release();

            if (err) {
                console.error('Error executing query:', err);
                return response.status(500).send('Query execution error');
            }

            if (results.affectedRows === 0) {
                return response.status(404).send('Record not found');
            }

            response.status(200).send(`Record with ID: ${id} deleted`);
        });
    });
});

app.put('/update/:id', (request, response) => {
    const { id } = request.params;
    const { name, image, summary } = request.body;

    // Log the received request body
    console.log('Received PUT data:', request.body);

    if (!name || !image || !summary) {
        console.error('Missing fields:', { name, image, summary });
        return response.status(400).send('All fields (name, image, summary) are required');
    }

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            return response.status(500).send('Database connection error');
        }

        console.log(`Connected as id ${connection.threadId}`);

        const query = 'UPDATE apiscreating SET name = ?, image = ?, summary = ? WHERE id = ?';
        connection.query(query, [name, image, summary, id], (err, results) => {
            connection.release();

            if (err) {
                console.error('Error executing query:', err);
                return response.status(500).send('Query execution error');
            }

            if (results.affectedRows === 0) {
                return response.status(404).send('Record not found');
            }

            response.status(200).send(`Record with ID: ${id} updated`);
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
