const API =

location.hostname === '127.0.0.1' ||
location.hostname === 'localhost'

?

'http://localhost:3000'

:

'https://agri-mbsb.onrender.com';

console.log(
'USING API:',
API
);

const loginBtn =
document.getElementById('loginBtn');

loginBtn.addEventListener(

'click',

async ()=>{

const userId =

document.getElementById(
'username'
).value.trim();

const password =

document.getElementById(
'password'
).value.trim();

try{

const res = await fetch(

`${API}/api/auth/loginUser` ,

{

method:'POST',

headers:{
'Content-Type':
'application/json'
},

body:JSON.stringify({

userId,
password

})

}

);

const data =
await res.json();

console.log(data);

if(data.success){

localStorage.setItem(
'token',
data.token
);

localStorage.setItem(
'userId',
data.user.userId
);

localStorage.setItem(
'userName',
data.user.userName
);

localStorage.setItem(
'userRole',
data.user.userRole
);

alert(
'Login Success'
);

	if(localStorage.getItem('userRole') !== 'admin'){

	   window.location.href = 'drone.html';

	}else{
		
		window.location.href ='admin_page/main.html';

	}


}

else{

alert(

data.message ||

'Login Failed'

);

}

}
catch(err){

console.error(err);

alert(
'Server Error'
);

}

}

);

document.getElementById("username")
.addEventListener("input", function(){

    this.value = this.value.toUpperCase();

});