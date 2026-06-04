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

oninput="itemRows[${index}].item_used=this.value"

>

</td>

<td data-label="UOM">

<input

class="tableInput"

value="${row.uom}"

oninput="itemRows[${index}].uom=this.value"

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

oninput="itemRows[${index}].unit=this.value"

>

</td>

<td data-label="Action">

<button

class="deleteBtn"

onclick="deleteDialogRow(${index})"

>

DELETE

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

<td>
${document.getElementById('workArea').value}
</td>

<td>

<button
class="editBtn"
onclick="editDashboardRow(${index})">

EDIT

</button>

<button
class="deleteBtn"
onclick="deleteDashboardRow(${index})">

DELETE

</button>

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

area_space:
document.getElementById(
'areaSpace'
).value,

work_area:
document.getElementById(
'workArea'
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