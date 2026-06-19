const express =
require("express");

const router =
express.Router();

const verifyToken =
require("../middleware/verifyToken");

const droneSalaryController =
require("../controllers/droneSalaryController");

router.get(

    "/summary",

    verifyToken,

    droneSalaryController
    .getPilotSalarySummary

);

router.get(
    "/records",
    verifyToken,
    droneSalaryController.getPilotWorkRecords
);

router.get(
    "/monthly-summary",
    verifyToken,
    droneSalaryController.getPilotMonthlySummary
);

router.get(
    "/export",
    verifyToken,
    droneSalaryController.exportPilotSalaryExcel
);

module.exports =
router;