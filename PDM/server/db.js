const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    password: "btl@12345",
    host: "localhost",
    port: 5432,
    database: "pdm"
});

module.exports = pool;