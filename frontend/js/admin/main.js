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

    //
    // REMOVE OLD MODULES
    //

    document
    .querySelectorAll(
        ".module-script"
    )
    .forEach(script=>{

        script.remove();

    });

    //
    // PRODUCT MODULE
    //

    if(page === "product"){

        const files = [

            "product-call",
            "product-in",
            "product-out",
            "product-adjust",
            "product"

        ];

        files.forEach(file=>{

            const script =
            document.createElement(
                "script"
            );

            script.className =
            "module-script";

            script.src =

            `../js/admin/product/${file}.js?v=${
                Date.now()
            }`;

            document.body.appendChild(
                script
            );

        });

        return;

    }

    //
    // DEFAULT PAGE
    //

    const script =
    document.createElement(
        "script"
    );

    script.className =
    "module-script";

    script.src =

    `../js/admin/${page}/${page}.js?v=${
        Date.now()
    }`;

    document.body.appendChild(
        script
    );

}
