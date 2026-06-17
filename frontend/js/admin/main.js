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
		
		initPageHeader();

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

async function loadModuleScript(page){

    document
    .querySelectorAll(".module-script")
    .forEach(script=>script.remove());

    if(page === "product"){

        const files = [

            "product-call",
            "product-in",
            "product-out",
            "product-adjust",
            "product"

        ];

        for(const file of files){

            await new Promise((resolve,reject)=>{

                const script =
                document.createElement("script");

                script.className =
                "module-script";

                script.src =
                `../js/admin/product/${file}.js?v=${Date.now()}`;

                script.onload = resolve;

                script.onerror = reject;

                document.body.appendChild(script);

            });

        }

        if(typeof initProductPage === "function"){

            await initProductPage();

        }

        return;
    }

    const script =
    document.createElement("script");

    script.className =
    "module-script";

    script.src =
    `../js/admin/${page}/${page}.js?v=${Date.now()}`;

    document.body.appendChild(script);
}


function initPageHeader(){

    const loginUser =
	document.getElementById(
		"loginUser"
	);

	if(loginUser){

		loginUser.textContent =

		localStorage.getItem(
			"userName"
		) ||

		"USER";

	}
	
	const todayDate =
    document.getElementById(
        "todayDate"
    );

    if(todayDate){

        todayDate.textContent =

        new Date()
        .toLocaleDateString(
            "en-GB"
        );

    }

    const logoutBtn =
    document.getElementById(
        "logoutMainBtn"
    );

    if(logoutBtn){

        logoutBtn.onclick = ()=>{

            localStorage.removeItem(
                "token"
            );

            window.location.href =
            "../login.html";

        };

    }

}

