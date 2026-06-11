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
            onclick="removeInRow(this)">

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

function removeInRow(btn){

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

			await loadProducts();

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