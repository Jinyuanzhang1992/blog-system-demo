"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    user: "jinyuan",
    host: "localhost",
    database: "demo",
    password: "12345",
    port: 5433,
});
pool.on("connect", () => {
    console.log("Connected to the PostgreSQL database");
});
pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
});
exports.default = pool;
