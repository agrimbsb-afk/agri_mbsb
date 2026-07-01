

const express = require("express");
const router = express.Router();

const droneController =
require("../controllers/droneController");

const verifyToken =
require("../middleware/verifyToken");

router.get(
    "/workoptions",
	verifyToken,
    droneController.getDroneWorkOptions
);

router.post(
    "/save",
    verifyToken,
    droneController.saveDroneRecord
);


router.get(
    "/today",
    verifyToken,
    droneController.loadTodayRecords
);

router.get(
    "/today/:date",
    verifyToken,
    droneController.loadTodayRecords
);

router.get(
    "/record/:id",
    verifyToken,
    droneController.getRecordById
);

router.put(
    "/update/:id",
    verifyToken,
    droneController.updateRecord
);

router.delete(
    "/delete/:id",
    verifyToken,
    droneController.deleteRecord
);

router.get(
	'/products/:work',
	droneController.getProductsByWork
);

router.get(
    "/monthly/:month",
    verifyToken,
    droneController.getMonthlyLog
);

router.get(
	"/work-records/:month",
	verifyToken,
	droneController.getMyWorkRecords
);

router.get(
    "/whatsapp",
    verifyToken,
    droneController.loadWhatsappRecords
);


module.exports = router;