function toLogin(){
    window.location.href = "/login";
}

function toMyPage(){
    window.location.href="/mypage/main"
}

function toMain(){
    window.location.href="/";
}

function toGrouping(){
    window.location.href="/grouping/list";
}

function toLearning(){
    window.location.href="/learning/list";
}

function toLogout(){
    window.location.href="/logout";
}

function toBack(){
    const currentPath = window.location.pathname;
    if(currentPath.startsWith('/grouping/detail')){
        window.location.href = '/grouping/list';
    }else if(currentPath.startsWith("/learning/detail")){
        window.location.href="/learning/list"
    }else{
        window.history.back()
    }
}