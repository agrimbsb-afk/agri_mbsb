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

router.get(
	"/season",
	verifyToken,
	controller.getSeasonList
);

router.get(
	"/list",
	verifyToken,
	controller.getProductList
);

router.post(
    "/stockin",
    verifyToken,
    controller.stockIn
);

router.post(
    "/stockout",
    verifyToken,
    controller.stockOut
);

router.post(
    "/stockadjust",
    verifyToken,
    controller.stockAdjust
);

router.get(
    "/export",
    verifyToken,
    controller.exportExcel
);

module.exports =
router;