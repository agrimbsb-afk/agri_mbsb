//const API='http://localhost:3000';
const API='https://agri-mbsb.onrender.com';
const inputBody =
document.getElementById('inputBody');

const dashboardBody =
document.getElementById('dashboardBody');



// ---------- TODAY DATE ----------

function getToday(){

return new Date()
.toISOString()
.split('T')[0];

}



// ---------- OPEN DIALOG ----------

document
.getElementById(
'openDialogBtn'
)

.addEventListener(

'click',

()=>{

document
.getElementById(
'inputModal'
)

.classList
.remove(
'hidden'
);

}

);



// ---------- CLOSE DIALOG ----------

document
.getElementById(
'closeDialogBtn'
)

.addEventListener(

'click',

()=>{

document
.getElementById(
'inputModal'
)

.classList
.add(
'hidden'
);

}

);



// ---------- CREATE INPUT ROW ----------

function createRow(){

return `

<tr>

<td>

<input
type="date"
class="tableInput date"
value="${getToday()}">

</td>

<td>

<input
type="text"
class="tableInput work">

</td>

<td>

<input
type="text"
class="tableInput block">

</td>

<td>

<input
type="number"
class="tableInput ha">

</td>

<td>

<input
type="number"
class="tableInput bag">

</td>

<td>

<input
type="number"
class="tableInput acre">

</td>

<td>

<input
type="number"
class="tableInput unit_price">

</td>

<td>

<input
type="number"
class="tableInput total">

</td>

<td>

<input
type="text"
class="tableInput by_person">

</td>

<td>

<button
class="deleteInputRow">

DELETE

</button>

</td>

</tr>

`;

}



// ---------- DEFAULT ROW ----------

inputBody
.insertAdjacentHTML(

'beforeend',

createRow()

);



// ---------- ADD ROW ----------

document
.getElementById(
'addRowBtn'
)

.addEventListener(

'click',

()=>{

inputBody
.insertAdjacentHTML(

'beforeend',

createRow()

);

}

);



// ---------- DELETE INPUT ROW ----------

inputBody
.addEventListener(

'click',

(e)=>{

if(

e.target
.classList
.contains(
'deleteInputRow'
)

){

e.target
.closest('tr')
.remove();

}

}

);



// ---------- SAVE ALL ----------

document
.getElementById(
'saveAllBtn'
)

.addEventListener(

'click',

async()=>{
	
const filterDate =

document
.getElementById(
'monthFilter'
)
.value;

const rows=[

...inputBody
.querySelectorAll(
'tr'
)

];

const payload=[];

for(const row of rows){

const obj={

date:

row
.querySelector(
'.date'
)
.value,

work:

row
.querySelector(
'.work'
)
.value,

block:

row
.querySelector(
'.block'
)
.value,

ha:

row
.querySelector(
'.ha'
)
.value,

bag:

row
.querySelector(
'.bag'
)
.value,

acre:

row
.querySelector(
'.acre'
)
.value,

unit_price:

row
.querySelector(
'.unit_price'
)
.value,

total:

row
.querySelector(
'.total'
)
.value,

by_person:

row
.querySelector(
'.by_person'
)
.value

};



if(

!obj.date ||

!obj.work ||

!obj.by_person

){

alert(

'DATE / WORK / BY PERSON required.'

);

return;

}



payload.push(
obj
);

}



try{

const res=

await fetch(

API+
'/records/bulk',

{

method:'POST',

headers:{

'Content-Type':
'application/json'

},

body:

JSON.stringify(
payload
)

}

);



if(

!res.ok

){

throw new Error(
'Save Failed'
);

}



alert(
'Saved Successfully'
);



// CLEAR INPUT

inputBody.innerHTML='';

inputBody
.insertAdjacentHTML(

'beforeend',

createRow()

);



// CLOSE DIALOG

document
.getElementById(
'inputModal'
)

.classList
.add(
'hidden'
);



// RELOAD DASHBOARD

loadDashboard(filterDate);

}

catch(err){

console.error(
err
);

alert(
'Save Error'
);

}

}

);

// ---------- LOAD DASHBOARD ----------

async function loadDashboard(

month=''

){

try{

// 如果没传month

if(!month){

month =
document
.getElementById(
'filterMonth'
)
?.value || '';

}



// 如果filter为空

if(!month){

const today =
new Date();

month =
today
.toISOString()
.slice(0,7);



const filterInput=
document.getElementById(
'filterMonth'
);

if(filterInput){

filterInput.value=
month;

}

}



let url=
API+'/records';

url +=
`?month=${month}`;



const res=
await fetch(url);

const data=
await res.json();

dashboardBody.innerHTML='';



data.forEach(

r=>{

dashboardBody
.insertAdjacentHTML(

'beforeend',

`

<tr>


<td>${r.date || ''}</td>

<td>${r.work || ''}</td>

<td>${r.block || ''}</td>

<td>${r.ha || ''}</td>

<td>${r.bag || ''}</td>

<td>${r.acre || ''}</td>

<td>${r.unit_price || ''}</td>

<td>${r.by_person || ''}</td>

<td>

<button
class="editBtn action-btn"
onclick="openEdit(


'${r.date || ''}',

'${r.work || ''}',

'${r.block || ''}',

'${r.ha || ''}',

'${r.bag || ''}',

'${r.acre || ''}',

'${r.unit_price || ''}',

'${r.by_person || ''}'

)">

EDIT

</button>

<button
class="deleteBtn action-btn"
onclick="deleteRecord(
${r.id}
)">

DELETE

</button>

</td>

</tr>

`

);

}

);

}

catch(err){

console.error(err);

}

}

// ---------- MONTH PICKER AUTO FILTER ----------

document
.getElementById(
'monthFilter'
)

.addEventListener(

'change',

(e)=>{

loadDashboard(
e.target.value
);

}

);



// ---------- CLEAR FILTER ----------

document
.getElementById(
'clearFilterBtn'
)

.addEventListener(

'click',

()=>{

document
.getElementById(
'monthFilter'
).value='';

loadDashboard();

}

);



// ---------- EXPORT EXCEL ----------

document
.getElementById(
'exportBtn'
)

.addEventListener(

'click',

()=>{

const month =

document
.getElementById(
'monthFilter'
)
.value;

let url=

API+
'/records/export';



if(month){

url +=
`?month=${month}`;

}



// DOWNLOAD EXCEL

window.open(

url,

'_blank'

);

}

);


// ---------- DELETE ----------

async function deleteRecord(id){

const filterDate =

document
.getElementById(
'monthFilter'
)
.value;

if(

!confirm(
'Delete record?'
)

){

return;

}



await fetch(

API+
'/records/'+id,

{

method:'DELETE'

}

);



loadDashboard(filterDate);

}



// ---------- OPEN EDIT ----------

function openEdit(

id,
date,
work,
block,
ha,
bag,
acre,
unit_price,
total,
by_person

){

document
.getElementById(
'editModal'
)

.classList
.remove(
'hidden'
);



// DD-MM-YYYY -> YYYY-MM-DD

let formattedDate='';

if(date){

const parts=

date.split('-');

formattedDate=

`${parts[2]}-${parts[1]}-${parts[0]}`;

}



editId.value=id;

editDate.value=
formattedDate;

editWork.value=
work;

editBlock.value=
block;

editHa.value=
ha;

editBag.value=
bag;

editAcre.value=
acre;

editUnitPrice.value=
unit_price;

editTotal.value=
total;

editByPerson.value=
by_person;

}



// ---------- UPDATE ----------

document
.getElementById(
'updateBtn'
)

.addEventListener(

'click',

async()=>{

const filterDate =

document
.getElementById(
'monthFilter'
)
.value;

const id=
editId.value;

const payload={

date:
editDate.value,

work:
editWork.value,

block:
editBlock.value,

ha:
editHa.value,

bag:
editBag.value,

acre:
editAcre.value,

unit_price:
editUnitPrice.value,

total:
editTotal.value,

by_person:
editByPerson.value

};

const res=

await fetch(

API+
'/records/'+id,

{

method:'PUT',

headers:{

'Content-Type':
'application/json'

},

body:
JSON.stringify(
payload
)

}

);

if(!res.ok){

alert(
'Update Failed'
);

return;

}

alert(
'Updated Successfully'
);

closeModal();

loadDashboard(filterDate);

}

);



// ---------- CLOSE EDIT ----------

function closeModal(){

document
.getElementById(
'editModal'
)

.classList
.add(
'hidden'
);

}



document
.getElementById(
'closeModalBtn'
)

.addEventListener(

'click',

closeModal

);

// ---------- DEFAULT CURRENT MONTH ----------

const currentMonth =

new Date()
.toISOString()
.slice(0,7);

document
.getElementById(
'monthFilter'
)
.value =
currentMonth;

// ---------- INITIAL LOAD ----------

loadDashboard(currentMonth);
