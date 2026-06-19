// js/fetchGuard.js

const originalFetch =
window.fetch;

window.fetch =
async(...args)=>{

    const res =
    await originalFetch(
        ...args
    );

    if(res.status === 401){

        localStorage.clear();

        alert(
            "Session Expired"
        );

        window.location.replace(
            "/"
        );
    }

    return res;

};