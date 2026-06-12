// Malaysia Timezone

const MY_TIMEZONE =
"Asia/Kuala_Lumpur";

function formatMYDate(date){

    if(!date){
        return "";
    }

    return new Date(date)
    .toLocaleDateString(
        "en-GB",
        {
            timeZone:
            MY_TIMEZONE
        }
    );

}

function formatMYDateTime(date){

    if(!date){
        return "";
    }

    return new Date(date)
    .toLocaleString(
        "en-GB",
        {
            timeZone:
            MY_TIMEZONE,
            day:"2-digit",
            month:"2-digit",
            year:"numeric",
            hour:"2-digit",
            minute:"2-digit",
            second:"2-digit",
            hour12:false
        }
    );

}

function formatMYDateInput(date){

    if(!date){
        return "";
    }

    const d =
    new Date(date);

    const malaysia =
    new Date(

        d.toLocaleString(
            "en-US",
            {
                timeZone:
                MY_TIMEZONE
            }
        )

    );

    const yyyy =
    malaysia.getFullYear();

    const mm =
    String(
        malaysia.getMonth() + 1
    ).padStart(2,"0");

    const dd =
    String(
        malaysia.getDate()
    ).padStart(2,"0");

    return `${yyyy}-${mm}-${dd}`;

}

function getMYNow(){

    return new Date(
        new Date().toLocaleString(
            "en-US",
            {
                timeZone:
                MY_TIMEZONE
            }
        )
    );

}