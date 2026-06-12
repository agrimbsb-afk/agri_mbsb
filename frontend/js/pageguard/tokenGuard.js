function getToken(){

    return localStorage.getItem(
        "token"
    ) || "";

}

function getAuthHeaders(){

    return {

        Authorization:
        "Bearer " +
        getToken()

    };

}