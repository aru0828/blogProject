

import {checkUser} from './checkUser.js';

let model = {
    register:function(){
        let email = document.getElementById('regEmail').value;
        let password = document.getElementById('regPassword').value;
        let name = document.getElementById('regName').value;
        
        let emailRule = /^\S+@\S+\.\S+$/;
        let passwordLength = password.split("").length;
        let nameLength = name.split("").length;

        if(emailRule.test(email) && passwordLength >= 6 && nameLength >= 3){
            
            let requestData = {
                'email':email,
                'password':password,
                'name':name,
                'source':'local'
            }
    
            fetch('/api/user', {
                'method':"POST",
                'body':JSON.stringify(requestData),
                'headers':{
                    'content-type':'application/json'
                }
            })
            .then(response => response.json())
            .then(result => {
                if(result.ok){
                    alert(result.message);
                    window.location.reload();
                }
                else{
                    alert(result.message);
                }
            })
        }
        else{
            alert('信箱不符合格式或密碼長度小於6使用者名稱長度小於3');
        }
        
    },

    login:function(){
        
        let email = document.getElementById('loginEmail').value;
        let password = document.getElementById('loginPassword').value;
        let emailRule = /^\S+@\S+\.\S+$/;
        let passwordLength = password.split("").length;
        
        // 基本email驗證以及密碼長度>=6
        if(emailRule.test(email) && passwordLength >= 6){
            let requestData = {
                'email':email,
                'password':password,
                'source':'local'
            }
            fetch('/api/user', {
                method:'PATCH',
                body: JSON.stringify(requestData),
                headers:{
                    'content-type':'application/json'
                }
            })
            .then(response => response.json())
            .then(result => {
                console.log(result)
                if(result.ok){
                    window.location.href="/";
                }
            })
        }
        else{
            alert('信箱格式不符或密碼長度小於6');
        }

        
    }
}

let view = {
    toRegisterBtn:document.querySelector('.toRegister'),
    toLoginBtn : document.querySelector('.toLogin'),
    loginBtn : document.querySelector('.loginBtn'),
    registerBtn : document.querySelector('.registerBtn'),

    renderForm : function(mode){
        let form = document.querySelector(`#${mode}`);
        form.classList.add('active');
        // console.log(loginForm)
    },
    closeForm : function(formDOM){
        formDOM.classList.remove('active');
    }
}

let controller = {
    // 登入:login 註冊register
    toggleFormMode : function(mode='login'){
        let closeDom = document.querySelector(`#${mode === "login" ? "register" : "login"}`);
        
        view.closeForm(closeDom);
        view.renderForm(mode);
    },

    login:function(){
        // let loginForm = document.getElementById('login');
        // console.log(loginForm)
        model.login();
    },

    register:function(){
        model.register();
    }
}

view.toRegisterBtn.addEventListener('click', function(e){
    e.preventDefault();
    controller.toggleFormMode('register');
})

view.toLoginBtn.addEventListener('click', function(e){
    e.preventDefault();
    controller.toggleFormMode('login');
})

view.loginBtn.addEventListener('click', function(e){
    e.preventDefault();
    
    controller.login();
})

view.registerBtn.addEventListener('click', function(e){
    e.preventDefault();
    controller.register();
})





// checkUser()
// .then(result => {
//     console.log(result)
// });

// setTimeout(function(){
//     console.log(model.isLogined)
// },3000)
