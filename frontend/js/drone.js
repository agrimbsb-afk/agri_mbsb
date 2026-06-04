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

const dialog =
document.getElementById(
'itemDialog'
);

let workSelect;

document.addEventListener("DOMContentLoaded", async () => {

    workSelect = new TomSelect("#work",{

        create:false,

        persist:false,

        maxOptions:50,

        searchField:["text"],

        sortField:[
            {
                field:"$score",
                direction:"desc"
            }
        ],

        placeholder:"Select Work"

    });
	
	workSelect.on("item_add", function(){

    this.close();

    this.blur();

});

    await loadWorkOptions();

});



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

}



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

()=>{

const hasItem =

itemRows.some(

row=>

row.item_used.trim() !== ''

);

if(!hasItem){

alert(
'Please enter at least one item.'
);

return;

}

renderDashboard();

dialog.classList.add(
'hidden'
);

}

);



/* =========================
   DASHBOARD
========================= */

function renderDashboard(){

const tbody =

document.getElementById(
'recordTable'
);

tbody.innerHTML='';

itemRows.forEach(

(row,index)=>{

tbody.insertAdjacentHTML(

'beforeend',

`

<tr>

<td>
${document.getElementById('workDate').value}
</td>

<td>
${document.getElementById('work').value}
</td>

<td>
${document.getElementById('block').value}
</td>

<td>
${document.getElementById('workArea').value}
</td>

<td>
${document.getElementById('areaSpace').value}
</td>

<td>
${row.item_used}
</td>

<td>
${row.uom}
</td>

<td>
${row.usage}
</td>

<td>
${row.unit}
</td>

<td class="actionCell">

<div class="actionBtns">

<button
class="iconBtn editBtn"
onclick="editDashboardRow(${index})">
<i class="fa-solid fa-pen-to-square"></i>
</button>

<button
class="iconBtn deleteBtn"
onclick="deleteDashboardRow(${index})">
<i class="fa-solid fa-trash"></i>
</button>

</div>

</td>

</tr>

`

);

}

);

}



/* =========================
   EDIT DASHBOARD
========================= */

function editDashboardRow(index){

dialog.classList.remove(
'hidden'
);

renderDialogRows();

setTimeout(()=>{

const rows =

document.querySelectorAll(
'#dialogTableBody tr'
);

if(rows[index]){

rows[index].scrollIntoView({

behavior:'smooth',

block:'center'

});

}

},100);

}

window.editDashboardRow =
editDashboardRow;



/* =========================
   DELETE DASHBOARD
========================= */

function deleteDashboardRow(index){

if(

!confirm(
'Delete this record?'
)

){

return;

}

itemRows.splice(
index,
1
);

if(itemRows.length===0){

addDialogRow();

}

renderDashboard();

}

window.deleteDashboardRow =
deleteDashboardRow;



/* =========================
   SAVE RECORD
========================= */

document
.getElementById(
'saveBtn'
)
.addEventListener(

'click',

()=>{

const payload = {

date:
document.getElementById(
'workDate'
).value,

work:
document.getElementById(
'work'
).value,

block:
document.getElementById(
'block'
).value,

work_area:
document.getElementById(
'workArea'
).value,

area_space:
document.getElementById(
'areaSpace'
).value,

created_by_id:
localStorage.getItem(
'userId'
),

created_by_name:
localStorage.getItem(
'userName'
),

items:
itemRows

};

console.log(
'DRONE RECORD',
payload
);

alert(
'Record Saved To Dashboard Memory'
);

});



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

        const res = await fetch(
            API + "/api/drone/workoptions"
        );

        const data = await res.json();

        workSelect.clearOptions();

        data.forEach(work => {

            workSelect.addOption({

                value: work.work_name,

                text:
                    `${work.work_name}`

            });

        });

        workSelect.refreshOptions(false);

    }
    catch(err){

        console.error(
            "LOAD WORK OPTIONS ERROR:",
            err
        );

    }

}