let currentPage = 1;

const pageSize = 5;

let totalProducts = 0;


async function loadProducts(page = 1){

    showLoading();

    try{

        const season =

        selectedSeason ||

        getCurrentSeason();

        const productId =

        selectedProductId || "";

        const res =
        await fetch(

            API +
            "/api/product/item?" +

            "season=" +
            encodeURIComponent(season)

            +

            "&product_id=" +
            encodeURIComponent(productId)

            +

            "&page=" +
            page

            +

            "&limit=" +
            pageSize,

            {
                headers:
                getAuthHeaders()
            }

        );

        console.log(
            "STATUS",
            res.status
        );

        const result =
        await res.json();

        console.log(
            "API RESULT",
            result
        );

        if(!result.success){

            console.error(
                "API ERROR",
                result
            );

            return;

        }

        products =
        result.data;

        totalProducts =
        result.total;

        currentPage =
        page;

        renderTable(products);

        renderPagination();

    }
    catch(err){

        console.error(err);

    }

}


function renderPagination(){

    const container =
    document.getElementById(
        "pagination"
    );

    container.innerHTML = "";

    const totalPages =
    Math.ceil(
        totalProducts / pageSize
    );

    if(totalPages <= 1){
        return;
    }

    /* PREV */

    container.innerHTML += `

    <button
    ${currentPage === 1 ? "disabled" : ""}
    onclick="loadProducts(${currentPage - 1})">

        ‹

    </button>

    `;

    const pages = [];

    pages.push(1);

    if(
        currentPage > 3
    ){
        pages.push("...");
    }

    for(
        let i =
        Math.max(
            2,
            currentPage - 1
        );

        i <=
        Math.min(
            totalPages - 1,
            currentPage + 1
        );

        i++
    ){

        pages.push(i);

    }

    if(
        currentPage <
        totalPages - 2
    ){
        pages.push("...");
    }

    if(
        totalPages > 1
    ){
        pages.push(totalPages);
    }

    pages.forEach(page=>{

        if(page === "..."){

            container.innerHTML +=
            `<span class="page-dots">...</span>`;

            return;

        }

        container.innerHTML += `

        <button

        class="
        ${
            page === currentPage
            ? "active"
            : ""
        }"

        onclick="
        loadProducts(${page})
        ">

        ${page}

        </button>

        `;

    });

    /* NEXT */

    container.innerHTML += `

    <button

    ${
        currentPage === totalPages
        ? "disabled"
        : ""
    }

    onclick="
    loadProducts(${currentPage + 1})
    ">

        ›

    </button>

    `;

}
async function loadSeason(){

    try{
		
		console.log("LOAD SEASON");

        const res =
        await fetch(
            API + "/api/product/season",
            {
                headers:
				getAuthHeaders()
            }
        );

        const data =
		await res.json();

		console.log(
			"SEASON DATA",
			data
		);
		
		const input =
		document.getElementById(
			"seasonFilter"
		);

		const dropdown =
		document.getElementById(
			"seasonDropdown"
		);

		dropdown.innerHTML = "";

		data.forEach(row=>{

			dropdown.innerHTML += `

			<div
			class="season-item"
			data-season="${row.season}">

				${row.season}

			</div>

			`;

		});
		
		if(data.length){

			selectedSeason =
			data[0].season;

			input.value =
			data[0].season;

		}
		
		input.addEventListener(
			"click",
			e=>{

				e.stopPropagation();

				closeAllDropdown();

				dropdown.style.display =
				"block";

			}
		);
        
    }
    catch(err){

        console.error(err);

    }

}

//Search Product//
async function loadProductFilter(){

    try{

        const res =
        await fetch(

            API +
            "/api/product/list",

            {
                headers:
				getAuthHeaders()
            }

        );

        productMaster =
		await res.json();
	
		

    }
    catch(err){

        console.error(err);

    }
	
	const input =
	document.getElementById(
		"searchProduct"
	);
	
	input.addEventListener(
		"click",
		e=>{

			e.stopPropagation();

		}
	);
	
	input.addEventListener(
		"input",
		e=>{

			const keyword =
			e.target.value
			.trim()
			.toLowerCase();

			if(keyword === ""){

				selectedProductId = "";

				document
				.getElementById(
					"productDropdown"
				)
				.style.display =
				"none";

				loadProducts();

				return;

			}

			const filtered =
			productMaster.filter(

				p=>

				p.product_name
				.toLowerCase()
				.includes(keyword)

			);

			renderProductDropdown(
				filtered
			);

		}
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

        tbody.innerHTML += `

        <tr>

            <td>${p.product_id}</td>

            <td>${p.product_name}</td>

            <td>${p.pcs_per_ctn}</td>

            <td>
                ${p.vol_per_pcs}
                ${p.product_uom}
            </td>

            <td>${p.qty_ctn}</td>

            <td>${p.qty_pcs}</td>

            <td>${p.qty_vol}</td>

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

function renderProductDropdown(list){

    
	const dropdown =
    document.getElementById(
        "productDropdown"
    );

    dropdown.innerHTML = "";

    if(list.length === 0){

        dropdown.style.display =
        "none";

        return;
    }

    list.forEach(p=>{

        dropdown.innerHTML += `

        <div
        class="dropdown-item"
        data-id="${p.product_id}">

            ${p.product_name}

        </div>

        `;

    });

    dropdown.style.display =
    "block";

}

function showLoading(){

    const tbody =
    document.getElementById(
        "productTable"
    );

    tbody.innerHTML = `

    <tr class="skeleton-row">

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

    </tr>

    <tr class="skeleton-row">

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

    </tr>

    <tr class="skeleton-row">

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

        <td><div class="skeleton"></div></td>

    </tr>

    `;

}

/*EXPORT eXCEL*/
async function exportExcel(){

    const season =

    selectedSeason ||
    getCurrentSeason();

    const res =
    await fetch(

        API +
        "/api/product/export?season=" +
        encodeURIComponent(season),

        {
            headers:
			getAuthHeaders()
        }

    );

    if(!res.ok){

        alert("Export Failed");

        return;

    }

    const blob =
    await res.blob();

    const url =
    window.URL.createObjectURL(blob);

    const a =
    document.createElement("a");

    a.href = url;

    a.download =
    `PRODUCT_${season}.xlsx`;

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);

}

document
.getElementById("exportBtn")
?.addEventListener(
    "click",
    exportExcel
);