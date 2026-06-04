const pool = require('../config/db');

/* ==================================
   GET DRONE WORK OPTIONS
================================== */

exports.getDroneWorkOptions = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                work_id,
                work_code,
                work_name,
                work_price,
                work_unit,
                work_cat
            FROM work_details
            WHERE work_cat = 'DRONE'
            ORDER BY work_name ASC
        `);

        res.status(200).json(result.rows);

    } catch (err) {

        console.error(
            "GET DRONE WORK OPTIONS ERROR:",
            err
        );

        res.status(500).json({
            success: false,
            message: "Failed to load drone work options"
        });

    }

};