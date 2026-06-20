
const token =
localStorage.getItem("token");

if(token){

    const role =
    localStorage.getItem(
        "userRole"
    );

    if(role === 'admin'){

        window.location.replace(
            'admin_page/main.html'
        );

    }else{

        window.location.replace(
            'drone.html'
        );

    }

}

const loginBtn =
document.getElementById(
'loginBtn'
);

let isLoggingIn = false;

loginBtn.addEventListener(

'click',

async ()=>{

if(isLoggingIn)
return;

isLoggingIn = true;

loginBtn.disabled = true;

loginBtn.textContent =
'LOGGING IN...';

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

`${API}/api/auth/loginUser`,

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

if(
localStorage.getItem(
'userRole'
)!=='admin'
){

window.location.replace(
'drone.html'
);

}else{

window.location.replace(
'admin_page/main.html'
);

}

}else{

alert(

data.message ||

'Login Failed'

);

isLoggingIn = false;

loginBtn.disabled =
false;

loginBtn.textContent =
'LOGIN';

}

}
catch(err){

console.error(err);

alert(
'Server Error'
);

isLoggingIn = false;

loginBtn.disabled =
false;

loginBtn.textContent =
'LOGIN';

}

}

);
document.getElementById("username")
.addEventListener("input", function(){

    this.value = this.value.toUpperCase();

});