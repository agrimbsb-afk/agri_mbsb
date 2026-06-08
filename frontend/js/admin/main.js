const API =

location.hostname === 'localhost' ||

location.hostname === '127.0.0.1'

? 'http://localhost:3000'

: 'https://agri-mbsb.onrender.com';

const token =
localStorage.getItem('token');

const role =
localStorage.getItem('userRole');

if(!token){

location.href='login.html';

}

if(role !== 'admin'){

location.href='login.html';

}

const mainContainer =
document.getElementById(
'mainContainer'
);

async function loadPage(page){

    try{

        const res =

        await fetch(
        `./${page}.html`
        );

        const html =

        await res.text();

        mainContainer.innerHTML =
        html;

        loadModuleScript(page);

    }

    catch(err){

        console.error(err);

        mainContainer.innerHTML =

        `
        <div class="card">

            <h2>
            Page Not Found
            </h2>

        </div>
        `;

    }

}

function loadModuleScript(page){

    const oldScript =

    document.getElementById(
    'moduleScript'
    );

    if(oldScript){

        oldScript.remove();

    }

    const script =

    document.createElement(
    'script'
    );

    script.id =
    'moduleScript';

    script.src =

    `../js/admin/${page}.js?v=${
        Date.now()
    }`;

    document.body.appendChild(
    script
    );

}

