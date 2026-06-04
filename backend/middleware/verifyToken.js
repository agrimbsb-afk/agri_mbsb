const jwt = require("jsonwebtoken");

module.exports = (req,res,next)=>{

    const authHeader =
    req.headers.authorization;

    console.log(
        "AUTH HEADER:",
        authHeader
    );

    if(!authHeader){

        return res.status(401).json({
            success:false,
            message:"No token provided"
        });

    }

    const token =
    authHeader.split(" ")[1];

    console.log(
        "TOKEN:",
        token
    );

    console.log(
        "JWT_SECRET:",
        process.env.JWT_SECRET
    );

    try{

        const decoded =
        jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log(
            "DECODED:",
            decoded
        );

        req.user = decoded;

        next();

    }
    catch(err){

        console.log(
            "JWT ERROR:",
            err.message
        );

        return res.status(401).json({
            success:false,
            message:"Invalid token"
        });

    }

};