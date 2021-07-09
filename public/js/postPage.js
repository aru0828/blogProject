


let postForm = document.querySelector('#postForm');
let coverPhoto = document.querySelector('#coverPhoto');

//預覽功能
coverPhoto.addEventListener('change', function(e){
  console.log(e);
})

postForm.addEventListener('submit', function(e){
    e.preventDefault();
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
    fetch('/api/article', {
      method:'POST',
      body:formData,
    })
    .then(response => response.json())
    .then(result => {
      if(result.ok){
        window.location.href=`/article?articleid=${result.article_id}`;
      }
    })
  
})
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