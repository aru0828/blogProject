import {checkUser} from './checkUser.js';




let submit = document.querySelector('.member-card');
submit.addEventListener('submit', function(e){
    e.preventDefault();
    controller.submitUserEdit()
})


let model= {
    userData:{},
    getUserData:async function(){
        let result = await checkUser();
        console.log(result);
        if(result.message==='登入中'){
            model.userData = result.data;
        }
        else{
            window.location.href="/signin";
        }
    },

    submitUserEdit:async function(){
        let username = document.querySelector('#username').value;
        let story = document.querySelector('#story').value;
        let newAvatar = document.querySelector('.newAvatar').files[0];

        let formData = new FormData();
        formData.append('username', username);
        formData.append('story', story);
        formData.append('newAvatar', newAvatar);

        return fetch('/api/member', {
            'method':'POST',
            'body':formData
        })
        .then(response => response.json())
        .then(result => {
            if(result.ok){
                alert('成功編輯個人資料');
                window.location.href=`/member/${model.userData.user_id}`;
            }
            console.log(result);
        })
    }
}

let view ={
    renderUserCard:function(){
        let newAvatar = document.querySelector('.newAvatar');
        newAvatar.value = '';

        let avatar = document.querySelector('.avatar img');
        avatar.setAttribute('src', model.userData.avatar ? model.userData.avatar : '../public/images/default-user-icon.jpg')

        let email = document.querySelector('#email');
        email.value = model.userData.email;

        let username = document.querySelector('#username');
        username.value = model.userData.username;

        let description = document.querySelector('#story');
        description.value = model.userData.description;
    }
}

let controller = {
    init:async function(){
        await model.getUserData();
        view.renderUserCard();
    },

    submitUserEdit:async function(){
        await model.submitUserEdit();
        controller.init();
    },


}

controller.init()