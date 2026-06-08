const pool =
require("../config/db");

exports.getProducts =
async(req,res)=>{
	
	console.log(
        "CONTROLLER HIT"
    );

try{

const result =
await pool.query(`

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

ORDER BY product_id

`);

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

exports.addProduct =
async(req,res)=>{

try{

const {

product_id,
product_name,
pcs_per_ctn,
product_uom

}
=
req.body;

await pool.query(

`

INSERT INTO
stock_products

(

product_id,
product_name,
pcs_per_ctn,
product_uom

)

VALUES

($1,$2,$3,$4)

`

,

[
product_id,
product_name,
pcs_per_ctn,
product_uom
]

);

res.json({
message:
"Saved"
});

}
catch(err){

console.error(err);

res.status(500).json({
error:
"Server Error"
});

}

};

