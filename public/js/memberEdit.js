import {checkUser} from './checkUser.js';
import {sweetAlert} from './sweetAlert.js';
import {loading} from './loading.js';




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
        loading.toggleLoading();
        await model.getUserData();
        view.renderUserCard();
        
        loading.toggleLoading();
    },

    submitUserEdit:async function(){
        let editUserResult = await model.submitUserEdit();
        if(editUserResult.ok){
            sweetAlert.alert('success', editUserResult.message).then(result => {
                if(result.isConfirmed){
                    window.location.href = `/member/${model.userData.user_id}`;
                }
            })
        }
        controller.init();
    },


}

controller.init()