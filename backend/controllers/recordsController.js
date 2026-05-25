const pool =
require('../config/db');

const ExcelJS =
require('exceljs');



// GET RECORDS / MONTH FILTER

exports.getRecords =
async(req,res)=>{

try{

const { month } =
req.query;

let query='';
let values=[];

if(month){

query=`

SELECT

id,

TO_CHAR(
date,
'DD-MM-YYYY'
) AS date,

work,
block,
ha,
bag,
acre,
unit_price,
total,
by_person,

TO_CHAR(
created_at,
'DD-MM-YYYY HH24:MI:SS'
) AS created_at

FROM work_records

WHERE

TO_CHAR(
date,
'YYYY-MM'
)=$1

ORDER BY id ASC

`;

values=[month];

}

else{

query=`

SELECT

id,

TO_CHAR(
date,
'DD-MM-YYYY'
) AS date,

work,
block,
ha,
bag,
acre,
unit_price,
total,
by_person,

TO_CHAR(
created_at,
'DD-MM-YYYY HH24:MI:SS'
) AS created_at

FROM work_records

ORDER BY id ASC

`;

}



const result=

await pool.query(
query,
values
);

res.json(
result.rows
);

}

catch(err){

console.error(err);

res.status(500)
.json({

error:
err.message

});

}

};



// BULK INSERT

exports.bulkInsert =
async(req,res)=>{

try{

const rows=
req.body;

if(
!Array.isArray(rows)
){

return res
.status(400)
.json({

error:
'Payload must be array.'

});

}

const inserted=[];

for(const row of rows){

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

}=row;



if(

!date ||

!work ||

!by_person

){

return res
.status(400)
.json({

error:
'Date, Work and By Person required.'

});

}



const result=

await pool.query(

`

INSERT INTO work_records

(

date,
work,
block,
ha,
bag,
acre,
unit_price,
total,
by_person

)

VALUES

(

$1,$2,$3,$4,$5,
$6,$7,$8,$9

)

RETURNING *

`,

[

date,

work,

block || null,

ha===''
? null
:Number(ha),

bag===''
? null
:Number(bag),

acre===''
? null
:Number(acre),

unit_price===''
? null
:Number(unit_price),

total===''
? null
:Number(total),

by_person

]

);

inserted.push(
result.rows[0]
);

}



res.json(
inserted
);

}

catch(err){

console.error(err);

res.status(500)
.json({

error:
err.message

});

}

};



// UPDATE

exports.updateRecord =
async(req,res)=>{

try{

const { id } =
req.params;

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

}=req.body;



if(

!date ||

!work ||

!by_person

){

return res
.status(400)
.json({

error:
'Date, Work and By Person required.'

});

}



const result=

await pool.query(

`

UPDATE work_records

SET

date=$1,
work=$2,
block=$3,
ha=$4,
bag=$5,
acre=$6,
unit_price=$7,
total=$8,
by_person=$9

WHERE id=$10

RETURNING *

`,

[

date,

work,

block || null,

ha || null,

bag || null,

acre || null,

unit_price || null,

total || null,

by_person,

id

]

);



res.json(
result.rows[0]
);

}

catch(err){

console.error(err);

res.status(500)
.json({

error:
err.message

});

}

};



// DELETE

exports.deleteRecord =
async(req,res)=>{

try{

const { id } =
req.params;

await pool.query(

`

DELETE
FROM work_records

WHERE id=$1

`,

[id]

);



res.json({

message:
'Deleted Successfully'

});

}

catch(err){

console.error(err);

res.status(500)
.json({

error:
err.message

});

}

};



// EXPORT EXCEL

exports.exportExcel =
async(req,res)=>{

try{

const { month } =
req.query;

let query='';
let values=[];



if(month){

query=`

SELECT

id,

TO_CHAR(
date,
'DD-MM-YYYY'
) AS date,

work,
block,
ha,
bag,
acre,
unit_price,
total,
by_person,

TO_CHAR(
created_at,
'DD-MM-YYYY HH24:MI:SS'
) AS created_at

FROM work_records

WHERE

TO_CHAR(
date,
'YYYY-MM'
)=$1

ORDER BY id ASC

`;

values=[month];

}

else{

query=`

SELECT

id,

TO_CHAR(
date,
'DD-MM-YYYY'
) AS date,

work,
block,
ha,
bag,
acre,
unit_price,
total,
by_person,

TO_CHAR(
created_at,
'DD-MM-YYYY HH24:MI:SS'
) AS created_at

FROM work_records

ORDER BY id ASC

`;

}



const result=

await pool.query(
query,
values
);



const workbook=
new ExcelJS.Workbook();

const sheet=
workbook.addWorksheet(
'AGRI_MBSB'
);



// HEADER

sheet.addRow([

'ID',
'DATE',
'WORK',
'BLOCK',
'HA',
'BAG',
'ACRE',
'UNIT PRICE',
'TOTAL',
'BY PERSON',
'INSERTED AT'

]);



// DATA

result.rows.forEach(

r=>{

sheet.addRow([

r.id,
r.date,
r.work,
r.block,
r.ha,
r.bag,
r.acre,
r.unit_price,
r.total,
r.by_person,
r.created_at

]);

}

);



// HEADER STYLE

const header=
sheet.getRow(1);

header.eachCell(

cell=>{

cell.fill={

type:'pattern',

pattern:'solid',

fgColor:{
argb:'D9D9D9'
}

};

cell.font={

bold:true

};

cell.border={

top:{style:'thin'},
left:{style:'thin'},
bottom:{style:'thin'},
right:{style:'thin'}

};

}

);



// ALL BORDER

// ---------- FULL CELL BORDER ----------

const totalRows =
sheet.rowCount;

const totalCols =
sheet.columnCount;



for(

let r=1;

r<=totalRows;

r++

){

for(

let c=1;

c<=totalCols;

c++

){

const cell =

sheet.getCell(
r,
c
);



cell.border={

top:{
style:'thin'
},

left:{
style:'thin'
},

bottom:{
style:'thin'
},

right:{
style:'thin'
}

};



cell.alignment={

vertical:'middle',

horizontal:'left'

};

}

}



// COLUMN WIDTH

sheet.columns=[

{width:10},
{width:15},
{width:25},
{width:18},
{width:10},
{width:10},
{width:10},
{width:15},
{width:15},
{width:20},
{width:25}

];



res.setHeader(

'Content-Type',

'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

);

res.setHeader(

'Content-Disposition',

'attachment; filename=AGRI_MBSB.xlsx'

);



await workbook.xlsx.write(
res
);

res.end();

}

catch(err){

console.error(err);

res.status(500)
.json({

error:
err.message

});

}

};