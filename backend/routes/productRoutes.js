console.log(
    "DRONE Product LOADED"
);

const express =
require("express");

const router =
express.Router();

const verifyToken =
require("../middleware/verifyToken");

const controller =
require(
"../controllers/productController"
);

router.get(
"/item",
(req,res,next)=>{

    console.log(
        "ROUTE HIT /item"
    );

    next();

},
verifyToken,
controller.getProducts
);

router.post(
"/",
controller.addProduct
);

module.exports =
router;