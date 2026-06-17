const pool = require('../config/db');

const {
    randomUUID
} = require('crypto');

/* ==================================
   GET DRONE WORK OPTIONS
================================== */

exports.getDroneWorkOptions = async (req,res)=>{

    try{

        const result = await pool.query(`
            SELECT
                *
            FROM work_category
            ORDER BY work_name ASC
        `);

        res.status(200).json(
            result.rows
        );

    }
    catch(err){

        console.error(
            "GET DRONE WORK OPTIONS ERROR:",
            err
        );

        res.status(500).json({
            success:false,
            message:
            "Failed to load drone work options"
        });

    }

};

/* ==================================
   GET DRONE WORK TODAY
================================== */

exports.loadTodayRecords = async (req,res)=>{

    try{

        const date =

        req.params.date ||

        new Date()
        .toLocaleDateString(
            "en-CA",
            {
                timeZone:
                "Asia/Kuala_Lumpur"
            }
        );

        const page =
        Number(
            req.query.page || 1
        );

        const limit =
        Number(
            req.query.limit || 20
        );

        const offset =

        (page - 1) * limit;

        const userId =
        req.user.userId;

        //
        // TOTAL RECORDS
        //

        const totalResult =
        await pool.query(

            `
            SELECT COUNT(*) total
            FROM drone_workRecord
            WHERE date = $1
            AND by_person = $2
            `,

            [
                date,
                userId
            ]

        );

        //
        // PAGE DATA
        //

        const result =
        await pool.query(

            `
            SELECT *
            FROM drone_workRecord
            WHERE date = $1
            AND by_person = $2
            ORDER BY id DESC
            LIMIT $3
            OFFSET $4
            `,

            [
                date,
                userId,
                limit,
                offset
            ]

        );

        res.json({

            success:true,

            data:result.rows,

            total:Number(
                totalResult.rows[0].total
            ),

            page,

            limit

        });

    }
    catch(err){

        console.error(
            "LOAD RECORD ERROR:",
            err
        );

        res.status(500).json({

            success:false

        });

    }

};


exports.getProductsByWork =
async(req,res)=>{

    try{

        const { work } =
        req.params;

        // Step 1
        const categoryResult =
        await pool.query(

            `
            SELECT product_category
            FROM work_category
            WHERE work_name = $1
            `,
            [work]

        );

        if(
            categoryResult.rows.length === 0
        ){

            return res.json([]);

        }

        const category =
        categoryResult.rows[0]
        .product_category;

        // Step 2
        const productResult =
        await pool.query(

            `
            SELECT
                product_id,
                product_name,
                product_uom,
                pcs_per_ctn,
                vol_per_pcs
            FROM stock_products
            WHERE product_category = $1
            ORDER BY product_name
            `,
            [category]

        );

        res.json(
            productResult.rows
        );

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


/* ==================================
   SAVE DRONE RECORD
================================== */

exports.saveDroneRecord = async (req,res)=>{

    const client =
    await pool.connect();

    try{

        const {

            date,
            work,
            flow_ha,
            block,
            work_area,
            area_ha,
            created_by_Id,
            items,
            work_code

        } = req.body;

        console.log(req.body);

        const workDisplay =

            flow_ha

            ? `${work} (${flow_ha} L/HA)`

            : work;

        //
        // SAME JOB ID FOR ALL ITEMS
        //

        const jobId =
        randomUUID();

        await client.query(
            'BEGIN'
        );

        for(const item of items){

            /* =========================
               DRONE WORK RECORD
            ========================= */

            const droneResult =
            await client.query(

            `
            INSERT INTO drone_workrecord
            (
                job_id,

                date,
                work,
                block,
                work_area,

                item_used,
                uom,

                unit,

                area_ha,

                by_person,

                flow_ha,

                work_code,
                work_ctn,
                work_pcs,
                work_vol,

                product_code

            )
            VALUES
            (
                $1,

                $2,$3,$4,$5,
                $6,$7,
                $8,$9,
                $10,
                $11,
                $12,
                $13,$14,$15,
                $16
            )
            RETURNING id
            `,

            [

                jobId,

                date,

                workDisplay || '',

                block || '',

                work_area || '',

                item.item_used || '',

                item.uom || '',

                item.unit_ha || '',

                Number(area_ha) || 0,

                created_by_Id || '',

                Number(flow_ha) || 0,

                work_code || '',

                Number(item.ctn) || 0,

                Number(item.pcs) || 0,

                Number(item.vol) || 0,

                item.product_id || ''

            ]

            );

            const droneRecordId =
            droneResult.rows[0].id;

            /* =========================
               STOCK TRANSACTIONS
            ========================= */

            await client.query(

            `
            INSERT INTO stock_transactions
            (
                job_id,

                transaction_type,

                product_id,

                qty_ctn,
                qty_pcs,
                qty_vol,

                remarks,

                by_person,

                drone_record_id

            )
            VALUES
            (
                $1,

                $2,

                $3,

                $4,$5,$6,

                $7,

                $8,

                $9
            )
            `,

            [

                jobId,

                'OUT',

                item.product_id || '',

                Number(item.ctn) || 0,

                Number(item.pcs) || 0,

                Number(item.vol) || 0,

                workDisplay,

                created_by_Id || '',

                droneRecordId

            ]

            );

        }

        await client.query(
            'COMMIT'
        );

        res.json({

            success:true,

            job_id:jobId,

            message:"Record Saved"

        });

    }
    catch(err){

        await client.query(
            'ROLLBACK'
        );

        console.error(
            "SAVE DRONE RECORD ERROR:"
        );

        console.error(
            err
        );

        res.status(500).json({

            success:false,

            message:err.message

        });

    }
    finally{

        client.release();

    }

};
/* ==================================
   GET SELETED DRONE RECORD
================================== */
exports.getRecordById = async (req,res)=>{

    try{

        const result =
        await pool.query(

            `
            SELECT *
            FROM drone_workRecord
            WHERE id = $1
            `,
            [
                req.params.id
            ]

        );

        if(result.rows.length===0){

            return res.status(404).json({
                success:false
            });

        }

        res.json({

            success:true,

            data:
            result.rows[0]

        });

    }
    catch(err){

        console.error(err);

        res.status(500).json({

            success:false

        });

    }

};


/* ==================================
   UPDATE SELECTED DRONE RECORD
================================== */
exports.updateRecord = async (req,res)=>{

    const client =
    await pool.connect();

    try{

        const { id } =
        req.params;

        const {

            date,
            work,
            flow_ha,
            block,
            work_area,
            area_ha,
            item_used,
            uom,
            usage,
            unit,

            work_ctn,
            work_pcs,
            work_vol,

            product_code

        } = req.body;

        await client.query(
            "BEGIN"
        );

        /* =========================
           UPDATE DRONE RECORD
        ========================= */

        await client.query(

            `
            UPDATE drone_workrecord
            SET

                date = $1,
                work = $2,
                flow_ha = $3,
                block = $4,
                work_area = $5,
                area_ha = $6,

                item_used = $7,
                uom = $8,

                usage = $9,
                unit = $10,

                work_ctn = $11,
                work_pcs = $12,
                work_vol = $13,

                product_code = $14

            WHERE id = $15
            `,

            [

                date,

                work,

                Number(flow_ha) || 0,

                block,

                work_area,

                Number(area_ha) || 0,

                item_used,

                uom,

                Number(usage) || 0,

                unit,

                Number(work_ctn) || 0,

                Number(work_pcs) || 0,

                Number(work_vol) || 0,

                product_code || "",

                id

            ]

        );

        /* =========================
           UPDATE STOCK TRANSACTION
        ========================= */

        await client.query(

            `
            UPDATE stock_transactions
            SET

                product_id = $1,

                qty_ctn = $2,
                qty_pcs = $3,
                qty_vol = $4,

                remarks = $5

            WHERE drone_record_id = $6
            `,

            [

                product_code || "",

                Number(work_ctn) || 0,

                Number(work_pcs) || 0,

                Number(work_vol) || 0,

                work,

                id

            ]

        );

        await client.query(
            "COMMIT"
        );

        res.json({

            success:true,

            message:
            "Record Updated"

        });

    }
    catch(err){

        await client.query(
            "ROLLBACK"
        );

        console.error(
            "UPDATE RECORD ERROR:",
            err
        );

        res.status(500).json({

            success:false,

            message:
            err.message

        });

    }
    finally{

        client.release();

    }

};

exports.getMonthlyLog = async (req,res)=>{

    try{

        const userId =
        req.user.userId;

        const result =
        await pool.query(

`
SELECT

    work_code,

    work,

    work_class_name,

    ROUND(
        SUM(area_ha)::numeric,
        2
    ) AS total_ha,

    ROUND(
        SUM(acre)::numeric,
        2
    ) AS acre,

    MAX(work_price) AS work_price,

    ROUND(
        SUM(amount)::numeric,
        2
    ) AS amount

FROM drone_monthly_log_view

WHERE

    by_person = $1

AND

    DATE_TRUNC(
        'month',
        date
    )

    =

    DATE_TRUNC(
        'month',
        CURRENT_DATE
    )

GROUP BY

    work_code,
    work,
    work_class_name

ORDER BY

    work

`,
        [
            userId
        ]

        );

        const totalSalary =

        result.rows.reduce(

            (sum,row)=>

            sum +

            Number(
                row.amount
            ),

            0

        );

        res.json({

            success:true,

            data:
            result.rows,

            totalSalary:
            totalSalary.toFixed(2)

        });

    }
    catch(err){

        console.error(
            "MONTHLY LOG ERROR:",
            err
        );

        res.status(500).json({

            success:false,

            message:
            err.message

        });

    }

};

/* ==================================
   DELETE SELETED DRONE RECORD
================================== */
exports.deleteRecord = async (req,res)=>{

    try{

        await pool.query(

            `
            DELETE
            FROM drone_workRecord
            WHERE id = $1
            `,

            [
                req.params.id
            ]

        );

        res.json({

            success:true

        });

    }
    catch(err){

        console.error(err);

        res.status(500).json({

            success:false

        });

    }

};