const pool =
require("../config/db");

const ExcelJS =
require('exceljs');


exports.getProducts =
async(req,res)=>{

    console.log(
        "CONTROLLER HIT"
    );

    try{

        const {
            season,
            product_id
        } = req.query;

        console.log(
            "SEASON:",
            season
        );

        console.log(
            "PRODUCT:",
            product_id
        );

        let query = `

        SELECT

        product_id,
        product_name,

        pcs_per_ctn,
        vol_per_pcs,
        product_uom,

        qty_ctn,
        qty_pcs,
        qty_vol

        FROM stock_balance_view

        WHERE 1=1

        `;

        let values = [];
        let idx = 1;

        if(season){

            query +=
            ` AND season=$${idx}`;

            values.push(
                season
            );

            idx++;

        }

        if(product_id){

            query +=
            ` AND product_id=$${idx}`;

            values.push(
                product_id
            );

            idx++;

        }

        query +=
        `
        ORDER BY product_id
        `;

        const result =
        await pool.query(
            query,
            values
        );

        res.json(
            result.rows
        );

    }
    catch(err){

        console.error(
            "PRODUCT ERROR:"
        );

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

};

exports.getProductList =
async(req,res)=>{

try{

const result =
await pool.query(`

SELECT

product_id,
product_name,
pcs_per_ctn,
vol_per_pcs,
product_uom

FROM stock_products

ORDER BY product_id

`);

res.json(
result.rows
);

}
catch(err){

console.error(err);

res.status(500).json({
error:
"Server Error"
});

}

};

exports.getSeasonList =
async(req,res)=>{

try{

const result =
await pool.query(`

SELECT season
FROM season_list_view
ORDER BY season DESC

`);

res.json(
result.rows
);

}
catch(err){

console.error(err);

res.status(500).json({
error:
"Server Error"
});

}

};

exports.stockIn =
async(req,res)=>{
	
    const client =
    await pool.connect();


    try{

        await client.query(
            "BEGIN"
        );

        const { items } =
        req.body;
		
			
		const by_person =
		req.user.userId;

        for(const item of items){

            const {

                product_name,
                pcs_per_ctn,
                vol_per_pcs,
                product_uom,

                qty_ctn,
                qty_pcs,
                qty_vol

            } = item;

            //
            // CHECK PRODUCT
            //

            const existing =
            await client.query(

                `
                SELECT product_id
                FROM stock_products
                WHERE UPPER(product_name)
                =
                UPPER($1)
                `,

                [product_name]

            );

            let productId;

            //
            // EXISTING
            //

            if(
                existing.rows.length
            ){

                productId =

                existing.rows[0]
                .product_id;

            }

            //
            // NEW PRODUCT
            //

            else{

                const prefix =

                product_name
                .trim()
                .charAt(0)
                .toUpperCase();

                const seq =
                await client.query(

                    `
                    SELECT product_id

                    FROM stock_products

                    WHERE product_id
                    LIKE $1

                    ORDER BY product_id DESC

                    LIMIT 1
                    `,

                    [
                        `${prefix}%`
                    ]

                );

                let nextNo = 1;

                if(seq.rows.length){

                    nextNo =

                    parseInt(

                        seq.rows[0]
                        .product_id
                        .substring(1)

                    )

                    + 1;

                }

                productId =

                prefix +

                String(nextNo)
                .padStart(4,"0");
				
				const uom =

				(product_uom || "")
				.trim()
				.toUpperCase();
				
				const cleanName =

				product_name
				.replace(/\s*\([^)]*\)$/,'')
				.trim();
				
				const finalProductName =

				`${cleanName} (${vol_per_pcs}${uom})`;

                await client.query(

                    `
                    INSERT INTO stock_products
                    (
                        product_id,
                        product_name,
                        pcs_per_ctn,
                        vol_per_pcs,
                        product_uom
                    )

                    VALUES
                    (
                        $1,$2,$3,$4,$5
                    )
                    `,

                    [

                        productId,
                        finalProductName,

                        pcs_per_ctn,
                        vol_per_pcs,
                        uom

                    ]

                );

            }

            //
            // STOCK IN ?
            //

            const hasQty =

                Number(qty_ctn) > 0 ||

                Number(qty_pcs) > 0 ||

                Number(qty_vol) > 0;

            if(hasQty){

                await client.query(

                    `
                    INSERT INTO stock_transactions
                    (
                        transaction_type,
                        product_id,

                        qty_ctn,
                        qty_pcs,
                        qty_vol,
						
						by_person
                    )

                    VALUES
                    (
                        'IN',
                        $1,
                        $2,
                        $3,
                        $4,
						$5
                    )
                    `,

                    [

                        productId,

                        qty_ctn || 0,
                        qty_pcs || 0,
                        qty_vol || 0,
						
						by_person

                    ]

                );

            }

        }

        await client.query(
            "COMMIT"
        );

        res.json({

            success:true

        });

    }
    catch(err){

        await client.query(
            "ROLLBACK"
        );

        console.error(err);

        res.status(500).json({

            success:false,
            error:err.message

        });

    }
    finally{

        client.release();

    }

};

exports.stockOut =
async(req,res)=>{

    const client =
    await pool.connect();

    try{

        await client.query(
            "BEGIN"
        );

        const { items } =
        req.body;

        const by_person =
        req.user.userId;

        for(const item of items){

            const {

                product_name,

                qty_ctn,
                qty_pcs,
                qty_vol

            } = item;

            //
            // CHECK PRODUCT
            //

            const existing =
            await client.query(

                `
                SELECT product_id
                FROM stock_products
                WHERE UPPER(product_name)
                =
                UPPER($1)
                `,

                [product_name]

            );

            //
            // PRODUCT NOT FOUND
            //

            if(!existing.rows.length){

                throw new Error(
                    `${product_name} Not Found`
                );

            }

            const productId =

            existing.rows[0]
            .product_id;

            //
            // MUST HAVE QTY
            //

            const hasQty =

                Number(qty_ctn) > 0 ||

                Number(qty_pcs) > 0 ||

                Number(qty_vol) > 0;

            if(!hasQty){

                continue;

            }

            //
            // INSERT STOCK OUT
            //

            await client.query(

                `
                INSERT INTO stock_transactions
                (
                    transaction_type,
                    product_id,

                    qty_ctn,
                    qty_pcs,
                    qty_vol,

                    by_person
                )

                VALUES
                (
                    'OUT',
                    $1,
                    $2,
                    $3,
                    $4,
                    $5
                )
                `,

                [

                    productId,

                    qty_ctn || 0,
                    qty_pcs || 0,
                    qty_vol || 0,

                    by_person

                ]

            );

        }

        await client.query(
            "COMMIT"
        );

        res.json({

            success:true,
            message:"Stock Out Saved"

        });

    }
    catch(err){

        await client.query(
            "ROLLBACK"
        );

        console.error(err);

        res.status(500).json({

            success:false,
            error:err.message

        });

    }
    finally{

        client.release();

    }

};

exports.stockAdjust =
async(req,res)=>{

    const client =
    await pool.connect();
	
	

    try{

        await client.query(
            "BEGIN"
        );

        const { items } =
        req.body;
	

        const by_person =
        req.user.userId;

        for(const item of items){

            const {

                product_name,

                qty_ctn,
                qty_pcs,
                qty_vol

            } = item;

            //
            // CHECK PRODUCT
            //

            const existing =
            await client.query(

                `
                SELECT product_id
                FROM stock_products
                WHERE UPPER(product_name)
                =
                UPPER($1)
                `,

                [product_name]

            );

            //
            // PRODUCT NOT FOUND
            //

            if(!existing.rows.length){

                throw new Error(
                    `${product_name} Not Found`
                );

            }

            const productId =

            existing.rows[0]
            .product_id;


            //
            // INSERT ADJUST
            //

            await client.query(

                `
                INSERT INTO stock_transactions
                (
                    transaction_type,
                    product_id,

                    qty_ctn,
                    qty_pcs,
                    qty_vol,

                    by_person
                )

                VALUES
                (
                    'ADJUST',
                    $1,
                    $2,
                    $3,
                    $4,
                    $5
                )
                `,

                [

                    productId,

                    qty_ctn || 0,
                    qty_pcs || 0,
                    qty_vol || 0,

                    by_person

                ]

            );
			
					
		console.log(
			"INSERT ADJUST:",
			{
				productId,
				qty_ctn,
				qty_pcs,
				qty_vol,
				by_person
			}
		);

        }


        await client.query(
            "COMMIT"
        );

        res.json({

            success:true,
            message:"Stock Adjust Saved"

        });

    }
    catch(err){

        await client.query(
            "ROLLBACK"
        );

        console.error(err);

        res.status(500).json({

            success:false,
            error:err.message

        });

    }
    finally{

        client.release();

    }

};

exports.exportExcel =
async(req,res)=>{

try{

    const { season } =
    req.query;

    const result =
    await pool.query(

        `
        SELECT

            product_id,
            product_name,

            pcs_per_ctn,
            vol_per_pcs,
            product_uom,

            qty_ctn,
            qty_pcs,
            qty_vol

        FROM stock_balance_view

        WHERE season = $1

        ORDER BY product_name
        `,

        [season]

    );

    const workbook =
    new ExcelJS.Workbook();

    const sheet =
    workbook.addWorksheet(
        "PRODUCT INVENTORY"
    );

    //
    // TITLE
    //

    const title =
    sheet.addRow([

        `PRODUCT INVENTORY - ${season}`

    ]);

    sheet.mergeCells(

        `A${title.number}:H${title.number}`

    );

    title.font = {

        bold:true,
        size:16

    };

    sheet.addRow([]);

    //
    // HEADER
    //

    const header =
    sheet.addRow([

        "CODE",
        "NAME",
        "PCS/CTN",
        "VOL/PCS",
        "UOM",
        "CTN",
        "PCS",
        "VOL"

    ]);

    header.eachCell(cell=>{

        cell.font = {

            bold:true,
            color:{
                argb:'FFFFFF'
            }

        };

        cell.fill = {

            type:'pattern',

            pattern:'solid',

            fgColor:{
                argb:'1F3A63'
            }

        };

        cell.border = {

            top:{style:'thin'},
            left:{style:'thin'},
            bottom:{style:'thin'},
            right:{style:'thin'}

        };

    });

    //
    // DATA
    //

    result.rows.forEach(r=>{

        const row =
        sheet.addRow([

            r.product_id,

            r.product_name,

            Number(
                r.pcs_per_ctn || 0
            ),

            Number(
                r.vol_per_pcs || 0
            ),

            r.product_uom || "",

            Number(
                r.qty_ctn || 0
            ),

            Number(
                r.qty_pcs || 0
            ),

            Number(
                r.qty_vol || 0
            )

        ]);

        //
        // BORDER
        //

        row.eachCell(cell=>{

            cell.border = {

                top:{style:'thin'},
                left:{style:'thin'},
                bottom:{style:'thin'},
                right:{style:'thin'}

            };

        });

        //
        // NEGATIVE STOCK
        //

        const isNegative =

            Number(r.qty_ctn) < 0 ||

            Number(r.qty_pcs) < 0 ||

            Number(r.qty_vol) < 0;

        if(isNegative){

            row.eachCell(cell=>{

                cell.fill = {

                    type:'pattern',

                    pattern:'solid',

                    fgColor:{
                        argb:'FFC7CE'
                    }

                };

                cell.font = {

                    color:{
                        argb:'9C0006'
                    },

                    bold:true

                };

            });

        }

    });

    //
    // WIDTH
    //

    sheet.columns = [

        { width:15 }, // CODE

        { width:35 }, // NAME

        { width:12 }, // PCS/CTN

        { width:12 }, // VOL/PCS

        { width:10 }, // UOM

        { width:10 }, // CTN

        { width:10 }, // PCS

        { width:10 }  // VOL

    ];

    //
    // DOWNLOAD
    //

    res.setHeader(

        "Content-Type",

        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    );

    res.setHeader(

        "Content-Disposition",

        `attachment; filename=STOCK_PRODUCT_${season}.xlsx`

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
        error:err.message

    });

}

};