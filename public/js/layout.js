import {checkUser} from './checkUser.js';


let logoutBtn = document.querySelector('.logoutBtn');


// 登出且重新導向網址
logoutBtn.addEventListener('click', function(e){
    e.preventDefault();
    model.logout();
})




let model = {
    isLogined:false,

    checkUser:function(){
        return  checkUser().then(result => {
                    if(result.data){
                        this.isLogined = true
                    }
                    console.log(result);
                });
    },


    logout:function(){
        fetch('/api/user',{'method':'DELETE'})
        .then(response => response.json())
        .then(result   => {
            if(result.ok){
                window.location.href ='/';
            }
        })
    }
}

let view = {
    

    renderNavbar:function(){
        if(model.isLogined){
            document.querySelectorAll('.member-only').forEach(item => {
                item.classList.add('active');
            })
        }else{
            document.querySelectorAll('.visitor-only').forEach(item => {
                item.classList.add('active');
            })
        }
    }
}

let controller = {
    init:async function(){
        await model.checkUser();
        view.renderNavbar();
    }
}


controller.init();