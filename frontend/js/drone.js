

const API =

location.hostname === '127.0.0.1' ||
location.hostname === 'localhost'

?

'http://localhost:3000'

:

'https://agri-mbsb.onrender.com';

console.log(
'USING API:',
API
);


let itemRows = [];
let currentEditId = null;
let currentRecords = [];

const dialog =
document.getElementById(
'itemDialog'
);

document.addEventListener(

    "DOMContentLoaded",

    async ()=>{

        await validateToken();
		await loadTodayRecords();

    }

);

/* =========================
   AUTH CHECK
========================= */

const token = localStorage.getItem("token");

if(!token){

    alert("Please login first.");

    window.location.href = "login.html";

}

async function validateToken(){

    const token =
    localStorage.getItem("token");

    if(!token){

        window.location.href =
        "login.html";

        return false;

    }

    try{

        const res = await fetch(

            API + "/api/auth/validate",

            {
                headers:{
                    Authorization:
                    "Bearer " + token
                }
            }

        );

        if(!res.ok){

            throw new Error();

        }

        return true;

    }
    catch(err){

        localStorage.clear();

        alert(
            "Session expired. Please login again."
        );

        window.location.href =
        "login.html";

        return false;

    }

}

document.addEventListener(

"DOMContentLoaded",

async ()=>{

    const ok =
    await validateToken();

    if(!ok) return;

    const userName =
    localStorage.getItem(
        "userName"
    );

    if(
        document.getElementById(
            "loginUser"
        )
    ){

        document.getElementById(
            "loginUser"
        ).innerText =
        userName;

    }

await loadTodayRecords();
});

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
    "login.html";

});


let workSelect;
let editWorkSelect;

document.addEventListener(
"DOMContentLoaded",

async ()=>{

    workSelect =
    new TomSelect(
        "#work",
        {
            create:false,
            persist:false
        }
    );

    editWorkSelect =
    new TomSelect(
        "#editWork",
        {
            create:false,
            persist:false
        }
    );

    await loadWorkOptions();

});


async function loadTodayRecords(){

    try{

        const token =
        localStorage.getItem("token");

        const res =
        await fetch(

            API + "/api/drone/today",

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
            "TODAY RECORDS:",
            data
        );

        if(!data.success){
            return;
        }

		currentRecords =
		data.data;

        renderLoadedRecords(
            data.data
        );

    }
    catch(err){

        console.error(err);

    }

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
                    ${record.flow_ha || ''}
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
                    ${record.uom || ''}
                </td>

                <td>
                    ${record.usage || 0}
                </td>

                <td>
                    ${record.unit || ''}
                </td>

                <td class="actionCell">

                    <div class="actionBtns">

                        <button
                        class="iconBtn editBtn"
                        onclick="editRecord(${record.id})">

                            <i class="fa-solid fa-pen-to-square"></i>

                        </button>

                        <button
                        class="iconBtn deleteBtn"
                        onclick="deleteRecord(${record.id})">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            </tr>
            `

        );

    });

}

/* =========================
   OPEN DIALOG
========================= */

document
.getElementById(
'addBtn'
)
.addEventListener(

'click',

()=>{

dialog.classList.remove(
'hidden'
);

if(itemRows.length===0){

addDialogRow();

}

renderDialogRows();

}

);

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

		localDate.setHours(
			localDate.getHours() + 8
		);

		document.getElementById(
			"editDate"
		).value =
		localDate.toISOString().split("T")[0];


    editWorkSelect.setValue(
        row.work || ""
    );

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

        item_used:'',
        uom:'',
        usage:'',
        unit:''

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

<input
class="tableInput"
value="${row.item_used}"
oninput="
this.value=this.value.toUpperCase();
itemRows[${index}].item_used=this.value;
"
>

</td>

<td data-label="UOM">

<input
class="tableInput"
value="${row.uom}"
oninput="
this.value=this.value.toUpperCase();
itemRows[${index}].uom=this.value;
"
>

</td>

<td data-label="Usage">

<input

class="tableInput"

type="number"

value="${row.usage}"

oninput="itemRows[${index}].usage=this.value"

>

</td>

<td data-label="Unit">

<input
class="tableInput"
value="${row.unit}"
oninput="
this.value=this.value.toUpperCase();
itemRows[${index}].unit=this.value;
"
>

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

document
.getElementById(
'dialogSaveBtn'
)
.addEventListener(

'click',

async ()=>{

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
    document.getElementById(
        "work"
    ).value.trim();

    if(!work){

        const tsControl =
        document.querySelector(
            ".ts-control"
        );

        if(tsControl){

            tsControl.classList.add(
                "inputError"
            );

        }

        hasError = true;

    }

    /* ITEM USED + USAGE REQUIRED */

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

            const usageInput =
            row.querySelector(
                'td:nth-child(3) input'
            );

            if(

                !itemRows[index].item_used ||

                itemRows[index]
                .item_used
                .trim() === ''

            ){

                itemInput.classList.add(
                    "inputError"
                );

                hasError = true;

            }

            if(

                itemRows[index].usage === '' ||

                itemRows[index].usage === null ||

                itemRows[index].usage === undefined

            ){

                usageInput.classList.add(
                    "inputError"
                );

                hasError = true;

            }

        }

    );

    if(hasError){

        return;

    }

    try{
		
		const url =
		API + "/api/drone/save";

			const payload = {

				date: workDate,

				work: work,

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

				created_by_name:
				localStorage.getItem(
					"userName"
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

        /* CLEAR ITEMS */

        itemRows = [];

        window.itemRows =
        itemRows;

        renderDialogRows();

        /* RELOAD DASHBOARD */

        await loadTodayRecords();

    }
    catch(err){

        console.error(err);

        alert(
            "Save Failed"
        );

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

const today = new Date();

const yyyy =
today.getFullYear();

const mm =
String(
today.getMonth() + 1
).padStart(2,'0');

const dd =
String(
today.getDate()
).padStart(2,'0');

document.getElementById(
'workDate'
).value =

`${yyyy}-${mm}-${dd}`;

/* input uppercase*/

document.addEventListener("input", function(e) {

    if (
        e.target.tagName === "INPUT" &&
        e.target.type !== "number"
    ) {

        const pos = e.target.selectionStart;

        e.target.value = e.target.value.toUpperCase();

        e.target.setSelectionRange(pos, pos);
    }

});

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

        const data =
        await res.json();

        workSelect.clearOptions();

        editWorkSelect.clearOptions();

        data.forEach(work=>{

            const option = {

                value:
                work.work_name,

                text:
                work.work_name

            };

            workSelect.addOption(
                option
            );

            editWorkSelect.addOption(
                option
            );

        });

        workSelect.refreshOptions(
            false
        );

        editWorkSelect.refreshOptions(
            false
        );
		
		

    }
    catch(err){

        console.error(err);

    }

}

document
.getElementById(
    "updateBtn"
)
.addEventListener(

    "click",

    async ()=>{

        try{

            const payload = {

                date:
                document.getElementById(
                    "editDate"
                ).value,

                work:
                editWorkSelect.getValue(),

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
		
		console.log(
			currentRecords
		);

        try{

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

                    record.work_area+

                    "|" +
					
					record.flow_ha+

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

`DRONE RECORD

User : ${localStorage.getItem("userName")}

`;

            Object.values(
                groups
            ).forEach(rows=>{

                const first =
                rows[0];

                const displayDate =
                new Date(
                    first.date
                )
                .toLocaleDateString(
                    "en-GB"
                );

                message +=

`Date : ${displayDate}
Work : ${first.work}
Block : ${first.block}
Area : ${first.work_area}
HA : ${first.area_ha}
Flow : ${first.flow_ha}
					
Item :
`;

rows.forEach(item=>{

message +=

`${item.item_used} - ${item.usage} ${item.uom}
`;

 });
			message +=
                "\n";
			message +=
                "===================================";
			message +=
                "\n";

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