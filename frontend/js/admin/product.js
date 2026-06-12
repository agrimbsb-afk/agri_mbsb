window.productReady = false;

var products = [];
var productMaster = [];
var selectedProductId = "";
var selectedSeason = "";

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

                headers:{

                    ...getAuthHeaders()

                }

            }

        );

        const result =
        await res.json();

        if(!result.success){

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



const container =
document.getElementById(
    "pagination"
);

async function loadSeason(){

    try{
		
		console.log("LOAD SEASON");

        const res =
        await fetch(
            API + "/api/product/season",
            {
                headers:{
                    Authorization:
                    "Bearer " + token
                }
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
                headers:{
                    Authorization:
                    "Bearer " + token
                }
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

				loadProducts(1);

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

//Modal//

function openAddModal(){

    document
    .getElementById(
        "productModal"
    )
    .classList
    .remove(
        "hidden"
    );

    const tbody =
    document.getElementById(
        "productInputBody"
    );

    tbody.innerHTML = "";

    addProductRow();

}

function openOutModal(){

    document
    .getElementById(
        "productOutModal"
    )
    .classList.remove(
        "hidden"
    );

    const tbody =
    document.getElementById(
        "productOutBody"
    );

    tbody.innerHTML = "";

    addOutRow();

}

function addProductRow(){

    const tbody =
    document.getElementById(
        "productInputBody"
    );

    const tr =
	document.createElement("tr");

	tr.innerHTML = `

    <tr>

        <td>

			<div class="row-search-wrapper">

				<input
				type="text"
				class="product-search"
				placeholder="Select Product">

				<div
				class="product-row-dropdown">
				</div>

			</div>

		</td>

        <td>

            <input
            type="number"
            class="pcs_per_ctn">

        </td>

        <td>

            <input
            type="number"
            class="vol_per_pcs">

        </td>

        <td>

            <input
            class="product_uom"
            placeholder="E.g. ： ML">

        </td>

        <td>

            <input
            type="number"
            class="qty-ctn">

        </td>

        <td>

            <input
            type="number"
            class="qty-pcs">

        </td>

        <td>

            <input
            type="number"
            class="qty-vol">

        </td>

        <td>

            <button
            class="btn btn-danger"
            onclick="removeProductRow(this)">

                <i class="fa-solid fa-trash"></i>

            </button>

        </td>

    </tr>

    `;

	tbody.prepend(tr);
	
	const row = tr;

	const input =
	row.querySelector(
		".product-search"
	);
	
	setTimeout(() => {

		input.focus();

	}, 50);

	const dropdown =
	row.querySelector(
		".product-row-dropdown"
	);
	
	const dropdownId =

		"dd_" +

		Date.now() +

		Math.random();

		dropdown.dataset.id =
		dropdownId;

		row.dataset.dropdownId =
		dropdownId;
	
	document.body.appendChild(
		dropdown
	);
		
	
	
	input.addEventListener(
		"input",
		()=>{

			if(input.value.trim() === ""){

				row.querySelector(
					".pcs_per_ctn"
				).value = "";

				row.querySelector(
					".vol_per_pcs"
				).value = "";

				row.querySelector(
					".product_uom"
				).value = "";

				dropdown.style.display =
				"none";

				return;
			}
			
			const keyword =
			input.value
			.toLowerCase();

			dropdown.innerHTML = "";

			const filtered =

			productMaster.filter(

				p=>

				p.product_name
				.toLowerCase()
				.includes(keyword)

			);

			filtered.forEach(p=>{

				dropdown.innerHTML += `

				<div
				class="row-dropdown-item"

				data-id="${p.product_id}">

					${p.product_name}

				</div>

				`;

			});

			const rect =
			input.getBoundingClientRect();

			dropdown.style.position =
			"fixed";

			dropdown.style.left =
			rect.left + "px";

			dropdown.style.top =
			(rect.bottom + 4) + "px";

			dropdown.style.width =
			rect.width + "px";
			
			dropdown.style.display =
			"block";

		}
	);
	
	dropdown.addEventListener(
		"click",
		e=>{

			if(
				!e.target.classList.contains(
					"row-dropdown-item"
				)
			) return;

			const product =

			productMaster.find(

				p=>

				p.product_id ===
				e.target.dataset.id

			);

			input.value =
			product.product_name;

			dropdown.style.display =
			"none";

			row.querySelector(
				".pcs_per_ctn"
			).value =
			product.pcs_per_ctn || "";

			row.querySelector(
				".vol_per_pcs"
			).value =
			product.vol_per_pcs || "";

			row.querySelector(
				".product_uom"
			).value =
			product.product_uom || "";

		}

	);
	
	row.querySelectorAll(
			"input"
		).forEach(input=>{

			input.addEventListener(
				"input",
				()=>{

					input.classList.remove(
						"inputError"
					);

					const qtyCtn =
					row.querySelector(
						".qty-ctn"
					);

					const qtyPcs =
					row.querySelector(
						".qty-pcs"
					);

					const qtyVol =
					row.querySelector(
						".qty-vol"
					);

					const hasQty =

						Number(qtyCtn.value || 0) > 0 ||

						Number(qtyPcs.value || 0) > 0 ||

						Number(qtyVol.value || 0) > 0;

					if(hasQty){

						qtyCtn.classList.remove(
							"inputError"
						);

						qtyPcs.classList.remove(
							"inputError"
						);

						qtyVol.classList.remove(
							"inputError"
						);

					}

				}
			);

		});


}

function addOutRow(){

    const tbody =
    document.getElementById(
        "productOutBody"
    );

    const tr =
	document.createElement("tr");

	tr.innerHTML = `

    <tr>

        <td>

			<div class="row-search-wrapper">

				<input
				type="text"
				class="product-search"
				placeholder="Select Product">

				<div
				class="product-row-dropdown">
				</div>

			</div>

		</td>

        <td>

            <input
            type="number"
            class="pcs_per_ctn">

        </td>

        <td>

            <input
            type="number"
            class="vol_per_pcs">

        </td>

        <td>

            <input
            class="product_uom"
            placeholder="E.g. ： ML">

        </td>

        <td>

            <input
            type="number"
            class="qty-ctn">

        </td>

        <td>

            <input
            type="number"
            class="qty-pcs">

        </td>

        <td>

            <input
            type="number"
            class="qty-vol">

        </td>

        <td>

            <button
            class="btn btn-danger"
            onclick="removeOutRow(this)">

                <i class="fa-solid fa-trash"></i>

            </button>

        </td>

    </tr>

    `;

	tbody.prepend(tr);
	
	const row = tr;

	const input =
	row.querySelector(
		".product-search"
	);
	
	setTimeout(() => {

		input.focus();

	}, 50);

	const dropdown =
	row.querySelector(
		".product-row-dropdown"
	);
	
	const dropdownId =

		"dd_" +

		Date.now() +

		Math.random();

		dropdown.dataset.id =
		dropdownId;

		row.dataset.dropdownId =
		dropdownId;
	
	document.body.appendChild(
		dropdown
	);
		
	
	
	input.addEventListener(
		"input",
		()=>{

			if(input.value.trim() === ""){

				row.querySelector(
					".pcs_per_ctn"
				).value = "";

				row.querySelector(
					".vol_per_pcs"
				).value = "";

				row.querySelector(
					".product_uom"
				).value = "";

				dropdown.style.display =
				"none";

				return;
			}
			
			const keyword =
			input.value
			.toLowerCase();

			dropdown.innerHTML = "";

			const filtered =

			productMaster.filter(

				p=>

				p.product_name
				.toLowerCase()
				.includes(keyword)

			);

			filtered.forEach(p=>{

				dropdown.innerHTML += `

				<div
				class="row-dropdown-item"

				data-id="${p.product_id}">

					${p.product_name}

				</div>

				`;

			});

			const rect =
			input.getBoundingClientRect();

			dropdown.style.position =
			"fixed";

			dropdown.style.left =
			rect.left + "px";

			dropdown.style.top =
			(rect.bottom + 4) + "px";

			dropdown.style.width =
			rect.width + "px";
			
			dropdown.style.display =
			"block";

		}
	);
	
	dropdown.addEventListener(
		"click",
		e=>{

			if(
				!e.target.classList.contains(
					"row-dropdown-item"
				)
			) return;

			const product =

			productMaster.find(

				p=>

				p.product_id ===
				e.target.dataset.id

			);

			input.value =
			product.product_name;

			dropdown.style.display =
			"none";

			row.querySelector(
				".pcs_per_ctn"
			).value =
			product.pcs_per_ctn || "";

			row.querySelector(
				".vol_per_pcs"
			).value =
			product.vol_per_pcs || "";

			row.querySelector(
				".product_uom"
			).value =
			product.product_uom || "";

		}

	);
	
	row.querySelectorAll(
			"input"
		).forEach(input=>{

			input.addEventListener(
				"input",
				()=>{

					input.classList.remove(
						"inputError"
					);

					const qtyCtn =
					row.querySelector(
						".qty-ctn"
					);

					const qtyPcs =
					row.querySelector(
						".qty-pcs"
					);

					const qtyVol =
					row.querySelector(
						".qty-vol"
					);

					const hasQty =

						Number(qtyCtn.value || 0) > 0 ||

						Number(qtyPcs.value || 0) > 0 ||

						Number(qtyVol.value || 0) > 0;

					if(hasQty){

						qtyCtn.classList.remove(
							"inputError"
						);

						qtyPcs.classList.remove(
							"inputError"
						);

						qtyVol.classList.remove(
							"inputError"
						);

					}

				}
			);

		});

}

function removeProductRow(btn){

    const row =
    btn.closest("tr");

    const dropdownId =
    row.dataset.dropdownId;

    const dropdown =
    document.querySelector(

        `[data-id="${dropdownId}"]`

    );

    if(dropdown){

        dropdown.remove();

    }

    row.remove();

}



async function initProductPage(){
	
	window.productReady = true;

    await loadProducts(1);

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
				
				currentPage = 1;

				loadProducts(1);

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

			currentPage = 1;
			
            loadProducts(1);

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

document
.getElementById(
    "closeModalBtn"
)
.addEventListener(

    "click",

    ()=>{

        document
        .getElementById(
            "productModal"
        )
        .classList.add(
            "hidden"
        );

    }


);

document
.getElementById(
    "closeOutModalBtn"
)
.addEventListener(

    "click",

    ()=>{

        document
        .getElementById(
            "productOutModal"
        )
        .classList.add(
            "hidden"
        );

    }


);

function markError(input){

    input.classList.add(
        "inputError"
    );

}

async function saveAllProducts(){
	
	const saveBtn =
	document.getElementById(
		"saveAllBtn"
	);

	if(saveBtn.disabled){

		return;

	}

	saveBtn.disabled = true;

	saveBtn.innerHTML =

	`
	<i class="fa-solid fa-spinner fa-spin"></i>
	 Saving...
	`;
	
	try {
	
		console.log(
		"TOTAL ROWS =",
		document.querySelectorAll(
				"#productInputBody tr"
			).length
		);
		
		const rows =

		document.querySelectorAll(
			"#productInputBody tr"
		);
		
		const data = [];

		let hasError = false;

		rows.forEach(row=>{

			const product_name =
			row.querySelector(
				".product-search"
			)?.value?.trim();
			
			//Error Alert//
			const productInput =
			row.querySelector(
				".product-search"
			);

			if(!product_name){

				productInput.classList.add(
					"inputError"
				);

				hasError = true;

				return;

			}

			const pcs_per_ctn =
			row.querySelector(
				".pcs_per_ctn"
			)?.value?.trim();

			const vol_per_pcs =
			row.querySelector(
				".vol_per_pcs"
			)?.value?.trim();

			const product_uom =
			row.querySelector(
				".product_uom"
			)?.value?.trim();

			const qty_ctn =
			Number(
				row.querySelector(
					".qty-ctn"
				)?.value || 0
			);

			const qty_pcs =
			Number(
				row.querySelector(
					".qty-pcs"
				)?.value || 0
			);

			const qty_vol =
			Number(
				row.querySelector(
					".qty-vol"
				)?.value || 0
			);

			const pcsInput =
			row.querySelector(
				".pcs_per_ctn"
			);

			const volInput =
			row.querySelector(
				".vol_per_pcs"
			);

			const uomInput =
			row.querySelector(
				".product_uom"
			);

			uomInput.addEventListener(
				"input",
				e=>{

					e.target.value =
					e.target.value
					.toUpperCase()
					.trimStart();

				}
			);
			
			const ctnInput =
			row.querySelector(
				".qty-ctn"
			);

			const pcsQtyInput =
			row.querySelector(
				".qty-pcs"
			);

			const volQtyInput =
			row.querySelector(
				".qty-vol"
			);

			//
			// PRODUCT INFO
			//

			if(!pcs_per_ctn){

				pcsInput.classList.add(
					"inputError"
				);

				hasError = true;
			}

			if(!vol_per_pcs){

				volInput.classList.add(
					"inputError"
				);

				hasError = true;
			}

			if(!product_uom){

				uomInput.classList.add(
					"inputError"
				);

				hasError = true;
			}

			//
			// STOCK QTY
			//

			if(
				qty_ctn === 0 &&
				qty_pcs === 0 &&
				qty_vol === 0
			){

				ctnInput.classList.add(
					"inputError"
				);

				pcsQtyInput.classList.add(
					"inputError"
				);

				volQtyInput.classList.add(
					"inputError"
				);

				hasError = true;
			}

			data.push({

				product_name,
				pcs_per_ctn,
				vol_per_pcs,
				product_uom,
				qty_ctn,
				qty_pcs,
				qty_vol

			});

		});
		
		if(hasError){

			alert(
				"Please Complete Required Fields"
			);

			return;

		}	
		
		console.log(
			"SAVE DATA",
			data
		);
		
		const res =
		await fetch(

			API +
			"/api/product/stockin",

			{

				method:"POST",

				headers:{

					"Content-Type":
					"application/json",

					Authorization:
					"Bearer " + token

				},

				body:JSON.stringify({

					items:data

				})

			}

		);

		const result =
		await res.json();

		console.log(result);

		if(result.success){

			alert(
				"Stock In Saved"
			);
			
			saveBtn.disabled = false;

			saveBtn.innerHTML =
			"SAVE ALL";

			document
			.getElementById(
				"productModal"
			)
			.classList.add(
				"hidden"
			);

			document
			.getElementById(
				"productInputBody"
			).innerHTML = "";

			await loadProducts(1);

		}
	}
	catch(err){

        console.error(err);

        alert(
            "Save Failed"
        );

    }
    finally{

        saveBtn.disabled = false;

        saveBtn.innerHTML =
        "SAVE ALL";

    }
		

}

async function saveOutProducts(){
	
	const saveBtn =
	document.getElementById(
		"saveOutBtn"
	);

	if(saveBtn.disabled){

		return;

	}

	saveBtn.disabled = true;

	saveBtn.innerHTML =

	`
	<i class="fa-solid fa-spinner fa-spin"></i>
	 Saving...
	`;
	
	try {
	
		console.log(
		"TOTAL ROWS =",
		document.querySelectorAll(
				"#productOutBody tr"
			).length
		);
		
		const rows =

		document.querySelectorAll(
			"#productOutBody tr"
		);
		
		const data = [];

		let hasError = false;

		rows.forEach(row=>{

			const product_name =
			row.querySelector(
				".product-search"
			)?.value?.trim();
			
			//Error Alert//
			const productInput =
			row.querySelector(
				".product-search"
			);

			if(!product_name){

				productInput.classList.add(
					"inputError"
				);

				hasError = true;

				return;

			}

			const pcs_per_ctn =
			row.querySelector(
				".pcs_per_ctn"
			)?.value?.trim();

			const vol_per_pcs =
			row.querySelector(
				".vol_per_pcs"
			)?.value?.trim();

			const product_uom =
			row.querySelector(
				".product_uom"
			)?.value?.trim();

			const qty_ctn =
			Number(
				row.querySelector(
					".qty-ctn"
				)?.value || 0
			);

			const qty_pcs =
			Number(
				row.querySelector(
					".qty-pcs"
				)?.value || 0
			);

			const qty_vol =
			Number(
				row.querySelector(
					".qty-vol"
				)?.value || 0
			);

			const pcsInput =
			row.querySelector(
				".pcs_per_ctn"
			);

			const volInput =
			row.querySelector(
				".vol_per_pcs"
			);

			const uomInput =
			row.querySelector(
				".product_uom"
			);

			uomInput.addEventListener(
				"input",
				e=>{

					e.target.value =
					e.target.value
					.toUpperCase()
					.trimStart();

				}
			);
			
			const ctnInput =
			row.querySelector(
				".qty-ctn"
			);

			const pcsQtyInput =
			row.querySelector(
				".qty-pcs"
			);

			const volQtyInput =
			row.querySelector(
				".qty-vol"
			);

			//
			// PRODUCT INFO
			//

			if(!pcs_per_ctn){

				pcsInput.classList.add(
					"inputError"
				);

				hasError = true;
			}

			if(!vol_per_pcs){

				volInput.classList.add(
					"inputError"
				);

				hasError = true;
			}

			if(!product_uom){

				uomInput.classList.add(
					"inputError"
				);

				hasError = true;
			}

			//
			// STOCK QTY
			//

			if(
				qty_ctn === 0 &&
				qty_pcs === 0 &&
				qty_vol === 0
			){

				ctnInput.classList.add(
					"inputError"
				);

				pcsQtyInput.classList.add(
					"inputError"
				);

				volQtyInput.classList.add(
					"inputError"
				);

				hasError = true;
			}

			data.push({

				product_name,
				pcs_per_ctn,
				vol_per_pcs,
				product_uom,
				qty_ctn,
				qty_pcs,
				qty_vol

			});

		});
		
		if(hasError){

			alert(
				"Please Complete Required Fields"
			);

			return;

		}	
		
		console.log(
			"SAVE Out",
			data
		);
		
		const res =
		await fetch(

			API +
			"/api/product/stockout",

			{

				method:"POST",

				headers:{

					"Content-Type":
					"application/json",

					Authorization:
					"Bearer " + token

				},

				body:JSON.stringify({

					items:data

				})

			}

		);

		const result =
		await res.json();

		console.log(result);

		if(result.success){

			alert(
				"Stock Out Saved"
			);
			
			
			saveOutBtn.disabled = false;

			saveOutBtn.innerHTML =
			"SAVE OUT";

			document
			.getElementById(
				"productOutModal"
			)
			.classList.add(
				"hidden"
			);

			document
			.getElementById(
				"productOutBody"
			).innerHTML = "";

			await loadProducts(1);

		}
	}
	catch(err){

        console.error(err);

        alert(
            "Save Failed"
        );

    }
    finally{

        saveBtn.disabled = false;

        saveBtn.innerHTML =
        "SAVE ALL";

    }
		

}



initProductPage();