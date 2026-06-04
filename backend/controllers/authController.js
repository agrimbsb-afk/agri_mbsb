const bcrypt =
require('bcryptjs');

const jwt =
require('jsonwebtoken');

const pool =
require('../config/db');

exports.loginUser = async (req,res)=>{

try{

const {
userId,
password
} = req.body;

const result = await pool.query(

`
SELECT
id,
"user_Id",
"user_Name",
"user_password"
FROM "user_Details"
WHERE "user_Id" = $1
`,

[userId]

);

if(result.rows.length===0){

return res.status(401).json({

message:'Invalid User ID'

});

}

const user =
result.rows[0];

const valid =
await bcrypt.compare(

password,

user.user_password

);

if(!valid){

return res.status(401).json({

message:'Invalid Password'

});

}

const token =
jwt.sign(

{
id:user.id,
userId:user.user_Id
},

process.env.JWT_SECRET ||

'AGRI_MBSB_SECRET',

{
expiresIn:'1d'
}

);

res.json({

success:true,
token,

user:{
id:user.id,
userId:user.user_Id,
userName:user.user_Name
}

});

}
catch(err){

console.error(err);

res.status(500).json({

message:'Server Error'

});

}

};