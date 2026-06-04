const API =

location.hostname==='127.0.0.1' ||

location.hostname==='localhost'

?

'http://localhost:3000'

:

'https://agri-mbsb.onrender.com';

console.log(
'USING API:',
API
);

const res = await fetch(

`${API}/auth/loginUser`,

{

method:'POST',

headers:{
'Content-Type':'application/json'
},

body:JSON.stringify({

userId,
password

})

}

);