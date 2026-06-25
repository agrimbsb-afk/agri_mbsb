require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        rejectUnauthorized: false
    },

    // 对你目前的系统来说 5 已经很足够
    max: 5,

    // 闲置 30 秒后释放
    idleTimeoutMillis: 30000,

    // 最多等待 5 秒取得连接
    connectionTimeoutMillis: 5000,

    allowExitOnIdle: true,

    // 保持 TCP 连线
    keepAlive: true
});

if (process.env.NODE_ENV !== "production") {

    pool.on("connect", () => {
        console.log("DB CONNECT");
    });

    pool.on("acquire", () => {
        console.log("DB ACQUIRE");
    });

    pool.on("remove", () => {
        console.log("DB REMOVE");
    });

    pool.on("error", err => {
        console.error("POOL ERROR:", err.message);
    });

}

module.exports = pool;