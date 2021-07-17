import {checkUser} from './checkUser.js';


let logoutBtn = document.querySelector('.logoutBtn');
let memberLink = document.querySelector('.memberLink');
let memberImg = document.querySelector('.memberImg');
let collapase = document.querySelector('.collapase');
let toMember = document.querySelector('.toMember');
// 登出且重新導向網址
logoutBtn.addEventListener('click', function(e){
    e.preventDefault();
    model.logout();
})


memberLink.addEventListener('click', function(e){
    e.preventDefault();
    console.log('toggle')
    collapase.classList.toggle('active');
})


let model = {
    isLogined:false,
    userData : {},
    checkUser:function(){
        return  checkUser().then(result => {
                    if(result.data){
                        model.isLogined = true;
                        model.userData = result.data;
                    }
                    console.log('登入狀態: ',result);
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
                toMember.href=`/member/${model.userData.user_id}`;
                memberImg.setAttribute('src', !model.userData.avatar ? '../../public/images/default-user-icon.jpg' : model.userData.avatar);
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