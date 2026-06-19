

const inputBody =
document.getElementById('inputBody');

const dashboardBody =
document.getElementById('dashboardBody');

let workOptions=[];
let staffOptions=[];
let dateSortAsc = false; // false=最新在上

// ---------- TODAY DATE ----------

function getToday(){

return new Date()
.toISOString()
.split('T')[0];

}

async function loadWorkers(){

try{

const res=

await fetch(

API+
'/records/staff'

);

staffOptions=

await res.json();



document
.getElementById(
'staffList'
)
.innerHTML=

staffOptions.map(

w=>`

<option

value="${w.worker_name}"

>

`

).join('');



}
catch(err){

console.error(err);

}

}

async function loadWorkOptions(){

try{
	
console.time('WORK_OPTIONS');

const res =
await fetch(
API + '/records/work-options'
);

console.timeEnd('WORK_OPTIONS');

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

document.body.style.overflow='hidden';

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

document.body.style.overflow='';

}

);



// ---------- CREATE INPUT ROW ----------
function createRow(date = getToday()){


    return `

    <tr>

         <td>
            <input
            type="date"
            class="tableInput date"
            value="${date}">
        </td>

        <td>
            <input
            class="tableInput workSelect"
            list="workList"
            placeholder="SEARCH WORK">
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
            readonly>
        </td>

        <td>
            <input
            type="number"
            class="tableInput unit_price"
            readonly>
        </td>

        <td>
            <input
            type="number"
            class="tableInput total"
            readonly>
        </td>

        <td>
            <input
            class="tableInput by_person"
            list="staffList"
            placeholder="SELECT WORKER">
        </td>

        <td>
             <button
                class="iconBtn deleteBtn">
                <i class="fa-solid fa-trash"></i>
            </button>
        </td>

    </tr>

    `;



}


// ---------- ADD ROW ----------

document
.getElementById(
    "addRowBtn"
)
.addEventListener(

    "click",

    ()=>{

        /* GET LAST SELECTED DATE */

        const dateInputs =

        [
            ...inputBody.querySelectorAll(
                ".date"
            )
        ];

        let selectedDate =
        getToday();

        if(dateInputs.length){

            selectedDate =

            dateInputs[
                dateInputs.length - 1
            ].value

            || getToday();

        }

        /* INSERT NEW ROW */

        inputBody
        .insertAdjacentHTML(

            "afterbegin",

            createRow(
                selectedDate
            )

        );

        /* SCROLL TO TOP */

        const modalBody =
        document.querySelector(
            ".modal-body"
        );

        modalBody.scrollTo({

            top:0,

            behavior:"smooth"

        });

        /* FOCUS WORK */

        setTimeout(()=>{

            const firstWork =

            inputBody.querySelector(
                ".workSelect"
            );

            if(firstWork){

                firstWork.focus();

            }

        },100);

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



// ---------- INPUT EventListener ----------
inputBody.addEventListener(

'input',

(e)=>{

const row=
e.target.closest('tr');

if(!row)return;

inputCalc(
row
);

});

inputBody.addEventListener(

'mousedown',

(e)=>{

if(

e.target.classList.contains('workSelect') ||

e.target.classList.contains('by_person')



){

e.preventDefault();

e.target.focus();

e.target.showPicker?.();

}

});

function sortByDate(){

    allRecords.sort((a,b)=>{

        const d1 =
        a.date.split('-').reverse().join('-');

        const d2 =
        b.date.split('-').reverse().join('-');

        return dateSortAsc
        ? new Date(d1) - new Date(d2)
        : new Date(d2) - new Date(d1);

    });

    dateSortAsc = !dateSortAsc;

    currentPage = 1;

    renderDashboard();

}
//Save All//
document
.getElementById('saveAllBtn')
.addEventListener(

'click',

async()=>{

const saveBtn =
document.getElementById(
'saveAllBtn'
);

// 防止重复点击
if(saveBtn.disabled){
    return;
}

saveBtn.disabled = true;
saveBtn.textContent = 'Saving...';

try{

const filterDate =
document
.getElementById(
'monthFilter'
)
.value;

const rows=[
...inputBody.querySelectorAll('tr')
];

const payload=[];

for(const row of rows){

    const date =
    row.querySelector('.date').value.trim();

    const work =
    row.querySelector('.workSelect').value.trim();

    const byPerson =
    row.querySelector('.by_person').value.trim();

    const qty =
    row.querySelector('.qty').value;

    if(
        !date ||
        !work ||
        !byPerson ||
        qty === ''
    ){

        alert(
        'Please fill Date, Work, Qty and By Person.'
        );

        return;
    }

    payload.push({

        date,

        work,

        block:
        row.querySelector('.block').value || '',

        qty,

        work_unit:
        row.querySelector('.work_unit').value || '',

        unit_price:
        row.querySelector('.unit_price').value || 0,

        total:
        row.querySelector('.total').value || 0,

        by_person:
        byPerson

    });

}

const res = await fetch(

API + '/records/bulk',

{
    method:'POST',

    headers:{
        'Content-Type':
        'application/json'
    },

    body:
    JSON.stringify(payload)
}

);

if(!res.ok){

    throw new Error(
    'Save Failed'
    );

}

alert('Saved Successfully');

inputBody.innerHTML='';

inputBody.insertAdjacentHTML(
'beforeend',
createRow()
);

document
.getElementById('inputModal')
.classList.add('hidden');

loadDashboard(filterDate);

}

catch(err){

    console.error(err);

    alert('Save Error');

}

finally{

    saveBtn.disabled = false;

    saveBtn.textContent = 'SAVE';

}

});



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

allRecords=
await res.json();

allRecords.sort((a,b)=>{

    const d1 =
    a.date.split('-').reverse().join('-');

    const d2 =
    b.date.split('-').reverse().join('-');

    return new Date(d2) - new Date(d1);

});

currentPage = 1;

renderDashboard();


}

catch(err){

console.error(err);

}

}

// ---------- RENDER DASHBOARD ----------

function renderDashboard(){

const dashboardBody=

document.getElementById(
'dashboardBody'
);



const start=

(currentPage-1)
*rowsPerPage;

const end=

start+rowsPerPage;



const pageData=

allRecords.slice(
start,
end
);



dashboardBody.innerHTML=

pageData.map(

r=>`

<tr>

<td>${r.date||''}</td>

<td>${r.work||''}</td>

<td>${r.block||''}</td>

<td>${r.qty||''}</td>

<td>${r.work_unit||''}</td>

<td>${r.unit_price||''}</td>

<td>${r.by_person||''}</td>

<td class="iconBtn action-cell">

<button 
onclick="openEdit(
'${r.id}',
'${r.date}',
'${r.work}',
'${r.block ||''}',
'${r.qty}',
'${r.work_unit}',
'${r.unit_price}',
'${r.total}',
'${r.by_person}'
)" class="iconBtn editBtn" >

	<i class="fa-solid fa-pen-to-square"></i>

</button>

<button

class="iconBtn deleteBtn"

onclick="deleteRecord(

'${r.id}'

)"

>

<i class="fa-solid fa-trash"></i>

</button>

</td>

</tr>

`

).join('');



renderPagination();

}

// ---------- PAGINATION BUTTON ----------

function renderPagination(){

    const totalPages =
    Math.ceil(
        allRecords.length / rowsPerPage
    );

    let html = '';

    // PREV
    html += `
    <button
    class="page-nav"
    ${currentPage===1?'disabled':''}
    onclick="
    if(currentPage>1){
        currentPage--;
        renderDashboard();
    }">
    <i class="fa-solid fa-chevron-left"></i>
    </button>
    `;

    let start =
    Math.max(1,currentPage-2);

    let end =
    Math.min(totalPages,currentPage+2);

    if(start > 1){

        html += `
        <button onclick="
        currentPage=1;
        renderDashboard();
        ">1</button>
        `;

        if(start > 2){
            html += `<span>...</span>`;
        }
    }

    for(let i=start;i<=end;i++){

        html += `
        <button
        class="${
        i===currentPage
        ?'active'
        :''
        }"
        onclick="
        currentPage=${i};
        renderDashboard();
        ">
        ${i}
        </button>
        `;
    }

    if(end < totalPages){

        if(end < totalPages-1){
            html += `<span>...</span>`;
        }

        html += `
        <button onclick="
        currentPage=${totalPages};
        renderDashboard();
        ">
        ${totalPages}
        </button>
        `;
    }

    // NEXT
    html += `
    <button
    class="page-nav"
    ${currentPage===totalPages?'disabled':''}
    onclick="
    if(currentPage<totalPages){
        currentPage++;
        renderDashboard();
    }">
    <i class="fa-solid fa-chevron-right"></i>
    </button>
    `;

    document
    .getElementById('pagination')
    .innerHTML = html;
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
total,
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
'editDialog'
)

.classList
.remove(
'hidden'
);

document.body.style.overflow='hidden';

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

editWorkUnit.value=
work_unit || '';

editUnitPrice.value=
unit_price || '';

editTotal.value=
total || '';

editByPerson.value=
by_person || '';



}

// ---------- UPDATE ----------

let isUpdating = false;

document
.getElementById('updateBtn')
.addEventListener(

'click',

async()=>{

if(isUpdating){
    return;
}

const updateBtn =
document.getElementById(
'updateBtn'
);

try{

    isUpdating = true;

    updateBtn.disabled = true;

    updateBtn.textContent =
    'Updating...';

    const filterDate =
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

    .forEach(input=>{

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

    });

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

    // VALIDATION

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
    editQty.value === '' ||
    editQty.value === null
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

    const id = editId.value;

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
        editWorkUnit.value,

        unit_price:
        editUnitPrice.value,

        total:
        editTotal.value,

        by_person:
        editByPerson.value

    };

    const res = await fetch(

    API + '/records/' + id,

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
catch(err){

    console.error(err);

    alert(
    'Update Error'
    );

}
finally{

    isUpdating = false;

    updateBtn.disabled = false;

    updateBtn.textContent =
    'UPDATE';

}

});





// ---------- CLOSE EDIT ----------

function closeModal(){

document
.getElementById(
'editDialog'
)
.classList
.add(
'hidden'
);

document.body.style.overflow='';



/* CLEAR EDIT FORM */

editId.value='';

editDate.value='';

editWork.value='';

editBlock.value='';

editQty.value='';

editWorkUnit.value='';

editUnitPrice.value='';

editTotal.value='';

editByPerson.value='';



/* REMOVE WARNING STYLE */

document

.querySelectorAll(

'#editModal .inputError'

)

.forEach(

el=>{

el.classList
.remove(
'inputError'
);

});

}



document
.getElementById(
'closeEditBtn'
)

.addEventListener(

'click',

closeModal

);


document
.getElementById(
'closeEditTopBtn'
)

.addEventListener(

'click',

closeModal

);
closeEditBtn

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

// ---------- INPUT Auto Calc ----------

function inputCalc(row){

const workInput=
row.querySelector('.workSelect');

const qtyInput=
row.querySelector('.qty');

const unitInput=
row.querySelector('.work_unit');

const unitPriceInput=
row.querySelector('.unit_price');

const totalInput=
row.querySelector('.total');


// selected work

const selected=

workOptions.find(

w=>

w.work_name
.toLowerCase()

===

(workInput.value||'')
.toLowerCase()

);


// auto unit + price

if(selected){

unitInput.value=
selected.work_unit || '';

unitPriceInput.value=
selected.work_price || '';

}else{

unitInput.value='';

unitPriceInput.value='';

}


// total calc

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

}

// ---------- EDIT CALC ----------

function editCalc(){

// SELECTED WORK

const selected=

workOptions.find(

w=>

w.work_name
.toLowerCase()

===

(editWork.value||'')
.toLowerCase()

);



// AUTO UNIT + PRICE

if(selected){

editWorkUnit.value=

selected.work_unit
|| '';

editUnitPrice.value=

selected.work_price
|| '';

}

else{

editWorkUnit.value='';

editUnitPrice.value='';

}



// TOTAL

const qty=

Number(
editQty.value || 0
);

const price=

Number(
editUnitPrice.value || 0
);

editTotal.value=

qty && price

?

(qty*price)
.toFixed(2)

:

'';

}



/* ---------- EDIT EVENT LISTENER ----------

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

});*/


// ---------- EDIT INPUT LISTENER ----------

[

editWork,
editQty

]

.forEach(

el=>{

el.addEventListener(

'input',

editCalc

);

});

editWork
.addEventListener(

'mousedown',

(e)=>{

e.preventDefault();

editWork.focus();

editWork.showPicker?.();

});

editByPerson.addEventListener(

'mousedown',

(e)=>{

e.preventDefault();

editByPerson.focus();

editByPerson.showPicker?.();

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


// ---------- PAGINATION ----------

let currentPage=1;

const rowsPerPage=5;

let allRecords=[];

// ---------- INITIAL LOAD ----------

(async()=>{
	
const filterDate =

document
.getElementById(
'monthFilter'
)
.value;

await Promise.all([

loadWorkers(),

loadWorkOptions()

]);

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