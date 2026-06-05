const pool = require('../config/db');

/* ==================================
   GET DRONE WORK OPTIONS
================================== */

exports.getDroneWorkOptions = async (req,res)=>{

    try{

        const result = await pool.query(`
            SELECT
                work_id,
                work_code,
                work_name,
                work_price,
                work_unit,
                work_cat
            FROM work_details
            WHERE work_cat='DRONE'
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

        const today =
        new Date().toISOString().split("T")[0];

        const userName =
        req.user.userName;

        const result =
        await pool.query(
            `
            SELECT *
            FROM drone_workRecord
            WHERE date = $1
            AND by_person = $2
            ORDER BY id ASC
            `,
            [
                today,
                userName
            ]
        );

        res.json({
            success:true,
            data:result.rows
        });

    }
    catch(err){

        console.error(
            "LOAD TODAY RECORD ERROR:",
            err
        );

        res.status(500).json({
            success:false
        });

    }

};



/* ==================================
   SAVE DRONE RECORD
================================== */

exports.saveDroneRecord = async (req,res)=>{

    try{

        const {

            date,
            work,
            block,
            work_area,
            area_ha,
            created_by_name,
            items

        } = req.body;

        for(const item of items){

            console.table({
                1: date,
                2: work,
                3: block,
                4: work_area,
                5: area_ha,
                6: item.item_used,
                7: item.uom,
                8: item.usage,
                9: item.unit,
                10: created_by_name
            });

            await pool.query(
                `
                INSERT INTO drone_workrecord
                (
                    date,
                    work,
                    block,
                    work_area,
                    area_ha,
                    item_used,
                    uom,
                    usage,
                    unit,
                    by_person
                )
                VALUES
                (
                    $1,$2,$3,$4,$5,
                    $6,$7,$8,$9,$10
                )
                `,
                [
                    date,
                    work || '',
                    block || '',
                    work_area || '',
                    Number(area_ha) || 0,
                    item.item_used || '',
                    item.uom || '',
                    Number(item.usage) || 0,
                    item.unit || '',
                    created_by_name || ''
                ]
            );

        }

        res.json({
            success:true,
            message:"Record Saved"
        });

    }
    catch(err){

        console.error(
            "SAVE DRONE RECORD ERROR:",
            err
        );

        res.status(500).json({
            success:false,
            message:"Save Failed"
        });

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

    try{

        const { id } = req.params;

        const {

            date,
            work,
            block,
            work_area,
            area_ha,
            item_used,
            uom,
            usage,
            unit

        } = req.body;

        await pool.query(

            `
            UPDATE drone_workRecord
            SET

                date = $1,
                work = $2,
                block = $3,
                work_area = $4,
                area_ha = $5,
                item_used = $6,
                uom = $7,
                usage = $8,
                unit = $9

            WHERE id = $10
            `,

            [
                date,
                work,
                block,
                work_area,
                Number(area_ha) || 0,
                item_used,
                uom,
                Number(usage) || 0,
                unit,
                id
            ]

        );

        res.json({

            success:true,
            message:"Record Updated"

        });

    }
    catch(err){

        console.error(
            "UPDATE RECORD ERROR:",
            err
        );

        res.status(500).json({

            success:false

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