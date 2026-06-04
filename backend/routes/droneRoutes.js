const express = require("express");
const router = express.Router();

const droneController =
require("../controllers/droneController");

router.get(
    "/workoptions",
    droneController.getDroneWorkOptions
);

module.exports = router;
