require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
});

app.get('/', (req,res)=>{
    res.send('AGRI_MBSB API Running');
});

app.get('/records', async(req,res)=>{

    try{

        const result =
        await pool.query(
        'SELECT * FROM work_records ORDER BY id DESC'
        );

        res.json(result.rows);

    }catch(err){

        console.log(err);

        res.status(500).json(err);

    }

});

app.post('/records', async(req,res)=>{

    try{

        const {
            date,
            work,
            block,
            ha,
            bag,
            acre,
            unit_price,
            total,
            by_person
        } = req.body;

        const result =
        await pool.query(

        `INSERT INTO work_records
        (date,work,block,ha,bag,acre,
        unit_price,total,by_person)

        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9)

        RETURNING *`,

        [
            date,
            work,
            block,
            ha,
            bag,
            acre,
            unit_price,
            total,
            by_person
        ]

        );

        res.json(result.rows[0]);

    }catch(err){

        console.log(err);

        res.status(500).json(err);

    }

});

app.listen(process.env.PORT,()=>{

console.log(
`Server Running ${process.env.PORT}`
);

});