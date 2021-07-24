



import {checkUser} from './checkUser.js'

let editPostForm = document.querySelector('#postForm');
let coverPhoto = document.querySelector('#coverPhoto');
let pathParams = window.location.pathname.split("/");
let articleId = pathParams[pathParams.length-1];


//預覽功能
// coverPhoto.addEventListener('change', function(e){
//   console.log(e);
// })


editPostForm.addEventListener('submit', function(e){
    e.preventDefault();
    console.log('submit edit')
    
    let title   = document.querySelector('#title').value;
    let content = tinymce.get('editor').getContent();
    let price = document.querySelector('#price').value;
    let summary = document.querySelector('#summary').value;
    

    // let formData = new FormData();
    // formData.append('title', title);
    // formData.append('content', content);
    // formData.append('price', price);
    // formData.append('summary', summary);

    let requestData={
        'article_id':articleId,
        'title':title,
        'summary':summary,
        'content':content,
        'price':price
    }

    fetch('/api/article', {
        'method':'PATCH',
        'body':JSON.stringify(requestData),
        'headers':{
           'content-type':'application/json'
        }
        })
        .then(response => response.json())
        .then(result => {
        console.log(result)
        if(result.ok){
            alert(result.message);
            window.location.href=`/article/${articleId}`;
        }
        else{
            alert(result.message);
        }
    })
  
})






console.log(articleId)


let model = {
    userData:{},
    oldData:{},

    getUserData:function(){
        return checkUser().then(result => {
            if(result.message === '登入中'){
                model.userData = result.data;
            }
            else{
                window.location.href='/';
            }
        })
    },
    getOldData : function(){
        return fetch(`/api/article/${articleId}`)
        .then(response => response.json())
        .then(result => {
            if(result.ok){

                console.log(result.data.article.author.user_id);
                console.log(model.userData.user_id);
                if(result.data.article.author.user_id !== model.userData.user_id){
                    window.location.href='/';
                }
                model.oldData = result.data.article;
             
            }
            else{
                window.location.href='/';
            }
        })
    },


}

let view = {
    renderOldData:function(){

        let title = document.querySelector('#title');
        let summary = document.querySelector('#summary');
        let price = document.querySelector('#price');
        let editor = document.querySelector('#editor');


        title.value = model.oldData.title;
        summary.value = model.oldData.summary ?  model.oldData.summary : '';
        price.value = model.oldData.price ? model.oldData.price :  0;
        editor.value = model.oldData.content;
        console.log(title, summary, price, editor)
    }

}

let controller = {
    init:async function(){
        await model.getUserData();
        await model.getOldData();
        view.renderOldData();
    }
}

controller.init();





tinymce.init({
    selector: 'textarea',  
    plugins: 'image link media emoticons',  
    width:1000,
    height:600,
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
  });