const API =

location.hostname==='127.0.0.1' ||

location.hostname==='localhost'

?

'http://localhost:3000'

:

'https://agri-mbsb.onrender.com';

console.log(
'USING API:',
API
);

const inputBody =
document.getElementById('inputBody');

const dashboardBody =
document.getElementById('dashboardBody');

let workOptions=[];

// ---------- TODAY DATE ----------

function getToday(){

return new Date()
.toISOString()
.split('T')[0];

}

async function loadWorkOptions(){

try{

const res=

await fetch(

API+
'/records/work-options'

);

workOptions=
await res.json();



// GLOBAL LIST

document
.getElementById(
'workList'
)
.innerHTML=

workOptions.map(

w=>`

<option
value="${w.work_name}">
</option>

`

).join('');



// EDIT LIST

document
.getElementById(
'editWorkList'
)
.innerHTML=

workOptions.map(

w=>`

<option
value="${w.work_name}">
</option>

`

).join('');

}
catch(err){

console.error(err);

}

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

console.log(
'createRow OPTIONS:',
workOptions
);

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

class="tableInput workSelect"

list="workList"

placeholder="SEARCH WORK"

autocomplete="off"

>

<datalist id="workList">

${workOptions.map(

w=>`

<option
value="${w.work_name}">

`

).join('')}

</datalist>

</td>

<td>
<input
type="text"
class="tableInput block">
</td>

<td>
<input
type="number"
class="tableInput qty">
</td>


<td>
<input
type="text"
class="tableInput work_unit"

readonly

tabindex="-1"

style="
background:#d2d3d6;
cursor:not-allowed;
pointer-events:none;
">
</td>

<td>
<input

type="number"

class="tableInput unit_price"

readonly

tabindex="-1"

style="
background:#d2d3d6;
cursor:not-allowed;
pointer-events:none;
"

>
</td>

<td>
<input

type="number"

class="tableInput total"

readonly

tabindex="-1"

style="
background:#d2d3d6;
cursor:not-allowed;
pointer-events:none;
"

>
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

inputBody.addEventListener(

'input',

(e)=>{

const row=
e.target.closest('tr');

if(!row)return;



const qtyInput=
row.querySelector('.qty');

const unitPriceInput=
row.querySelector('.unit_price');

const workUnitInput=
row.querySelector('.work_unit');

const totalInput=
row.querySelector('.total');



// WORK AUTO PRICE + WORK UNIT

if(

e.target.classList
.contains(
'workSelect'
)

){

const selected=

workOptions.find(

w=>

w.work_name
.toLowerCase()

===

e.target.value
.toLowerCase()

);

if(selected){

// UNIT PRICE

unitPriceInput.value=

selected.work_price || '';



// WORK UNIT

workUnitInput.value=

selected.work_unit || '';

}

}



// TOTAL

const qty=

Number(
qtyInput.value || 0
);

const price=

Number(
unitPriceInput.value || 0
);

totalInput.value=

qty && price

?

(qty*price)
.toFixed(2)

:

'';

});




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
'.workSelect'
)
.value,

block:

row
.querySelector(
'.block'
)
.value,

qty:

row
.querySelector(
'.qty'
)
.value,

work_unit:

row
.querySelector(
'.work_unit'
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

// ---------- VALIDATION ----------

row.querySelectorAll(
'input'
).forEach(

input=>{

input.classList.remove(
'inputError'
);

if(

input.dataset.originalPlaceholder

){

input.placeholder=

input.dataset
.originalPlaceholder;

}

}

);

let hasError=false;



function showError(

selector,
message

){

const input=

row.querySelector(
selector
);

if(!input)return;



input.classList.add(
'inputError'
);



if(

!input.dataset
.originalPlaceholder

){

input.dataset
.originalPlaceholder=

input.placeholder;

}



input.value='';

input.placeholder=
message;

hasError=true;

}



// REQUIRED

if(!obj.date){

showError(
'.date',
'DATE REQUIRED'
);

}

if(!obj.work){

showError(
'.workSelect',
'WORK REQUIRED'
);

}

if(

obj.qty==='' ||

obj.qty===null ||

obj.qty===undefined

){

showError(
'.qty',
'QTY REQUIRED'
);

}

if(!obj.by_person){

showError(
'.by_person',
'BY PERSON REQUIRED'
);

}

if(hasError){

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

<td>${r.qty || ''}</td>

<td>${r.work_unit || ''}</td>

<td>${r.unit_price || ''}</td>

<td>${r.by_person || ''}</td>

<td>

<button
class="editBtn action-btn"
onclick="openEdit(
'${r.id}',

'${r.date || ''}',

'${r.work || ''}',

'${r.block || ''}',

'${r.qty || ''}',

'${r.work_unit || ''}',

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
qty,
work_unit,
unit_price,
by_person

){

let workDropdown='';

workOptions.forEach(

w=>{

workDropdown+=`

<option

value="${w.work_name}"

data-price="${w.work_price}"

${

w.work_name===work

?

'selected'

:

''

}

>

${w.work_name}

</option>

`;

});

document
.getElementById(
'editModal'
)

.classList
.remove(
'hidden'
);

editId.value=id;

// DD-MM-YYYY -> YYYY-MM-DD

let formattedDate='';

if(date){

const parts=
date.split('-');

formattedDate=

`${parts[2]}-${parts[1]}-${parts[0]}`;

}

editDate.value=
formattedDate;

editWork.value =
work || '';

editBlock.value=
block || '';

editQty.value=
qty || '';

editwork_unit.value=
work_unit || '';

editUnitPrice.value=
unit_price || '';

editByPerson.value=
by_person || '';

editCalc();

}


// ---------- UPDATE ----------

// ---------- UPDATE ----------

document
.getElementById(
'updateBtn'
)

.addEventListener(

'click',

async()=>{

const filterDate=

document
.getElementById(
'monthFilter'
)
.value;



// ---------- CLEAR OLD WARNING ----------

[

editDate,
editWork,
editQty,
editByPerson

]

.forEach(

input=>{

input.classList.remove(
'inputError'
);

if(

input.dataset
.originalPlaceholder

){

input.placeholder=

input.dataset
.originalPlaceholder;

}

}

);



let hasError=false;



function showError(

input,
message

){

input.classList.add(
'inputError'
);

if(

!input.dataset
.originalPlaceholder

){

input.dataset
.originalPlaceholder=

input.placeholder;

}

input.value='';

input.placeholder=
message;

hasError=true;

}



// ---------- VALIDATION ----------

if(!editDate.value){

showError(

editDate,

'DATE REQUIRED'

);

}



if(!editWork.value){

showError(

editWork,

'WORK REQUIRED'

);

}



if(

editQty.value==='' ||

editQty.value===null ||

editQty.value===undefined

){

showError(

editQty,

'QTY REQUIRED'

);

}



if(!editByPerson.value){

showError(

editByPerson,

'BY PERSON REQUIRED'

);

}



if(hasError){

return;

}



const id=
editId.value;



const payload={

date:
editDate.value,

work:
editWork.value,

block:
editBlock.value,

qty:
editQty.value,

work_unit:
editwork_unit.value,

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

loadDashboard(
filterDate
);

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

// ---------- Auto Calc + QTY Lock ----------

function editCalc(){

const qty=editQty;
const unit=editUnitPrice;
const total=editTotal;

Number(
qty.value||
0
);

const price=

Number(
unit.value||
0
);

total.value=

qty&&price

?

(qty*price)
.toFixed(2)

:

'';

}



// ---------- EDIT EVENT LISTENER ----------

[

editQty,
editUnitPrice

]

.forEach(

el=>{

el.addEventListener(

'input',

editCalc

);

});



// ---------- EDIT WORK DROPDOWN ----------

editWork
.addEventListener(

'input',

()=>{

const selected=

workOptions.find(

w=>

w.work_name
.toLowerCase()

===

editWork.value
.toLowerCase()

);

if(selected){

editUnitPrice.value=

selected.work_price;

}

editCalc();

});

// ---------- ALL INPUT UPPERCASE ----------

document.addEventListener(

'input',

(e)=>{

if(

e.target.matches(

'input[type="text"], input[list]'

)

){

e.target.value =

e.target.value
.toUpperCase();

}

});

// ---------- INITIAL LOAD ----------

(async()=>{
	
const filterDate =

document
.getElementById(
'monthFilter'
)
.value;

await loadWorkOptions();

inputBody.innerHTML='';

inputBody
.insertAdjacentHTML(

'beforeend',

createRow()

);

loadDashboard(filterDate);

})();

document.addEventListener(

'focusin',

(e)=>{

if(

e.target.matches(
'input'
)

){

e.target.classList.remove(
'inputError'
);

if(

e.target.dataset
.originalPlaceholder

){

e.target.placeholder=

e.target.dataset
.originalPlaceholder;

}

}

});