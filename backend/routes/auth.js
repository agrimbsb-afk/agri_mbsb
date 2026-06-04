const express =
require('express');

const router =
express.Router();

const authController =
require('../controllers/authController');

const verifyToken =
require('../middleware/verifyToken');



router.post(

    '/loginUser',

    authController.loginUser

);

router.get(

    '/validate',

    verifyToken,

    (req,res)=>{

        res.status(200).json({

            success:true,

            user:req.user

        });

    }

);

module.exports =
router;