
let products = [];

initProductPage();

function initProductPage(){

    loadProducts();

    document
    .getElementById("addBtn")
    ?.addEventListener(
        "click",
        openAddModal
    );

    document
    .getElementById("saveProductBtn")
    ?.addEventListener(
        "click",
        saveProduct
    );

}


//Load Product//
async function loadProducts(){
	
	console.log("LOAD PRODUCTS");

    try{

        const res =
		await fetch(
			API + "/api/product/item",
			{
				headers:{
					Authorization:
					"Bearer " + token
				}
			}
		);

		console.log(
			"STATUS",
			res.status
		);

		products =
		await res.json();

		console.log(products);

		if(!Array.isArray(products)){

			console.error(
				"API ERROR",
				products
			);

			return;
		}

		renderTable(products);

    }
    catch(err){

        console.error(err);

    }

}

//Search Product//
function loadSearch(data){

    const select =
    document.getElementById(
        "searchProduct"
    );

    select.innerHTML =
    '<option value="">All Product</option>';

    data.forEach(p=>{

        select.innerHTML += `

        <option value="${p.product_id}">
            ${p.product_name}
        </option>

        `;

    });

}

//renderTable//
function renderTable(data){

    const tbody =
    document.getElementById(
        "productTable"
    );

    tbody.innerHTML = "";

    data.forEach(p=>{

        tbody.innerHTML += `

        <tr>

            <td>
                ${p.product_id}
            </td>

            <td>
                ${p.product_name}
            </td>

            <td>
                ${p.pcs_per_ctn}
            </td>
			
			<td>
                ${p.vol_per_pcs} ${p.product_uom}
            </td>

            <td>
                ${p.qty_ctn} 
			</td>

            <td>
                ${p.qty_pcs} 
			</td>

            <td>
                ${p.qty_vol}

            </td>

            <td>

                <button
                class="btn btn-primary"
                onclick="editProduct('${p.product_id}')">

                    Edit

                </button>

            </td>

        </tr>

        `;

    });

}

//Modal//

function openAddModal(){

    document
    .getElementById("productModal")
    .classList
    .remove("hidden");

}

//Edit//

function editProduct(productId){

    const p =
    products.find(
        x=>x.product_id===productId
    );

    if(!p) return;

    document.getElementById(
        "productId"
    ).value =
    p.product_id;

    document.getElementById(
        "productName"
    ).value =
    p.product_name;

    document.getElementById(
        "pcsPerCtn"
    ).value =
    p.pcs_per_ctn;

    document.getElementById(
        "productUom"
    ).value =
    p.product_uom;

    document
    .getElementById("productModal")
    .classList
    .remove("hidden");

}

//Save//

async function saveProduct(){

    const token =
    localStorage.getItem("token");

    const body = {

        product_id:
        document.getElementById(
            "productId"
        ).value,

        product_name:
        document.getElementById(
            "productName"
        ).value,

        pcs_per_ctn:
        document.getElementById(
            "pcsPerCtn"
        ).value,

        product_uom:
        document.getElementById(
            "productUom"
        ).value

    };

    try{

        const res =
        await fetch(
            API + "/api/products",
            {
                method:"POST",
                headers:{
                    "Content-Type":
                    "application/json",
                    Authorization:
                    "Bearer " + token
                },
                body:
                JSON.stringify(body)
            }
        );

        if(!res.ok){

            throw new Error();

        }

        document
        .getElementById("productModal")
        .classList
        .add("hidden");

        loadProducts();

    }
    catch(err){

        alert(
            "Save Failed"
        );

    }

}