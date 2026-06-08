function setActiveMenu(page){

    document
    .querySelectorAll('.sidebar-menu a')
    .forEach(link=>{

        link.classList.remove('active');

        if(
            link.dataset.page === page
        ){

            link.classList.add('active');

        }

    });

}

window.addEventListener(
    'hashchange',
    loadCurrentPage
);

function loadCurrentPage(){

    const page =

    location.hash
    .replace('#','')

    ||

    'product';

    loadPage(page);

    setActiveMenu(page);

}

document
.querySelectorAll('.sidebar-menu a')
.forEach(link=>{

    link.addEventListener(
    'click',

    e=>{

        e.preventDefault();

        const page =

        link.dataset.page;

        location.hash = page;

    });

});

const logoutBtn =
document.getElementById(
'logoutBtn'
);

if(logoutBtn){

    logoutBtn.addEventListener(
    'click',

    e=>{

        e.preventDefault();

        localStorage.clear();

        location.href =
        'login.html';

    });

}

loadCurrentPage();