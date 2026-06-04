const express =
require('express');

const router =
express.Router();

const authController =
require('../controllers/authController');

router.post(

'/loginUser',

authController.loginUser

);

module.exports =
router;