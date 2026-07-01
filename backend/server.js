require('dotenv').config();

process.env.TZ =
'Asia/Kuala_Lumpur';

const express =
require('express');

const cors =
require('cors');

const recordRoutes =
require(
'./routes/records'
);

const authRoutes =
require('./routes/auth');

const droneRoutes =
require("./routes/droneRoutes");

const productRoutes =
require("./routes/productRoutes");

const app =
express();

const ExcelJS = require('exceljs');

const droneSalaryRoutes =
require("./routes/droneSalaryRoutes");


// MIDDLEWARE

app.use(cors());

app.use(
express.json()
);



// ROOT

app.get(
'/',
(req,res)=>{

res.send(
'AGRI_MBSB API Running'
);

}
);

console.log(
'RECORD ROUTES LOADED'
);

// RECORD ROUTES

app.use(
'/records',
recordRoutes
);

app.use(
'/api/auth',
authRoutes
);

app.use(
    "/api/drone",
    droneRoutes
);

app.use(
    "/api/product",
    productRoutes
);

app.use(
    "/api/list",
    productRoutes
);

app.use(
    "/api/drone-salary",
    droneSalaryRoutes
);

// START SERVER
console.log("PORT =", process.env.PORT);

const server = app.listen(
    process.env.PORT,
    () => {
        console.log(`Server Running ${process.env.PORT}`);
    }
);

console.log(server.listening);