const jwt = require("jsonwebtoken");

module.exports = (req,res,next)=>{

    try{

        const authHeader =
        req.headers.authorization;

        // Authorization Header 不存在

        if(!authHeader){

            return res.status(401).json({

                success:false,

                message:"No token provided"

            });

        }

        // 必须是 Bearer Token

        if(
            !authHeader.startsWith(
                "Bearer "
            )
        ){

            return res.status(401).json({

                success:false,

                message:"Invalid authorization format"

            });

        }

        const token =
        authHeader.split(" ")[1];

        // Token 空值

        if(!token){

            return res.status(401).json({

                success:false,

                message:"Token missing"

            });

        }

        const decoded =
        jwt.verify(

            token,

            process.env.JWT_SECRET

        );

        req.user =
        decoded;

        next();

    }
    catch(err){

        console.error(
            "JWT ERROR:",
            err.message
        );

        return res.status(401).json({

            success:false,

            message:"Invalid or expired token"

        });

    }

};