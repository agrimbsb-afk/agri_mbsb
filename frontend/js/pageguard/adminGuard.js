(async()=>{

    const token =
    localStorage.getItem(
        "token"
    );

    if(!token){

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

        const data =
        await res.json();

        if(
            data.user.userRole !==
            "admin"
        ){

            localStorage.clear();

            window.location.replace(
                "/"
            );

        }

    }
    catch(err){

        localStorage.clear();

        window.location.replace(
            "/"
        );

    }

})();