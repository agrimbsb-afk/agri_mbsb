
let itemRows = [];
let currentEditId = null;
let currentRecords = [];
let selectedWork = '';
let selectedEditWork = '';
let selectedWorkCode = "";
let workOptions = [];

let currentPage = 1;
let totalRecords = 0;
const pageSize = 5;

const dialog =
document.getElementById(
'itemDialog'
);

document.addEventListener(
    "DOMContentLoaded",
    async ()=>{
		
		initHeader();

        await loadWorkOptions();

        await loadTodayRecords();

    }
);

document
.getElementById(
    "workDate"
)
.addEventListener(

    "change",

    ()=>{

        loadTodayRecords(1);

    }

);


document
.getElementById("logoutBtn")
.addEventListener(

"click",

()=>{

    if(
        !confirm("Are you sure want to logout?")
    ){
        return;
    }

    localStorage.clear();

    window.location.href =
    "/";

});


async function loadTodayRecords(page = 1){

    try{

        const selectedDate =

        document.getElementById(
            "workDate"
        )?.value;

        const url =

        selectedDate

        ? API +
          "/api/drone/today/" +
          selectedDate +
          `?page=${page}&limit=${pageSize}`

        : API +
          "/api/drone/today" +
          `?page=${page}&limit=${pageSize}`;

        const res =
        await fetch(

            url,

            {

                headers:{

                    ...getAuthHeaders()

                }

            }

        );

        const data =
        await res.json();

        if(!data.success){

            return;

        }

        currentPage =
        page;

        totalRecords =
        data.total;

        currentRecords =
        data.data;

        renderLoadedRecords(
            data.data
        );

        renderPagination();

    }
    catch(err){

        console.error(err);

    }

}

function renderPagination(){

    const totalPages =

    Math.ceil(
        totalRecords /
        pageSize
    );

    const container =
    document.getElementById(
        "pagination"
    );

    container.innerHTML = "";

    if(totalPages <= 1){
        return;
    }

    const pages = [];

    pages.push(1);

    if(currentPage > 3){

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

    if(totalPages > 1){

        pages.push(
            totalPages
        );

    }

    pages.forEach(page=>{

        if(page === "..."){

            container.innerHTML += `

            <span
            class="page-dots">

                ...

            </span>

            `;

            return;

        }

        container.innerHTML += `

        <button

        class="
        page-btn
        ${page === currentPage ? "active" : ""}
        "

        onclick="
        loadTodayRecords(${page})
        ">

            ${page}

        </button>

        `;

    });

}

function renderLoadedRecords(records){

    const tbody =
    document.getElementById(
        "recordTable"
    );

    tbody.innerHTML = "";

    records.forEach(record=>{

        const displayDate =
        new Date(record.date)
        .toLocaleDateString(
            "en-GB"
        );

        tbody.insertAdjacentHTML(

            "beforeend",

            `
            <tr>


                <td>
                    ${record.work || ''}
                </td>

                <td>
                    ${record.block || ''}
                </td>

                <td>
                    ${record.work_area || ''}
                </td>

                <td>
                    ${record.area_ha || 0}
                </td>

                <td>
                    ${record.item_used || ''}
                </td>

                <td>
                    ${record.unit || ''}
                </td>

                <td>
                    ${record.work_ctn || ''}
                </td>
				
				<td>
                    ${record.work_pcs || ''}
                </td>
				
				<td>
                    ${record.work_vol || ''}
                </td>

                <td class="iconBtn action-cell">

                    

                   
                        <button
                        class="iconBtn deleteBtn"
                        onclick="deleteRecord(${record.id})">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                   

                </td>

            </tr>
            `

        );

    });

}

/* for editBtn
 <button
                        class="iconBtn editBtn"
                        onclick="editRecord(${record.id})" >

                            <i class="fa-solid fa-pen-to-square" ></i>

                        </button>

*/

async function loadMonthlyLog(month){

    try{

        const res =
        await fetch(

            API +
            "/api/drone/monthly/" + month,

            {
                headers:{
                    Authorization:
                    "Bearer " +
                    localStorage.getItem(
                        "token"
                    )
                }
            }

        );

        const data =
        await res.json();

        if(!data.success){

            alert("Load Failed");
            return;

        }

        renderMonthlySummary(
            data.data,
            data.totalSalary
        );

    }
    catch(err){

        console.error(err);

        alert("Load Failed");

    }

}

async function loadWorkRecords(month){

    const res =
    await fetch(
        API + "/api/drone/work-records/" + month,
        {
            headers:getAuthHeaders()
        }
    );

    const data =
    await res.json();

    renderWorkRecords(
        data.data
    );

}

function renderMonthlySummary(
    rows,
    totalSalary
){

    let html = `

    <table class="table">

        <thead>

            <tr>

                <th>Work</th>
				<th>BEG</th>
                <th>HA</th>
                <th>Price</th>
                <th>Amount</th>

            </tr>

        </thead>

        <tbody>

    `;

    rows.forEach(row=>{

        html += `

        <tr>

            <td>${row.work}</td>
			
<td>${row.beg == 0 ? '' : row.beg}</td>

<td>${row.total_ha == 0 ? '' : row.total_ha}</td>

            <td>RM ${row.work_price}</td>

            <td style="text-align:left"> ${row.amount}</td>

        </tr>

        `;

    });

    html += `

        </tbody>

    </table>

    <div
    style="
        margin-top:20px;
        text-align:right;
        font-size:22px;
        font-weight:700;
    ">

        TOTAL SALARY :
        RM ${Number(totalSalary).toFixed(2)}

    </div>

    `;

    document
    .getElementById(
        "monthlySummaryContent"
    )
    .innerHTML =
    html;

}


function renderWorkRecords(rows){

let html = `
<div class="work-record-wrapper">

    <table class="work-record-table">

<thead>

<tr>
<th>Date</th>
<th>Work</th>
<th>HA</th>
<th>BEG</th>
<th>Acre</th>
<th>Price</th>
<th>Amount</th>
</tr>

</thead>
</div>
<tbody>
`;

rows.forEach(row=>{

html += `
<tr>

<td>${row.date}</td>

<td>${row.work}</td>


<td>${row.area_ha == 0 ? '' : row.area_ha}</td>

<td>${row.beg == 0 ? '' : row.beg}</td>

<td>${row.acre == 0 ? '' : row.acre}</td>

<td>RM ${row.work_price}</td>

<td>RM ${row.amount}</td>

</tr>
`;

});

html += `
</tbody>
</table>
`;

document.getElementById(
"workRecordContent"
).innerHTML = html;

}

function renderEditWorkDropdown(data){

    const dropdown =
    document.getElementById(
        "editWorkDropdown"
    );

    if(!dropdown) return;

    dropdown.innerHTML = '';

    data.forEach(work=>{

        dropdown.insertAdjacentHTML(

            'beforeend',

            `
            <div
            class="dropdown-item"
            onclick="
			selectWork(
			'${work.work_name}',
			'${work.work_code}'
			)">
                ${work.work_name}
            </div>
            `

        );

    });

}

/* =========================
   OPEN DIALOG
========================= */

document
.getElementById(
    "addBtn"
)
.addEventListener(

    "click",

    async ()=>{

        const currentWork =
		selectedWork;

        /* WORK REQUIRED */

        if(!currentWork){

            document
			.getElementById("searchWork")
			.classList.add("inputError");

            alert(
                "Please select Work first."
            );

            return;

        }

        /* FLOW HA REQUIRED */

        const flowHa =
        document.getElementById(
            "flowha"
        ).value.trim();

        const requireFlowWorks = [

            "RUMPUT",
            "BATAS",
            "ULAT",
            "SIPUT",
			"PRE_PLANTING"

        ];

        const workName =
		selectedWork
		.toUpperCase()
		.replace(/\s*\(.*?\)\s*/g,"")
		.trim();

		const needFlow =
		requireFlowWorks.includes(workName);
		
		const areaHa =
		document.getElementById(
			"areaha"
		).value.trim();

        if(
            needFlow &&
            !flowHa
        ){

            document
            .getElementById(
                "flowha"
            )
            .classList.add(
                "inputError"
            );

        }
		
		if(needFlow &&
            !areaHa){

			document
			.getElementById(
				"areaha"
			)
			.classList.add(
				"inputError"
			);

		}
		
		if(needFlow && (!flowHa || !areaHa)){

			alert(
				`${currentWork} requires L/HA and Area (HA).`
			);
			
			return;

		}
		
		

        document
        .getElementById(
            "dialogTitle"
        )
        .innerText =

        `DRONE ITEMS - ${currentWork}`;

        await loadProductsByWork(
			currentWork
		);

		dialog.classList.remove(
			"hidden"
		);

        if(
            itemRows.length === 0
        ){

            addDialogRow();

        }

        renderDialogRows();

    }

);

document
.getElementById(
    "searchWork"
)
.addEventListener(

    "input",

    ()=>{

        document
        .getElementById(
            "searchWork"
        )
        .classList.remove(
            "inputError"
        );

    }

);

document
.getElementById("flowha")
.addEventListener(
    "input",
    e=>{

        e.target.classList.remove(
            "inputError"
        );

    }
);

document
.getElementById("areaha")
.addEventListener(
    "input",
    e=>{

        e.target.classList.remove(
            "inputError"
        );

    }
);


function toggleFlowHa(){

    const requireFlowWorks = [

        "RUMPUT",
        "BATAS",
        "ULAT",
        "SIPUT",
		"PRE_PLANTING"

    ];

    const workName =
		selectedWork
		.toUpperCase()
		.replace(/\s*\(.*?\)\s*/g,"")
		.trim();

	const needFlow =
		requireFlowWorks.includes(workName);

    const flowWrapper =
    document.getElementById(
        "flowhaWrapper"
    );

    if(needFlow){

        flowWrapper.style.display =
        "";

    }
    else{

        flowWrapper.style.display =
        "none";

        document
        .getElementById(
            "flowha"
        )
        .value = "";

    }

}

let currentProducts = [];

async function loadProductsByWork(work){

    try{

        const res =
        await fetch(

            API +
            "/api/drone/products/" +
            encodeURIComponent(work),

            {
                headers:{
                    Authorization:
                    "Bearer " +
                    localStorage.getItem(
                        "token"
                    )
                }
            }

        );

        currentProducts =
        await res.json();

    }
    catch(err){

        console.error(err);

    }

}


function editRecord(id){

    currentEditId = id;

    const row = currentRecords.find(
        r => r.id == id
    );

    if(!row){

        alert(
            "Record not found"
        );

        return;

    }
	
	const localDate =
		new Date(row.date);

	document.getElementById(
			"editDate"
		).value =
		formatMYDateInput(
			row.date
		);

    selectedEditWork =
	row.work || "";

	document.getElementById(
		"editWork"
	).value =
	row.work || "";
	
	
	document.getElementById(
        "editflowha"
    ).value =
    row.flow_ha || "";

    document.getElementById(
        "editBlock"
    ).value =
    row.block || "";

    document.getElementById(
        "editWorkArea"
    ).value =
    row.work_area || "";

    document.getElementById(
        "editAreaHa"
    ).value =
    row.area_ha || "";

    document.getElementById(
        "editItemUsed"
    ).value =
    row.item_used || "";

    document.getElementById(
        "editUom"
    ).value =
    row.uom || "";

    document.getElementById(
        "editUsage"
    ).value =
    row.usage || "";

    document.getElementById(
        "editUnit"
    ).value =
    row.unit || "";

    document
    .getElementById(
        "editDialog"
    )
    .classList.remove(
        "hidden"
    );

}

const logDialog =
document.getElementById(
    "logDialog"
);

document
.getElementById(
    "logBtn"
)
.addEventListener(

    "click",

    async ()=>{

        logDialog.classList.remove(
            "hidden"
        );

        document
        .getElementById(
            "logSummary"
        )
        workRecordContent.innerHTML =
		"Loading...";

		monthlySummaryContent.innerHTML =
		"Loading...";

        const month =
		new Date()
		.toLocaleDateString(
			"en-CA",
			{
				timeZone:"Asia/Kuala_Lumpur"
			}
		)
		.substring(0,7);

		document.getElementById(
			"searchMonth"
		).value = month;

		await loadMonthlyLog(month);
		await loadWorkRecords(month);

    }

);

/* =========================
   CLOSE DIALOG
========================= */

document
.getElementById(
'closeDialogBtn'
)
.addEventListener(

'click',

()=>{

dialog.classList.add(
'hidden'
);

}

);
/*CLOSE LOG DIALOG*/
document
.getElementById(
    "closeLogBtn"
)
.addEventListener(

    "click",

    ()=>{

        logDialog.classList.add(
            "hidden"
        );

    }

);


document
.getElementById("searchBtn")
.addEventListener(

    "click",

    async ()=>{

        const month =
        document.getElementById(
            "searchMonth"
        ).value;

        await loadMonthlyLog(month);

        await loadWorkRecords(month);

    }

);

document
.getElementById("searchMonth")
.addEventListener(

    "change",

    async ()=>{

        const month = this.value;

        await loadMonthlyLog(month);

        await loadWorkRecords(month);

    }

);


/* =========================
   ADD ROW
========================= */

document
.getElementById(
'addDialogRowBtn'
)
.addEventListener(

'click',

addDialogRow

);

function addDialogRow(){

		itemRows.push({

		product_id:'',

		item_used:'',

		uom:'',

		unit_ha:'',

		pcs_per_ctn:0,

		vol_per_pcs:0,

		ctn:0,

		pcs:0,

		vol:0

	});

    renderDialogRows();

    setTimeout(()=>{

        const tbody =
        document.getElementById(
            'dialogTableBody'
        );

        const lastRow =
        tbody.lastElementChild;

        if(lastRow){

            lastRow.scrollIntoView({

                behavior:'smooth',

                block:'nearest'

            });

        }

    },50);

}

/* =========================
   Edit Dialog
========================= */
document
.getElementById(
    "closeEditDialogBtn"
)
.addEventListener(

    "click",

    ()=>{

        document
        .getElementById(
            "editDialog"
        )
        .classList.add(
            "hidden"
        );

    }

);


/* =========================
   DELETE ROW
========================= */

function deleteDialogRow(index){

itemRows.splice(
index,
1
);

if(itemRows.length===0){

addDialogRow();

return;

}

renderDialogRows();

}

window.deleteDialogRow =
deleteDialogRow;

async function deleteRecord(id){

    if(!confirm(
        "Delete this record?"
    )){
        return;
    }

    try{

        const res = await fetch(

            API +
            "/api/drone/delete/" +
            id,

            {

                method:"DELETE",

                headers:{
                    Authorization:
                    "Bearer " +
                    localStorage.getItem(
                        "token"
                    )
                }

            }

        );

        const data =
        await res.json();

        if(!data.success){

            alert(
                "Delete Failed"
            );

            return;

        }

        alert(
            "Record Deleted"
        );

        await loadTodayRecords();

    }
    catch(err){

        console.error(err);

        alert(
            "Delete Failed"
        );

    }

}

/* =========================
   RENDER DIALOG TABLE
========================= */

function renderDialogRows(){

const tbody =

document.getElementById(
'dialogTableBody'
);

tbody.innerHTML='';

itemRows.forEach(

(row,index)=>{

tbody.insertAdjacentHTML(

'beforeend',

`

<tr>

<td data-label="Item Used">

<div class="search-dropdown">

    <input
    type="text"
    class="tableInput"

    value="${row.item_used || ''}"

    placeholder="Search Product"

    onfocus="
    renderProductDropdown(${index});
    document.getElementById(
    'productDropdown${index}'
    ).style.display='block';
    "

    oninput="
    filterProducts(
    ${index},
    this.value
    )
    ">

    <div

    id="productDropdown${index}"

    class="dropdown-list">

    </div>

</div>

</td>

<td data-label="Unit/HA">

<input
class="tableInput"
type="number"

value="${row.unit_ha || ''}"

oninput="

itemRows[${index}].unit_ha =
Number(this.value) || 0;

calculateRow(${index});

">

</td>

<td>

<input
id="ctn_${index}"
class="tableInput calcInput"
type="number"
value="${row.ctn || ''}"

oninput="
itemRows[${index}].ctn =
Number(this.value)||0;
">

</td>

<td>

<input
id="pcs_${index}"
class="tableInput calcInput"
type="number"
value="${row.pcs || ''}"

oninput="
itemRows[${index}].pcs =
Number(this.value)||0;
">

</td>

<td>

<input
id="vol_${index}"
class="tableInput calcInput"
type="number"
value="${row.vol ||''}"

oninput="
itemRows[${index}].vol =
Number(this.value)||0;
">

</td>

<td data-label="Action">

<button
class="iconBtn deleteBtn"
onclick="deleteDialogRow(${index})">

    <i class="fa-solid fa-trash"></i>

</button>

</td>

</tr>

`

);

}

);

}


/* =========================
   SAVE DIALOG
========================= */

// ---------- SAVE DRONE RECORD ----------

let isDroneSaving = false;

document
.getElementById(
'dialogSaveBtn'
)
.addEventListener(

'click',

async()=>{

    // 防止双击
    if(isDroneSaving){
        return;
    }

    const saveBtn =
    document.getElementById(
        'dialogSaveBtn'
    );

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try{

        /* CLEAR OLD ERROR */

        document
        .querySelectorAll(
            ".inputError"
        )
        .forEach(el=>{

            el.classList.remove(
                "inputError"
            );

        });

        let hasError = false;

        /* DATE REQUIRED */

        const workDate =
        document.getElementById(
            "workDate"
        ).value.trim();

        if(!workDate){

            document
            .getElementById(
                "workDate"
            )
            .classList.add(
                "inputError"
            );

            hasError = true;

        }

        /* WORK REQUIRED */

		const work =
		selectedWork;

        if(!work){

            document
			.getElementById(
				"searchWork"
			)
			.classList.add(
				"inputError"
			);

            hasError = true;

        }

        /* FLOW HA REQUIRED */

        const flowHa =
        document.getElementById(
            "flowha"
        ).value.trim();

        const requireFlowWorks = [

            "RUMPUT",
            "BATAS",
            "ULAT",
            "SIPUT",
			"PRE_PLANTING"

        ];

        const workName =
		selectedWork
		.toUpperCase()
		.replace(/\s*\(.*?\)\s*/g,"")
		.trim();

		const needFlow =
		requireFlowWorks.includes(workName);

        if(
            needFlow &&
            !flowHa
        ){

            document
            .getElementById(
                "flowha"
            )
            .classList.add(
                "inputError"
            );

            alert(
                `${work} requires L/HA.`
            );

            hasError = true;

        }
		/* ITEM USED + UNIT/HA REQUIRED */

		const requireUnitHaWorks = [

				"RUMPUT",
				"BATAS",
				"ULAT",
				"SIPUT",
				"PRE_PLANTING"

			];
	
		const needUnitHa =
		requireUnitHaWorks.includes(
			(selectedWork || "").toUpperCase()
		);
		
		const rows =
		document.querySelectorAll(
			"#dialogTableBody tr"
		);

		rows.forEach(

		(row,index)=>{

			const itemInput =
			row.querySelector(
				'td:nth-child(1) input'
			);

			const unitInput =
			row.querySelector(
				'td:nth-child(2) input'
			);

			if(
				!itemRows[index].item_used
			){

				itemInput.classList.add(
					"inputError"
				);

				hasError = true;

			}
		

			
			if(
				needUnitHa &&
				!itemRows[index].unit_ha
			){

				unitInput.classList.add(
					"inputError"
				);

				hasError = true;

			}

		});

        if(hasError){

            return;

        }

        isDroneSaving = true;

        const url =
        API + "/api/drone/save";

        const payload = {

            date: workDate,

            work: work,
			
			work_code: selectedWorkCode,

            block:
            document.getElementById(
                "block"
            ).value,

            flow_ha:
            document.getElementById(
                "flowha"
            ).value,

            work_area:
            document.getElementById(
                "workArea"
            ).value,

            area_ha:
            document.getElementById(
                "areaha"
            ).value,

            created_by_Id:
            localStorage.getItem(
                "userId"
            ),

            items:
            itemRows

        };

        const res =
        await fetch(

            url,

            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json",

                    Authorization:
                    "Bearer " +
                    localStorage.getItem(
                        "token"
                    )

                },

                body:
                JSON.stringify(
                    payload
                )

            }

        );

        const data =
        await res.json();

        if(!data.success){

            alert(

                data.message ||

                "Save Failed"

            );

            return;

        }

        alert(
            "Record Saved"
        );

        dialog.classList.add(
            "hidden"
        );

        /* KEEP DATE */

        document.getElementById(
            "workDate"
        ).value = workDate;

        /* CLEAR FORM */

        selectedWork = '';

		document.getElementById(
			"searchWork"
		).value = '';

        document.getElementById(
            "flowha"
        ).value = "";

        document.getElementById(
            "block"
        ).value = "";

        document.getElementById(
            "workArea"
        ).value = "";

        document.getElementById(
            "areaha"
        ).value = "";

        itemRows = [];

        window.itemRows =
        itemRows;

        renderDialogRows();

        await loadTodayRecords();

    }

    catch(err){

        console.error(
            err
        );

        alert(
            "Save Failed"
        );

    }

    finally{

        isDroneSaving = false;

        saveBtn.disabled = false;

        saveBtn.textContent = 'SAVE';

    }

}
);




/* =========================
   GLOBAL
========================= */

window.itemRows =
itemRows;

/* =========================
   DEFAULT DATE = TODAY
========================= */

document.getElementById(
    "workDate"
).value =
getMYDate();

function getMYDate(){

    return new Date()
    .toLocaleDateString(
        "en-CA",
        {
            timeZone:
            "Asia/Kuala_Lumpur"
        }
    );

}

document.addEventListener(

    "click",

    e=>{

        document
        .querySelectorAll(
            ".dropdown-list"
        )
        .forEach(dropdown=>{

            const wrapper =
            dropdown.closest(
                ".search-dropdown"
            );

            if(
                wrapper &&
                !wrapper.contains(
                    e.target
                )
            ){

                dropdown.style.display =
                "none";

            }

        });

    }

);

/* input uppercase*/

document.addEventListener(

    "input",

    function(e){

        if(
            e.target.tagName !== "INPUT"
        ) return;

        if(
            ![
                "text",
                "search"
            ].includes(
                e.target.type
            )
        ) return;

        const pos =
        e.target.selectionStart;

        e.target.value =
        e.target.value.toUpperCase();

        try{

            e.target.setSelectionRange(
                pos,
                pos
            );

        }
        catch(err){}

    }

);

async function loadWorkOptions(){

    try{

        const res =
        await fetch(

            API + "/api/drone/workoptions",

            {
                headers:{
                    Authorization:
                    "Bearer " +
                    localStorage.getItem(
                        "token"
                    )
                }
            }

        );

		

        workOptions =
        await res.json();

        renderWorkDropdown(
            workOptions
        );

        renderEditWorkDropdown(
            workOptions
        );

    }
    catch(err){

        console.error(err);

    }

}

function renderWorkDropdown(data){

    const dropdown =
    document.getElementById(
        "workDropdown"
    );

    dropdown.innerHTML = '';

    data.forEach(work=>{

        const div =
        document.createElement(
            "div"
        );

        div.className =
        "dropdown-item";

        div.dataset.work =
        work.work_name;

        div.textContent =
        work.work_name;

        div.addEventListener(
            "click",
            ()=>{

                selectWork(
                    work.work_name,
					work.work_code
                );

            }
        );

        dropdown.appendChild(
            div
        );

    });

}

function renderProductDropdown(
    index,
    keyword=''
){

    const dropdown =
    document.getElementById(
        `productDropdown${index}`
    );

    if(!dropdown) return;

    const filtered =

    currentProducts.filter(

        p=>

        p.product_name
        .toUpperCase()
        .includes(
            keyword.toUpperCase()
        )

    );

    dropdown.innerHTML =

    filtered.map(product=>`

	<div
	class="dropdown-item"

	onclick="
	selectProduct(
	${index},
	'${product.product_id}'
	)
	">

	${product.product_name}

	</div>

	`).join('');

}

function selectWork(
    work,
    work_code
){

    selectedWork =
    work;

    selectedWorkCode =
    work_code;

    const searchWork =
    document.getElementById(
        "searchWork"
    );

    searchWork.value =
    work;

    searchWork.classList.remove(
        "inputError"
    );

    searchWork
    .closest(".search-dropdown")
    ?.classList.remove(
        "inputError"
    );

    toggleFlowHa();

    document
    .querySelectorAll(
        "#workDropdown .dropdown-item"
    )
    .forEach(item=>{

        item.classList.remove(
            "selected"
        );

        if(
            item.innerText.trim() === work
        ){

            item.classList.add(
                "selected"
            );

        }

    });

    document.getElementById(
        "workDropdown"
    ).style.display =
    "none";

}

function filterProducts(
    index,
    keyword
){

    renderProductDropdown(
        index,
        keyword
    );

}


function selectEditWork(work){

    selectedEditWork = work;

    document.getElementById(
        "editSearchWork"
    ).value = work;

    document.getElementById(
        "editWorkDropdown"
    ).style.display = "none";

}

function selectProduct(
    index,
    productId
){

    const product =
    currentProducts.find(
        p => p.product_id === productId
    );

    if(!product) return;

    itemRows[index].product_id =
    product.product_id;

    itemRows[index].item_used =
    product.product_name;

    itemRows[index].uom =
    product.product_uom;

    itemRows[index].pcs_per_ctn =
    Number(product.pcs_per_ctn);

    itemRows[index].vol_per_pcs =
    Number(product.vol_per_pcs);

    calculateRow(index);

    renderDialogRows();


}

function calculateRow(index){
	
	

    const areaHa =
    Number(
        document.getElementById(
            "areaha"
        ).value
    ) || 0;


	
    const row =
    itemRows[index];

    const totalUsage =
    areaHa *
    (Number(row.unit_ha) || 0);

    const boxSize =
    row.pcs_per_ctn *
    row.vol_per_pcs;
	

    row.ctn =
    Math.floor(
        totalUsage / boxSize
    );

    const balance =
    totalUsage -
    (row.ctn * boxSize);


    row.pcs =
    Math.floor(
        balance /
        row.vol_per_pcs
    );


    row.vol =
    balance -
    (row.pcs * row.vol_per_pcs);



		/* VOL 进位 */

		if (
			row.uom &&
			row.uom.toUpperCase() === "BEG"
		) {

			// BEG：只要有剩余，就多算 1 PCS
			if (row.vol > 0) {

				row.pcs++;
				row.vol = 0;

			}

		}
		else {

			// ML/G：VOL 进位到 50
			if (row.vol > 0) {

				row.vol =
				Math.ceil(
					row.vol / 50
				) * 50;

			}

		}

    /* 如果 VOL 满一 PCS */

    while(
        row.vol >=
        row.vol_per_pcs
    ){

        row.vol -=
        row.vol_per_pcs;

        row.pcs++;

    }

    /* 如果 PCS 满一 CTN */

    while(
        row.pcs >=
        row.pcs_per_ctn
    ){

        row.pcs -=
        row.pcs_per_ctn;

        row.ctn++;

    }

    const ctnInput =
		document.getElementById(
			`ctn_${index}`
		);

		if(ctnInput){

			ctnInput.value =
			row.ctn;

		}

		const pcsInput =
		document.getElementById(
			`pcs_${index}`
		);

		if(pcsInput){

			pcsInput.value =
			row.pcs;

		}

		const volInput =
		document.getElementById(
			`vol_${index}`
		);

		if(volInput){

			volInput.value =
			row.vol;

		}

}

document
.getElementById(
    "searchWork"
)
.addEventListener(

    "input",

    function(){

        const keyword =
        this.value.toUpperCase();

        const filtered =

        workOptions.filter(

            work =>

            work.work_name
            .toUpperCase()
            .includes(keyword)

        );

        renderWorkDropdown(
            filtered
        );

    }

);

document
.getElementById(
    "searchWork"
)
.addEventListener(

    "focus",

    ()=>{

        document
        .getElementById(
            "workDropdown"
        )
        .style.display =
        "block";

    }

);

document
.getElementById(
    "updateBtn"
)
.addEventListener(

    "click",

    async ()=>{

        try{
			/* FLOW HA REQUIRED */

            const work =
			selectedEditWork;

            const flowHa =
            document.getElementById(
                "editflowha"
            ).value.trim();

            const requireFlowWorks = [

                "RUMPUT",
                "BATAS",
                "ULAT",
                "SIPUT",
				"PRE_PLANTING"

            ];

            const workName =
			selectedWork
			.toUpperCase()
			.replace(/\s*\(.*?\)\s*/g,"")
			.trim();

			const needFlow =
			requireFlowWorks.includes(workName);

            if(
                needFlow &&
                !flowHa
            ){

                document
                .getElementById(
                    "editflowha"
                )
                .classList.add(
                    "inputError"
                );

                alert(
                    `${work} requires L/HA.`
                );

                return;

            }
			
            const payload = {

                date:
                document.getElementById(
                    "editDate"
                ).value,

                work:
				selectedEditWork,

				flow_ha:
                document.getElementById(
                    "editflowha"
                ).value,
				
                block:
                document.getElementById(
                    "editBlock"
                ).value,

                work_area:
                document.getElementById(
                    "editWorkArea"
                ).value,

                area_ha:
                document.getElementById(
                    "editAreaHa"
                ).value,

                item_used:
                document.getElementById(
                    "editItemUsed"
                ).value,

                uom:
                document.getElementById(
                    "editUom"
                ).value,

                usage:
                document.getElementById(
                    "editUsage"
                ).value,

                unit:
                document.getElementById(
                    "editUnit"
                ).value

            };

            const res = await fetch(

                API +
                "/api/drone/update/" +
                currentEditId,

                {

                    method:"PUT",

                    headers:{

                        "Content-Type":
                        "application/json",

                        Authorization:
                        "Bearer " +
                        localStorage.getItem(
                            "token"
                        )

                    },

                    body:JSON.stringify(
                        payload
                    )

                }

            );

            const data =
            await res.json();

            if(!data.success){

                alert(
                    "Update Failed"
                );

                return;

            }

            alert(
                "Record Updated"
            );

            document
            .getElementById(
                "editDialog"
            )
            .classList.add(
                "hidden"
            );

            await loadTodayRecords();

        }
        catch(err){

            console.error(err);

            alert(
                "Update Failed"
            );

        }

    }

);



/* =========================
   WHATSAPP EXPORT
========================= */

document
.getElementById(
    "whatsappBtn"
)
.addEventListener(

    "click",

    async ()=>{

        try{

            const res = await fetch(

                API +
                "/api/drone/whatsapp",

                {
                    headers:{
                        Authorization:
                        "Bearer " +
                        localStorage.getItem(
                            "token"
                        )
                    }
                }

            );

            const result =
            await res.json();

            if(
                !result.success
            ){

                alert(
                    "Load records failed."
                );

                return;

            }

            const currentRecords =
            result.data;

            console.log(
                currentRecords
            );

            if(
                !currentRecords ||
                currentRecords.length === 0
            ){

                alert(
                    "No records found."
                );

                return;

            }

            const groups = {};

            currentRecords.forEach(record=>{

                const key =

                    record.date +

                    "|" +

                    record.work +

                    "|" +

                    record.block +

                    "|" +

                    record.work_area +

                    "|" +

                    record.flow_ha +

                    "|" +

                    record.area_ha;

                if(
                    !groups[key]
                ){

                    groups[key] = [];

                }

                groups[key].push(
                    record
                );

            });

            let message =

`PILOT : ${localStorage.getItem("userName")}

`;

            Object.values(
                groups
            ).forEach(rows=>{

                const first =
                rows[0];

                const displayDate =
                formatMYDate(
                    first.date
                );

                message +=

`*Date\t: ${displayDate}*
Work\t: ${first.work}
Area\t: ${first.work_area}
HA\t\t: ${first.area_ha}
Flow\t: ${first.flow_ha} L/HA

Usage\t:
`;

                rows.forEach(rcd=>{

                    message +=

`${rcd.item_used.replace(/\s*\([^)]*\)/g, "")} - ${rcd.unit} ${rcd.uom}/HA
`;

                });

                message +=

`
Item\t:
`;

                rows.forEach(item=>{

                    let usageText = '';

                    if(Number(item.work_ctn) > 0){

                        usageText +=
                        `${item.work_ctn} CTN `;

                    }

                    if(Number(item.work_pcs) > 0){

                        usageText +=
                        `${item.work_pcs} PCS `;

                    }

                    if(Number(item.work_vol) > 0){

                        let vol =
                        Number(item.work_vol);

                        let uom =
                        (item.uom || '')
                        .toUpperCase();

                        if(vol >= 1000){

                            if(uom === 'ML'){

                                vol =
                                vol / 1000;

                                uom =
                                'L';

                            }
                            else if(uom === 'G'){

                                vol =
                                vol / 1000;

                                uom =
                                'KG';

                            }

                        }

                        const displayVol =

                        Number.isInteger(vol)

                        ? vol

                        : vol.toFixed(2);

                        usageText +=
                        `${displayVol} ${uom}`;

                    }

                    message +=

`${item.item_used} - ${usageText.trim()}
`;

                });

                message +=
                    "\n";

                message +=
                    "==========================";

                message +=
                    "\n\n";

            });

            await navigator.clipboard.writeText(
                message
            );

            const whatsappUrl =

                "https://wa.me/?text=" +

                encodeURIComponent(
                    message
                );

            window.open(
                whatsappUrl,
                "_blank"
            );

        }
        catch(err){

            console.error(
                err
            );

            alert(
                "Copy Failed"
            );

        }

    }

);
const workRecordTab =
document.getElementById(
    "workRecordTab"
);

const monthlySummaryTab =
document.getElementById(
    "monthlySummaryTab"
);

const workRecordContent =
document.getElementById(
    "workRecordContent"
);

const monthlySummaryContent =
document.getElementById(
    "monthlySummaryContent"
);

workRecordTab.addEventListener(
    "click",
    ()=>{

        workRecordTab.classList.add(
            "active"
        );

        monthlySummaryTab.classList.remove(
            "active"
        );

        workRecordContent.classList.remove(
            "hidden"
        );

        monthlySummaryContent.classList.add(
            "hidden"
        );

    }
);

monthlySummaryTab.addEventListener(
    "click",
    ()=>{

        monthlySummaryTab.classList.add(
            "active"
        );

        workRecordTab.classList.remove(
            "active"
        );

        monthlySummaryContent.classList.remove(
            "hidden"
        );

        workRecordContent.classList.add(
            "hidden"
        );

    }
);




function initHeader(){

    const loginUser =
    document.getElementById(
        "loginUser"
    );

    if(loginUser){

        loginUser.textContent =
        localStorage.getItem(
            "userName"
        ) || "USER";

    }

    const todayDate =
    document.getElementById(
        "todayDate"
    );

    if(todayDate){

        todayDate.textContent =
		formatMYDate(
			getMYNow()
		);

    }

}