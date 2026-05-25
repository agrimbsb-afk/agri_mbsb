const API =
'http://localhost:3000';

async function loadRecords(){

const res =
await fetch(
API+'/records'
);

const data =
await res.json();

const tbody =
document.getElementById(
'tableBody'
);

tbody.innerHTML='';

data.forEach(r=>{

tbody.innerHTML += `

<tr>

<td>${r.date || ''}</td>
<td>${r.work || ''}</td>
<td>${r.block || ''}</td>
<td>${r.ha || ''}</td>
<td>${r.bag || ''}</td>
<td>${r.total || ''}</td>
<td>${r.by_person || ''}</td>

</tr>

`;

});

}

document
.getElementById(
'recordForm'
)

.addEventListener(
'submit',
async(e)=>{

e.preventDefault();

await fetch(
API+'/records',

{

method:'POST',

headers:{

'Content-Type':
'application/json'

},

body:JSON.stringify({

date:date.value,
work:work.value,
block:block.value,
ha:ha.value,
bag:bag.value,
acre:acre.value,
unit_price:unit_price.value,
total:total.value,
by_person:by_person.value

})

}

);

loadRecords();

});

loadRecords();