const pool =
require(
    '../config/db'
);

const ExcelJS =
require('exceljs');

/* =========================
   PILOT SALARY SUMMARY
========================= */

exports.getPilotSalarySummary =
async(req,res)=>{

    try{

        const { month } =
        req.query;

        const result =
        await pool.query(

            `

            SELECT

                dl.by_person,

                ud."user_Name",

                COUNT(*) AS total_job,

                ROUND(
                    SUM(dl.acre)::numeric,
                    2
                ) AS total_acre,

                ROUND(
                    SUM(dl.amount)::numeric,
                    2
                ) AS total_amount

            FROM drone_monthly_log_view dl

            INNER JOIN "user_Details" ud

            ON dl.by_person =
               ud."user_Id"

            WHERE

            TO_CHAR(
                dl.date,
                'YYYY-MM'
            ) = $1
			
			AND dl.work_code !='WB0004'

            GROUP BY

                dl.by_person,
                ud."user_Name"

            ORDER BY

                dl.by_person

            `,

            [month]

        );

        res.json({

            success:true,

            data:
            result.rows

        });

    }
    catch(err){

        console.error(err);

        res.status(500).json({

            success:false,

            message:
            err.message

        });

    }

};


exports.getPilotWorkRecords =
async(req,res)=>{

    try{

        const {
            month,
            userId
        } = req.query;

        const result =
        await pool.query(

            `

            SELECT

                TO_CHAR(
                    date,
                    'DD-MM-YYYY'
                ) AS date,

                work,
				
				 CASE

					WHEN product_category = 'RACUN'

					THEN 0

					ELSE COALESCE(
						work_pcs,
						0
					)

				END AS work_pcs,
				
				area_ha,

                acre,
				
				work_price,

                amount

            FROM drone_monthly_log_view

            WHERE

            by_person = $1

            AND

            TO_CHAR(
                date,
                'YYYY-MM'
            ) = $2
			
			

            ORDER BY

            date

            `,

            [
                userId,
                month
            ]

        );

        res.json({

            success:true,

            data:
            result.rows

        });

    }
    catch(err){

        console.error(err);

        res.status(500).json({

            success:false,

            message:
            err.message

        });

    }

};


exports.getPilotMonthlySummary =
async(req,res)=>{

    try{

        const {
            userId,
            month
        } = req.query;

        const result =
        await pool.query(

            `

            SELECT

                work,

                MAX(work_price) AS work_price,

                SUM(
                    CASE

                        WHEN product_category IN (
                            'BENIH',
                            'BAJA'
                        )

                        THEN COALESCE(
                            work_pcs,
                            0
                        )

                        ELSE 0

                    END

                ) AS beg,

                ROUND(

                    SUM(

                        CASE

                            WHEN product_category='RACUN'

                            THEN COALESCE(
                                area_ha,
                                0
                            )

                            ELSE 0

                        END

                    )::numeric,

                    2

                ) AS total_ha,

                ROUND(
                    SUM(amount)::numeric,
                    2
                ) AS total_amount

            FROM drone_monthly_log_view

            WHERE

            by_person = $1

            AND

            TO_CHAR(
                date,
                'YYYY-MM'
            ) = $2
			
			AND work_code !='WB0004'

            GROUP BY

                work

            ORDER BY

                work

            `,

            [
                userId,
                month
            ]

        );

        res.json({

            success:true,

            data:
            result.rows

        });

    }
    catch(err){

        console.error(err);

        res.status(500).json({

            success:false

        });

    }

};

exports.exportPilotSalaryExcel =
async(req,res)=>{

try{

    const { month } =
    req.query;

    const result =
    await pool.query(

        `

		SELECT

			dl.by_person,

			ud."user_Name",

			TO_CHAR(
				dl.date,
				'DD-MM-YYYY'
			) AS date,

			dl.work,

			CASE
				WHEN dl.product_category IN (
					'BENIH',
					'BAJA'
				)
				THEN COALESCE(
					dl.work_pcs,
					0
				)
				ELSE 0
			END AS work_pcs,

			dl.area_ha,

			dl.acre,

			dl.amount

		FROM drone_monthly_log_view dl

		LEFT JOIN "user_Details" ud

		ON dl.by_person =
		   ud."user_Id"

		WHERE

		TO_CHAR(
			dl.date,
			'YYYY-MM'
		) = $1

		ORDER BY

			dl.by_person,
			dl.date;

        `,

        [month]

    );

    const workbook =
    new ExcelJS.Workbook();

    const sheet =
    workbook.addWorksheet(
        "PILOT SALARY"
    );
	
	/* ==========================
	   SALARY SUMMARY
	========================== */

	const summaryMap = {};

	result.rows.forEach(row=>{

		const name =
		row.user_Name || '';

		if(!summaryMap[name]){

			summaryMap[name] = 0;

		}

		summaryMap[name] +=

		Number(
			row.amount || 0
		);

	});

    /* ==========================
       STYLE
    ========================== */

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
	   SUMMARY SECTION
	========================== */

	const titleRow =
	sheet.addRow([

		`PILOT SALARY SUMMARY (${month})`

	]);

	titleRow.getCell(1).font = {

		bold:true,
		size:16

	};

	sheet.mergeCells(

		titleRow.number,
		1,
		titleRow.number,
		2

	);

	sheet.addRow([]);

	const summaryHeader =
	sheet.addRow([

		"PILOT NAME",

		"SALARY"

	]);

	setGray(
		summaryHeader
	);

	setBorder(
		summaryHeader
	);

	let grandTotal = 0;

	Object.keys(
		summaryMap
	)
	.sort()
	.forEach(name=>{

		const total =

		Number(
			summaryMap[name]
		);

		grandTotal += total;

		const row =
		sheet.addRow([

			name,

			total

		]);

		setBorder(
			row
		);

	});

	const grandTotalRow =
	sheet.addRow([

		"TOTAL",

		grandTotal

	]);

	setGray(
		grandTotalRow
	);

	setBorder(
		grandTotalRow
	);

	sheet.addRow([]);
	sheet.addRow([]);
	

    /* ==========================
       GROUP BY PILOT
    ========================== */

    const detailMap = {};

    result.rows.forEach(row=>{

        const key =
        row.by_person;

        if(!detailMap[key]){

            detailMap[key] = {

                userName:
                row.user_Name || '',

                records:[]

            };

        }

        detailMap[key]
        .records
        .push(row);

    });

    /* ==========================
       EXPORT
    ========================== */

    Object.keys(
        detailMap
    )
    .forEach(userId=>{

        const pilot =
        detailMap[userId];

        const rows =
        pilot.records;

        let totalSalary = 0;

        const titleRow =
        sheet.addRow([

            `${userId} - ${pilot.userName}`

        ]);

        sheet.mergeCells(

            titleRow.number,
            1,

            titleRow.number,
            7

        );

        titleRow.getCell(1).font = {

            bold:true,

            size:14

        };

        sheet.addRow([]);

        const headerRow =
        sheet.addRow([

            "DATE",
            "WORK",
            "BEG",
            "HA",
            "ACRE",
            "AMOUNT"

        ]);

        setGray(
            headerRow
        );

        setBorder(
            headerRow
        );

        rows.forEach(r=>{

            totalSalary +=

            Number(
                r.amount || 0
            );

            const dataRow =
            sheet.addRow([

                r.date,

                r.work,

                Number(
                    r.work_pcs || 0
                ) || '',

                Number(
                    r.area_ha || 0
                ) || '',

                Number(
                    r.acre || 0
                ),

                Number(
                    r.amount || 0
                )

            ]);

            setBorder(
                dataRow
            );

        });

        const totalRow =
        sheet.addRow([

            '',
            '',
            '',
            '',
            'SALARY',
            totalSalary

        ]);

        setGray(
            totalRow
        );

        setBorder(
            totalRow
        );

        sheet.addRow([]);
        sheet.addRow([]);

    });

    /* ==========================
       FORMAT
    ========================== */
	sheet.getColumn(2)
	.numFmt =
	'#,##0.00';
	
    sheet.getColumn(3)
    .numFmt =
    '#,##0';

    sheet.getColumn(4)
    .numFmt =
    '#,##0.00';

    sheet.getColumn(5)
    .numFmt =
    '#,##0.00';

    sheet.getColumn(6)
    .numFmt =
    '#,##0.00';

    /* ==========================
       WIDTH
    ========================== */

	sheet.columns = [

		{ width:25 }, // DATE / NAME

		{ width:30 }, // WORK / TOTAL

		{ width:12 },

		{ width:12 },

		{ width:12 },

		{ width:15 }

	];

    /* ==========================
       DOWNLOAD
    ========================== */

    res.setHeader(

        'Content-Type',

        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    );

    res.setHeader(

        'Content-Disposition',

        `attachment; filename=PILOT_SALARY_${month}.xlsx`

    );

    await workbook.xlsx.write(
        res
    );

    res.end();

}
catch(err){

    console.error(err);

    res.status(500).json({

        success:false,

        error:
        err.message

    });

}

};