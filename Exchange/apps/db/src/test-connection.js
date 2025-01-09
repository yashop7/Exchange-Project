const { Client } = require('pg');

const client = new Client({
    user: "your_user",
    host: "localhost",
    database: "my_database",
    password: "your_password",
    port: 5433,
});

client.connect()
    .then(() => console.log('Connected successfully'))
    .catch(err => console.error('Connection error:', err.stack))
    .finally(() => client.end());
