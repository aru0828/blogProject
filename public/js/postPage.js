

import {checkUser} from './checkUser.js';
import {sweetAlert} from './sweetAlert.js';
import {loading} from './loading.js';


let postForm = document.querySelector('#postForm');
let coverPhoto = document.querySelector('#coverPhoto');




postForm.addEventListener('submit', function(e){


  e.preventDefault();
    
   loading.toggleLoading(true);
    
    
    let tagChecked = document.querySelectorAll('.tagGroup input:checked')
    let tagArray = [];
    tagChecked.forEach(item => {
      tagArray.push(parseInt(item.value));
    })


    let title   = document.querySelector('#title').value;
    let coverPhoto = document.querySelector('#coverPhoto').files[0];
    let content = tinymce.get('editor').getContent();
    let price = document.querySelector('#price').value;
    let summary = document.querySelector('#summary').value;
    

    let formData = new FormData();
    formData.append('title', title);
    formData.append('coverPhoto', coverPhoto);
    formData.append('content', content);
    formData.append('price', price);
    formData.append('summary', summary);
    formData.append('tagArray', tagArray);
    fetch('/api/article', {
      method:'POST',
      body:formData,
    })
    .then(response => response.json())
    .then(result => {
      if(result.ok){
        sweetAlert.alert('success', '發布成功').then(SWresult => {
          if(SWresult.isConfirmed){
            window.location.href=`/article/${result.article_id}`;
          }
        })
        
      }
      loading.toggleLoading();
    })
  
})


let model = {
  userData:{},
  tags:[],
  getUserData:function(){
    return checkUser().then(result => {
      if(result.message==='登入中'){
        model.userData = result.data;
      }else{
        window.location.href='/';
      }
      // 未登入導覽至首頁or login
    })
  },

  getTagData:async function(){
    return fetch('/api/tag')
    .then(response => response.json())
    .then(result  => {
      if(result.ok){
        model.tags = result.data;
      }
    })
  },
}

let view = {
  renderTags:function(){
    let tagGroup = document.querySelector('.tagGroup');
    let tags = document.createElement('div');
    tags.classList.add('tags');
    model.tags.forEach(item=>{
      let tag = document.createElement('div');
      tag.classList.add('tag');
      let checkBox = document.createElement('input');
      let label  =document.createElement('label');
      checkBox.setAttribute('type', 'checkBox');
      checkBox.setAttribute('value', item.tag_id);
      label.textContent = item.tag;

      tag.appendChild(checkBox);
      tag.appendChild(label);

      tags.appendChild(tag);
      
    })
    tagGroup.appendChild(tags);
   
  }
}

let controller = {
  init:async function(){
    loading.toggleLoading();
    await tinymce.init({
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
    
    
      // link plugins設定
      // 預設點擊連結會另開視窗
      default_link_target: '_blank',
      // 在編輯狀態中"能"使用連結
      link_context_toolbar: true,
      // 取消設定link時的title欄位
      link_title: false,
    
      // media plugins設定
      // 取消設定media時的source欄位
      // media_alt_source: true
      // 取消自定義寬高
      media_dimensions: false,
      media_poster: false,
      content_style: "body { line-height:16px; }",
    });
    
    await model.getUserData();
    await model.getTagData();
    view.renderTags();
    loading.toggleLoading();
  }
}


controller.init();
