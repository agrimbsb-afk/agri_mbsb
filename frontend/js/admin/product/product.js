window.productReady = false;

let products = [];
let productMaster = [];
let selectedProductId = "";
let selectedSeason = "";

function getCurrentSeason(){

    const now =
    new Date();

    const month =
    now.getMonth() + 1;

    const year =
    now.getFullYear();

    if(month >= 11){

        return `${year + 1}/1`;

    }

    if(month <= 4){

        return `${year}/1`;

    }

    return `${year}/2`;

}

function closeAllDropdown(){

    document
    .querySelectorAll(
        ".dropdown-list"
    )
    .forEach(d=>{

        d.style.display =
        "none";

    });

    document
    .querySelectorAll(
        ".product-row-dropdown"
    )
    .forEach(d=>{

        d.style.display =
        "none";

    });

}

function markError(input){

    input.classList.add(
        "inputError"
    );

}

//renderTable//
function renderTable(data){

    const tbody =
    document.getElementById(
        "productTable"
    );

    tbody.innerHTML = "";

    if(data.length === 0){

        tbody.innerHTML = `

        <tr>

            <td
            colspan="8"
            style="
                text-align:center;
                padding:30px;
                color:#999;
                font-weight:600;
            ">

                NO DATA

            </td>

        </tr>

        `;

        return;

    }
	
	

    data.forEach(p=>{
		
		const isNegative =

		Number(p.qty_ctn) < 0 ||

		Number(p.qty_pcs) < 0 ||

		Number(p.qty_vol) < 0;

        tbody.innerHTML += `

        <tr class="${isNegative ? 'negative-row' : ''}">

            <td>${p.product_id}</td>

            <td>${p.product_name}</td>

            <td>${p.pcs_per_ctn}</td>

            <td>
                ${p.vol_per_pcs}
                ${p.product_uom}
            </td>

            <td class="${Number(p.qty_ctn) < 0 ? 'negative-stock' : ''}">${p.qty_ctn}</td>

            <td class="${Number(p.qty_pcs) < 0 ? 'negative-stock' : ''}">${p.qty_pcs}</td>

            <td class="${Number(p.qty_vol) < 0 ? 'negative-stock' : ''}">${p.qty_vol}</td>

            <td>
				
				 <button
                        class="iconBtn editBtn"
                        onclick="editProduct('${p.product_id}')">

                            <i class="fa-solid fa-pen-to-square"></i>

                 </button>

            </td>

        </tr>

        `;

    });

}


async function initProductPage(){
	
	window.productReady = true;

    await loadProducts();

    loadSeason();

    loadProductFilter();

    document
    .getElementById("addBtn")
    ?.addEventListener(
        "click",
        openAddModal
    );
	
	document
	.getElementById("outBtn")
	?.addEventListener(
		"click",
		openOutModal
	);
	
	document
	.getElementById("adjustBtn")
	?.addEventListener(
		"click",
		openAdjustModal
	);
	
	document
    .getElementById("saveProductBtn")
    ?.addEventListener(
        "click",
        saveProduct
    );
	
	document
	.getElementById(
		"saveOutBtn"
	)
	?.addEventListener(
		"click",
		saveOutProducts
	);
	
	document
	.getElementById(
		"saveAdjustBtn"
	)
	?.addEventListener(
		"click",
		saveAdjustProducts
	);
	
	document
	.getElementById(
	"addRowBtn"
	)
	?.addEventListener(
	"click",
	addProductRow
	);
	
	document
	.getElementById(
		"saveAllBtn"
	)
	?.addEventListener(
		"click",
		saveAllProducts
	);
	
	document
	.getElementById(
		"addOutRowBtn"
	)
	?.addEventListener(
		"click",
		addOutRow
	);
	
	document
	.getElementById(
		"addAdjustRowBtn"
	)
	?.addEventListener(
		"click",
		addAdjustRow
	);
	

	
	document.addEventListener(
		"click",
		e=>{

			if(
				e.target.classList.contains(
					"dropdown-item"
				)
			){

				selectedProductId =
				e.target.dataset.id;

				document
				.getElementById(
					"searchProduct"
				)
				.value =
				e.target.innerText;

				document
				.getElementById(
					"productDropdown"
				)
				.style.display =
				"none";

				loadProducts();

			}

		}
	);
	
	document.addEventListener(
    "click",
    e=>{

        if(
            e.target.classList.contains(
                "season-item"
            )
        ){

            selectedSeason =
            e.target.dataset.season;

            document
            .getElementById(
                "seasonFilter"
            )
            .value =
            selectedSeason;

            document
            .getElementById(
                "seasonDropdown"
            )
            .style.display =
            "none";

            loadProducts();

        }

    }
);

document.addEventListener(
    "click",
    ()=>{

        closeAllDropdown();

    }
);


	
}

//initProductPage();
window.initProductPage = initProductPage;