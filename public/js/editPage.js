


import { checkUser } from './checkUser.js';
import { loading } from './loading.js';
import { sweetAlert } from './sweetAlert.js';

let editPostForm = document.querySelector('#editForm');
let pathParams = window.location.pathname.split("/");
let articleId = pathParams[pathParams.length - 1];




editPostForm.addEventListener('submit', function (e) {
    e.preventDefault();
    loading.toggleLoading(true);

    let title = document.querySelector('#title').value;
    let content = tinymce.get('editor').getContent();
    let price = document.querySelector('#price').value;
    let summary = document.querySelector('#summary').value;
    let requestData = {
        'article_id': articleId,
        'title': title,
        'summary': summary,
        'content': content,
        'price': price
    }

    fetch('/api/article', {
        'method': 'PATCH',
        'body': JSON.stringify(requestData),
        'headers': {
            'content-type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(result => {
            loading.toggleLoading();
            if (result.ok) {
                sweetAlert.alert('success', result.message).then(result => {
                    if (result.isConfirmed) {
                        window.location.href = `/article/${articleId}`;
                    }
                })
            }
            else {
                sweetAlert.alert('error', result.message).then(result => {
                    if (result.isConfirmed) {
                        window.location.href = `/article/${articleId}`;
                    }
                })
            }
        })

})


let model = {
    userData: {},
    oldData: {},

    getUserData: function () {
        return checkUser().then(result => {
            if (result.message === '登入中') {
                model.userData = result.data;
            }
            else {
                window.location.href = '/';
            }
        })
    },
    getOldData: function () {
        return fetch(`/api/article/${articleId}`)
            .then(response => response.json())
            .then(result => {
                if (result.ok) {

                    if (result.data.article.author.user_id !== model.userData.user_id) {
                        window.location.href = '/';
                    }
                    model.oldData = result.data.article;

                }
                else {
                    window.location.href = '/';
                }
            })
    },


}

let view = {
    renderOldData: function () {
        tinymce.get("editor").setContent(model.oldData.content);
        let title = document.querySelector('#title');
        let summary = document.querySelector('#summary');
        let price = document.querySelector('#price');

        title.value = model.oldData.title;
        summary.value = model.oldData.summary ? model.oldData.summary : '';
        price.value = model.oldData.price ? model.oldData.price : 0;


    }

}

let controller = {
    init: async function () {
        loading.toggleLoading();

        await tinymce.init({
            selector: 'textarea',
            plugins: 'image link media emoticons',
            width: 1000,
            height: 600,
            language: 'zh_TW',
            // 預設toolbar
            // toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | outdent indent'
            toolbar: ' fontsizeselect forecolor backcolor |  bold italic underline emoticons |  aligncenter | indent  | link image media ',
            menubar: false,


            // image plugins設定
            // 取消自定義寬高
            image_dimensions: false,
            // 限制上傳檔案type
            images_file_types: 'jpg,png,jpeg.gif',
            automatic_uploads: false,
            images_upload_url: 'postAcceptor.php',
            default_link_target: '_blank',
            link_context_toolbar: true,
            link_title: false,
            media_dimensions: false,
            media_poster: false,

            // 修改編輯器內部樣式
            content_style: "body {  }",
        });


        await model.getUserData();
        await model.getOldData();
        view.renderOldData();

        loading.toggleLoading();
    }
}

controller.init();





