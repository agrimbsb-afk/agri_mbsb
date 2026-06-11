function openAdjustModal(){

    document
    .getElementById(
        "productAdjustModal"
    )
    .classList.remove(
        "hidden"
    );

    const tbody =
    document.getElementById(
        "productAdjustBody"
    );

    tbody.innerHTML = "";

    addAdjustRow();

}

function addAdjustRow(){

    const tbody =
    document.getElementById(
        "productAdjustBody"
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
			class="pcs_per_ctn"
			readonly>
		</td>

		<td>
			<input
			type="number"
			class="vol_per_pcs"
			readonly>
		</td>

		<td>
			<input
			class="product_uom"
			readonly>
		</td>

		<!-- SYSTEM -->

		<td>
			<input
			class="system-ctn"
			readonly>
		</td>

		<td>
			<input
			class="system-pcs"
			readonly>
		</td>

		<td>
			<input
			class="system-vol"
			readonly>
		</td>

		<!-- ADJUST -->

		<td>
			<input
			type="number"
			class="adjust-ctn">
		</td>

		<td>
			<input
			type="number"
			class="adjust-pcs">
		</td>

		<td>
			<input
			type="number"
			class="adjust-vol">
		</td>

	</tr>

    `;

    tbody.prepend(tr);

    const row = tr;

    const input =
    row.querySelector(
        ".product-search"
    );

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

    input.focus();

    input.addEventListener(
        "input",
        ()=>{

            const keyword =

            input.value
            .toLowerCase();

            dropdown.innerHTML = "";

            const filtered =

            products.filter(

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

            products.find(

                p=>

                p.product_id ===
                e.target.dataset.id

            );

            if(!product){

                return;

            }

            input.value =
            product.product_name;

            dropdown.style.display =
            "none";

            row.querySelector(".pcs_per_ctn").value =
			product.pcs_per_ctn || "";

			row.querySelector(".vol_per_pcs").value =
			product.vol_per_pcs || "";

			row.querySelector(".product_uom").value =
			product.product_uom || "";

			// 当前库存

			row.querySelector(".system-ctn").value =
			product.qty_ctn || 0;

			row.querySelector(".system-pcs").value =
			product.qty_pcs || 0;

			row.querySelector(".system-vol").value =
			product.qty_vol || 0;

			// 默认带入当前库存

			row.querySelector(".adjust-ctn").value =
			"";

			row.querySelector(".adjust-pcs").value =
			"";

			row.querySelector(".adjust-vol").value =
			"";

        }

    );

}


function removeAdjustRow(btn){

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

async function saveAdjustProducts(){

    const saveBtn =
    document.getElementById(
        "saveAdjustBtn"
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

    try{

        const rows =

        document.querySelectorAll(
            "#productAdjustBody tr"
        );

        const data = [];

        let hasError = false;

        rows.forEach(row=>{
			
				row.querySelectorAll(
				"input"
				).forEach(el=>{

					el.classList.remove(
						"inputError"
					);

				});

            const product_name =

            row.querySelector(
                ".product-search"
            )?.value?.trim();

            if(!product_name){

                row.querySelector(
                    ".product-search"
                )
                .classList.add(
                    "inputError"
                );

                hasError = true;

                return;

            }

            
			const ctnInput =
			row.querySelector(
				".adjust-ctn"
			);

			const pcsInput =
			row.querySelector(
				".adjust-pcs"
			);

			const volInput =
			row.querySelector(
				".adjust-vol"
			);
			
			[ctnInput, pcsInput, volInput]
			.forEach(input=>{

				input.addEventListener(
					"input",
					()=>{

						ctnInput.classList.remove(
							"inputError"
						);

						pcsInput.classList.remove(
							"inputError"
						);

						volInput.classList.remove(
							"inputError"
						);

					}
				);

			});

			if(

				ctnInput.value === "" &&
				pcsInput.value === "" &&
				volInput.value === ""

			){

				ctnInput.classList.add(
					"inputError"
				);

				pcsInput.classList.add(
					"inputError"
				);

				volInput.classList.add(
					"inputError"
				);

				hasError = true;

				return;

			}

			const qty_ctn =
			Number(
				ctnInput.value || 0
			);

			const qty_pcs =
			Number(
				pcsInput.value || 0
			);

			const qty_vol =
			Number(
				volInput.value || 0
			);            

		data.push({

                product_name,

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

        const res =
        await fetch(

            API +
            "/api/product/stockadjust",

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

        if(result.success){

            alert(
                "Stock Adjust Saved"
            );

            document
            .getElementById(
                "productAdjustModal"
            )
            .classList.add(
                "hidden"
            );

            document
            .getElementById(
                "productAdjustBody"
            )
            .innerHTML = "";

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
        "Save Adjust";

    }

}

document
.getElementById(
    "closeAdjustModalBtn"
)
.addEventListener(

    "click",

    ()=>{

        document
        .getElementById(
            "productAdjustModal"
        )
        .classList.add(
            "hidden"
        );

    }


);
