
import {checkUser} from './checkUser.js';



let postForm = document.querySelector('#postForm');
let coverPhoto = document.querySelector('#coverPhoto');

//預覽功能
coverPhoto.addEventListener('change', function(e){
  console.log(e);
})


postForm.addEventListener('submit', function(e){


  e.preventDefault();
    
    
    
    let tagChecked = document.querySelectorAll('.tagGroup input:checked')
    let tagArray = [];
    tagChecked.forEach(item => {
      tagArray.push(parseInt(item.value));
    })

    console.log(tagArray);

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
      console.log(result)
      if(result.ok){
        window.location.href=`/article/${result.article_id}`;
      }
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
    console.log('render')
    let tagGroup = document.querySelector('.tagGroup');
    console.log(model.tagss)
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

      tagGroup.appendChild(tag);
      
    })
    // s<input type="checkbox" value="模型車">模型車
  }
}

let controller = {
  init:async function(){
    await model.getUserData();
    await model.getTagData();
    view.renderTags();
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


  //   images_upload_handler: function (blobInfo, success, failure) {
  //     console.log('觸發upload')
  //     /* no matter what you upload, we will turn it into TinyMCE logo :)*/
  //     success('http://moxiecode.cachefly.net/tinymce/v9/images/logo.png');
    
  // },

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
  });