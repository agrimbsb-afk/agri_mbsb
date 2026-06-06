const bcrypt =
require('bcryptjs');

const jwt =
require('jsonwebtoken');

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
qty,
work_unit,
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

ORDER BY date ASC

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
qty,
work_unit,
unit_price,
total,
by_person,

TO_CHAR(
created_at,
'DD-MM-YYYY HH24:MI:SS'
) AS created_at

FROM work_records

ORDER BY date ASC

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

exports.getWorkOptions =
async(req,res)=>{

try{

const result=

await pool.query(

`

SELECT

work_id,
work_code,
work_name,
work_price,
work_unit

FROM work_details
WHERE WORK_CAT ='KONG'

ORDER BY work_id ASC

`

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

//load staff
exports.getWorkers = async(req,res)=>{

try{

const result=

await pool.query(

`
SELECT worker_name
FROM work_staff
ORDER BY worker_name ASC
`

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
'Server Error'

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
qty,
work_unit,
unit_price,
total,
by_person

}=row;



if(

!date ||
!work ||
qty==='' ||
qty===null ||
qty===undefined ||
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
qty,
work_unit,
unit_price,
total,
by_person

)

VALUES

(

$1,$2,$3,$4,$5,
$6,$7,$8

)

RETURNING *

`,

[

date,

work,

block || null,

qty===''
? null
:Number(qty),

work_unit || null,

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
qty,
work_unit,
unit_price,
total,
by_person

}=req.body;



if(

!date ||
!work ||
qty==='' ||
qty===null ||
qty===undefined ||
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
qty=$4,
work_unit=$5,
unit_price=$6,
total=$7,
by_person=$8

WHERE id=$9

RETURNING *

`,

[

date,

work,

block || null,

qty || null,

work_unit || null,

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

exports.exportExcel = async (req,res)=>{

try{

    const { month } = req.query;

    let query = '';
    let values = [];

    if(month){

        query = `

        SELECT

            TO_CHAR(
                date,
                'DD-MM-YYYY'
            ) AS date,

            work,
            block,
            qty,
            work_unit,
            unit_price,
            total,
            by_person

        FROM work_records

        WHERE TO_CHAR(
            date,
            'YYYY-MM'
        ) = $1

        ORDER BY
        by_person,
        date ASC

        `;

        values = [month];

    }
    else{

        query = `

        SELECT

            TO_CHAR(
                date,
                'DD-MM-YYYY'
            ) AS date,

            work,
            block,
            qty,
            work_unit,
            unit_price,
            total,
            by_person

        FROM work_records

        ORDER BY
        by_person,
        date ASC

        `;

    }

    const result =
    await pool.query(
        query,
        values
    );

    const workbook =
    new ExcelJS.Workbook();

    const sheet =
    workbook.addWorksheet(
        "SALARY SUMMARY"
    );


	function setBorder(row){

    row.eachCell(
        { includeEmpty:true },
        cell=>{

            cell.border = {

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

        }
    );

}

	function setGray(row){

			row.eachCell(cell=>{

				cell.fill = {

					type:'pattern',

					pattern:'solid',

					fgColor:{
						argb:'D9D9D9'
					}

				};

				cell.font = {

					bold:true

				};

			});

		}

    /* ==========================
       BUILD MAP
    ========================== */

    const salaryMap = {};
    const detailMap = {};

    result.rows.forEach(r=>{

        const person =

        (r.by_person || '')
        .trim()
        .toUpperCase();

        if(!salaryMap[person]){

            salaryMap[person] = 0;

            detailMap[person] = [];

        }

        salaryMap[person] +=
        Number(
            r.total || 0
        );

        detailMap[person]
        .push(r);

    });

    /* ==========================
       BANGLA SHARE
    ========================== */

    const banglaTotal =

    salaryMap["BANGLA"] || 0;

    const workers =

		Object.keys(
			salaryMap
		)

		.filter(

			person =>

			person !== "BANGLA"

		)

		.sort();

	const banglaShare =

	workers.length > 0

	? banglaTotal /
	  workers.length

	: 0;

    /* ==========================
       SUMMARY
    ========================== */

    sheet.addRow([]);

    const summaryHeader =
		sheet.addRow([
			'',
			'',
			'BANGLA',
			'TOTAL'
		]);

		setGray(
			summaryHeader
		);

		setBorder(
			summaryHeader
		);

    workers.forEach(name=>{

        const ownTotal =

        salaryMap[name] || 0;

		const row =
		sheet.addRow([

			name,

			ownTotal,

			banglaShare,

			ownTotal +
			banglaShare

		]);

		setBorder(
			row
		);

    });

	const banglaRow =
	sheet.addRow([
		'',
		'',
		banglaTotal,
		''
	]);

	setBorder(
		banglaRow
	);

    sheet.addRow([]);

    /* ==========================
       DETAIL SECTION
    ========================== */

    const personOrder = [

		"BANGLA",

		...workers

	];

    personOrder.forEach(person=>{

        const rows =

        detailMap[person] || [];

        if(rows.length === 0){

            return;

        }

        const personTitle =
		sheet.addRow([
			person
		]);

		sheet.mergeCells(

			personTitle.number,

			1,

			personTitle.number,

			8

		);

		personTitle
		.getCell(1)
		.font = {

			bold:true,

			size:14

		};

        const headerRow =
        sheet.addRow([

            "DATE",
            "WORK",
            "BLOCK",
            "QTY",
            "UNIT",
            "UNIT PRICE",
            "TOTAL",
            "BY PERSON"

        ]);

		setGray(
			headerRow
		);

		setBorder(
			headerRow
		);

        let personTotal = 0;

        rows.forEach(r=>{

            personTotal +=

            Number(
                r.total || 0
            );

            const dataRow =
sheet.addRow([

    r.date,
    r.work,
    r.block || '',
    Number(r.qty || 0),
    r.work_unit || '',
    Number(r.unit_price || 0),
    Number(r.total || 0),
    r.by_person || ''

]);

				setBorder(
					dataRow
				);

        });

        const totalRow =
		sheet.addRow([

			"TOTAL",
			"",
			"",
			"",
			"",
			"",
			personTotal,
			""

		]);

		setGray(
			totalRow
		);

		setBorder(
			totalRow
		);

        sheet.addRow([]);

    });

    /* ==========================
       NUMBER FORMAT
    ========================== */

    sheet.getColumn(2)
    .numFmt =
    '#,##0.00';

    sheet.getColumn(3)
    .numFmt =
    '#,##0.00';

    sheet.getColumn(4)
    .numFmt =
    '#,##0.00';

    sheet.getColumn(6)
    .numFmt =
    '#,##0.00';

    sheet.getColumn(7)
    .numFmt =
    '#,##0.00';

    /* ==========================
       WIDTH
    ========================== */

    sheet.columns = [

        { width:15 },
        { width:25 },
        { width:15 },
        { width:10 },
        { width:12 },
        { width:15 },
        { width:15 },
        { width:18 }

    ];

    /* ==========================
       BORDER
    ========================== */


    /* ==========================
       DOWNLOAD
    ========================== */

    res.setHeader(

        'Content-Type',

        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    );

    res.setHeader(

        'Content-Disposition',

        'attachment; filename=AGRI_MBSB_SALARY.xlsx'

    );

    await workbook.xlsx.write(
        res
    );

    res.end();

}
catch(err){

    console.error(err);

    res.status(500).json({

        error:
        err.message

    });

}

};