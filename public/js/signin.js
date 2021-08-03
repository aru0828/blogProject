

import { checkUser } from './checkUser.js';
import { sweetAlert } from './sweetAlert.js';

let model = {
    register: function () {
        let email = document.getElementById('regEmail').value;
        let password = document.getElementById('regPassword').value;
        let name = document.getElementById('regName').value;

        let emailRule = /^\S+@\S+\.\S+$/;

        // 基本驗證
        if (!emailRule.test(email)) {
            sweetAlert.alert('error', '信箱格式不正確');
            return;
        }
        else if (password.length < 6) {
            sweetAlert.alert('error', '密碼長度不得小於6個字元');
            return;
        }
        else if (name.length < 1) {
            sweetAlert.alert('error', '請輸入使用者名稱');
        }
        else {
            let requestData = {
                'email': email,
                'password': password,
                'name': name,
                'source': 'local'
            }

            fetch('/api/user', {
                'method': "POST",
                'body': JSON.stringify(requestData),
                'headers': {
                    'content-type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(result => {
                    if (result.ok) {
                        sweetAlert.alert('success', result.message).then(result => {
                            if (result.isConfirmed) {
                                window.location.reload();
                            }
                        });
                    }
                    else {
                        sweetAlert.alert('error', result.message);
                    }
                })
        }


    },

    login: function () {

        let email = document.getElementById('loginEmail').value;
        let password = document.getElementById('loginPassword').value;
        let emailRule = /^\S+@\S+\.\S+$/;
        let passwordLength = password.split("").length;

        // 基本email驗證以及密碼長度>=6
        if(!emailRule.test(email)){
            sweetAlert.alert('error', '信箱格式不正確');
            return;
        }
        else if(passwordLength < 6){
            sweetAlert.alert('error', '密碼長度不得小於6個字元');
            return;
        }
        else{
            let requestData = {
                'email': email,
                'password': password,
                'source': 'local'
            }
            fetch('/api/user', {
                method: 'PATCH',
                body: JSON.stringify(requestData),
                headers: {
                    'content-type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(result => {
                    if (result.ok) {
                        // window.location.href="/";
                        window.location.href = "/";
                    }
                    else {
                        sweetAlert.alert('error', result.message);
                    }
                })
        }
    }
}

let view = {
    toRegisterBtn: document.querySelector('.toRegister'),
    toLoginBtn: document.querySelector('.toLogin'),
    loginBtn: document.querySelector('.loginBtn'),
    registerBtn: document.querySelector('.registerBtn'),

    renderForm: function (mode) {
        let form = document.querySelector(`#${mode}`);
        form.classList.add('active');
    },
    closeForm: function (formDOM) {
        formDOM.classList.remove('active');
    }
}

let controller = {
    // 登入:login 註冊register
    toggleFormMode: function (mode = 'login') {
        let closeDom = document.querySelector(`#${mode === "login" ? "register" : "login"}`);

        view.closeForm(closeDom);
        view.renderForm(mode);
    },

    login: function () {
        model.login();
    },

    register: function () {
        model.register();
    }
}

view.toRegisterBtn.addEventListener('click', function (e) {
    e.preventDefault();
    controller.toggleFormMode('register');
})

view.toLoginBtn.addEventListener('click', function (e) {
    e.preventDefault();
    controller.toggleFormMode('login');
})

view.loginBtn.addEventListener('click', function (e) {
    e.preventDefault();

    controller.login();
})

view.registerBtn.addEventListener('click', function (e) {
    e.preventDefault();
    controller.register();
})
