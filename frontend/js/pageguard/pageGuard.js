// js/pageGuard.js

(async()=>{

    const token =
    localStorage.getItem(
        "token"
    );

    if(!token){

        localStorage.clear();

        window.location.replace(
            "/"
        );

        return;

    }

    try{

        const res =
        await fetch(

            API +
            "/api/auth/validate",

            {

                headers:{

                    Authorization:
                    "Bearer " +
                    token

                }

            }

        );

        if(!res.ok){

            throw new Error();

        }

    }
    catch(err){

        localStorage.clear();

        window.location.replace(
            "/"
        );

    }

})();