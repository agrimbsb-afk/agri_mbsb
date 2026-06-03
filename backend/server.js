require('dotenv').config();

const express =
require('express');

const cors =
require('cors');

const recordRoutes =
require(
'./routes/records'
);

const app =
express();

const ExcelJS = require('exceljs');


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



// START SERVER

app.listen(

process.env.PORT,

()=>{

console.log(

`Server Running ${process.env.PORT}`

);

}

);