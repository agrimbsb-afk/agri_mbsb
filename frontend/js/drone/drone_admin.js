document.getElementById(
    "searchMonth"
).value =

new Date()
.toISOString()
.slice(0,7);

async function loadSalarySummary(){

    try{

        const month =

        document.getElementById(
            "searchMonth"
        ).value;

        const tbody =

        document.getElementById(
            "salarySummaryBody"
        );

        tbody.innerHTML =

        `
        <tr>

            <td
            colspan="5"
            class="table-loading">

                <i class="fa-solid fa-spinner fa-spin"></i>

                Loading...

            </td>

        </tr>
        `;

        const res =
        await fetch(

            API +

            "/api/drone-salary/summary" +

            "?month=" +

            month,

            {

                headers:
                getAuthHeaders()

            }

        );

        const data =
        await res.json();

        renderSalarySummary(
            data.data || []
        );

    }
    catch(err){

        console.error(err);

        alert(
            "Load Failed"
        );

    }

}

function renderSalarySummary(rows){

    const tbody =

    document.getElementById(
        "salarySummaryBody"
    );

    if(rows.length===0){

        tbody.innerHTML =

        `
        <tr>

            <td
            colspan="5"
            class="table-loading">

                No Record Found

            </td>

        </tr>
        `;

        return;

    }

    tbody.innerHTML='';

    rows.forEach(row=>{

        tbody.insertAdjacentHTML(

            "beforeend",

            `

            <tr>

				<td>

					<a

					class="pilot-link"

					href="#"

					onclick="

					openPilotDetail(
						'${row.by_person}',
						'${row.user_Name}'
					);

					return false;

					">

					${row.by_person}

					</a>

				</td>

                <td>

                    ${row.user_Name}

                </td>

                <td>

                    ${row.total_job}

                </td>

                <td>

                    ${Number(
                        row.total_acre
                    ).toFixed(2)}

                </td>

                <td>

                    RM

                    ${Number(
                        row.total_amount
                    ).toFixed(2)}

                </td>

            </tr>

            `

        );

    });

}

async function openPilotDetail(
    userId,
    userName
){

    document
    .getElementById(
        "pilotDialogTitle"
    )
    .innerHTML =

    `
    <div>${userId} - ${userName}

    </div>
    `;

    document
    .getElementById(
        "pilotDetailDialog"
    )
    .classList.remove(
        "hidden"
    );

    await loadPilotWorkRecords(
        userId
    );
	
	await loadPilotMonthlySummary(
        userId
    );

}

async function loadPilotWorkRecords(
    userId
){

    const month =

    document.getElementById(
        "searchMonth"
    ).value;

    const tbody =

    document.getElementById(
        "pilotWorkBody"
    );

    tbody.innerHTML =

    `
    <tr>

        <td
        colspan="4"
        class="table-loading">

            Loading...

        </td>

    </tr>
    `;

    try{

        const res =
        await fetch(

            API +

            "/api/drone-salary/records" +

            "?userId=" +

            userId +

            "&month=" +

            month,

            {

                headers:
                getAuthHeaders()

            }

        );

        const data =
        await res.json();

        renderPilotWorkRecords(
            data.data || []
        );

    }
    catch(err){

        console.error(err);

    }

}

function renderPilotWorkRecords(
    rows
){

    const tbody =

    document.getElementById(
        "pilotWorkBody"
    );

    if(rows.length===0){

        tbody.innerHTML =

        `
        <tr>

            <td
            colspan="4"
            class="table-loading">

                No Record Found

            </td>

        </tr>
        `;

        return;

    }

    tbody.innerHTML = '';

    rows.forEach(row=>{

        tbody.insertAdjacentHTML(

            "beforeend",

            `

            <tr>

                <td>
                    ${row.date}
                </td>

                <td>
                    ${row.work}
                </td>
				
				<td>
                    ${Number(
                        row.area_ha
                    ) || ""}
                </td>
				
				<td>
					${Number(
                        row.work_pcs
                    ) || ""}
                </td>

                <td>
                    ${Number(
                        row.acre
                    ).toFixed(2) || ""}
                </td>
				
				<td>

                    RM

                    ${Number(
                        row.work_price
                    ).toFixed(2) || ""}

                </td>

	
                <td>

                    RM

                    ${Number(
                        row.amount
                    ).toFixed(2)}

                </td>

            </tr>

            `

        );

    });

}

async function loadPilotMonthlySummary(
    userId
){

    const month =

    document.getElementById(
        "searchMonth"
    ).value;

    const res =
    await fetch(

        API +

        "/api/drone-salary/monthly-summary" +

        "?userId=" +

        userId +

        "&month=" +

        month,

        {

            headers:
            getAuthHeaders()

        }

    );

    const data =
    await res.json();

    renderPilotMonthlySummary(
        data.data || []
    );

}

function renderPilotMonthlySummary(
    rows
){

    const tbody =

    document.getElementById(
        "pilotSummaryBody"
    );

    tbody.innerHTML = "";

    let totalSalary = 0;

    rows.forEach(row=>{

        totalSalary +=
        Number(
            row.total_amount
        );

        tbody.insertAdjacentHTML(

            "beforeend",

            `

            <tr>

                <td>

                    ${row.work}

                </td>

                <td>

                    ${Number(
                        row.beg
                    ) || ""}

                </td>

                <td>

                    ${Number(
                        row.total_ha
                    ) || ""}

                </td>

                <td>

                    ${Number(
                        row.work_price
                    ).toFixed(2) || ""}

                </td>

                <td>

                    ${Number(
                        row.total_amount
                    ).toFixed(2) || ""}

                </td>

            </tr>

            `

        );

    });

    document
    .getElementById(
        "pilotTotalSalary"
    )
    .innerText =

    "RM " +

    totalSalary.toFixed(2);

}

document.addEventListener(

    "click",

    e=>{

        if(
            !e.target.classList.contains(
                "salary-tab-btn"
            )
        ){
            return;
        }

        document
        .querySelectorAll(
            ".salary-tab-btn"
        )
        .forEach(btn=>{

            btn.classList.remove(
                "active"
            );

        });

        document
        .querySelectorAll(
            ".salary-tab-content"
        )
        .forEach(tab=>{

            tab.classList.add(
                "hidden"
            );

        });

        e.target.classList.add(
            "active"
        );

        document
        .getElementById(
            e.target.dataset.tab
        )
        .classList.remove(
            "hidden"
        );

    }

);


document
.getElementById(
    "closePilotDialog"
)
.addEventListener(

    "click",

    ()=>{

        document
        .getElementById(
            "pilotDetailDialog"
        )
        .classList.add(
            "hidden"
        );

    }

);


// ---------- EXPORT EXCEL ----------

document
.getElementById(
    "exportBtn"
)
.addEventListener(

    "click",

    async()=>{

        try{

            const month =

            document
            .getElementById(
                "searchMonth"
            )
            .value;

            const res =
            await fetch(

                API +
                `/api/drone-salary/export?month=${month}`,

                {

                    headers:
                    getAuthHeaders()

                }

            );

            if(!res.ok){

                throw new Error(
                    "Export Failed"
                );

            }

			const blob =
			await res.blob();

			const file =
			new File(

				[blob],

				`PILOT_SALARY_${month}.xlsx`,

				{
					type:
					blob.type
				}

			);

			const url =
			URL.createObjectURL(
				file
			);

			window.location =
			url;

        }
        catch(err){

            console.error(err);

            alert(
                "Export Failed"
            );

        }

    }

);

async function initDroneSalaryPage(){

    document.getElementById(
        "searchMonth"
    ).value =

    new Date()
    .toISOString()
    .slice(0,7);

    document
    .getElementById(
        "searchBtn"
    )
    .addEventListener(

        "click",

        loadSalarySummary

    );

    await loadSalarySummary();

}

initDroneSalaryPage();