// const { text } = require("express");
import {checkUser} from './checkUser.js';




let cancelCurrentCommentId = document.querySelector('.cancel-currentCommentId');
let prevCurrentCommentId = document.querySelector('.prev-currentCommentId');
prevCurrentCommentId.addEventListener('click', function(){
    controller.prevSubComment();
})
cancelCurrentCommentId.addEventListener('click', function(){
    controller.cancelSubCommentMode();
})

let threeDots = document.querySelector('.bi-three-dots');
let authorFeatureCollapase = document.querySelector('.author-feature-collapase');

threeDots.addEventListener('click', function(e){
    e.preventDefault();
    console.log('toggle')
    authorFeatureCollapase.classList.toggle('active');
})




let content = document.querySelector('.article-content');
let title = document.querySelector('.article-title');
let likeIcon = document.querySelector('.likeIcon'); 
let authorName = document.querySelector('.author-info .name');
let authorAvatar = document.querySelector('.author-info .avatar');
let publishTime = document.querySelector('.author-info .date');

// path params articleid
let pathParams = window.location.pathname.split("/");
let articleId = pathParams[pathParams.length-1];
// let queryString = new URLSearchParams(window.location.search)
// let articleId = queryString.get("articleid")

//作者進行編輯or刪除
let authorDel = document.querySelector('.author-feature-del');
let authorEdit = document.querySelector('.author-feature-edit');


authorDel.addEventListener('click', function(){
    let confirmResult = confirm('確定要刪除文章嗎?');
    if(confirmResult){
        controller.delArticle();
    }
})

authorEdit.addEventListener('click', function(e){
    e.preventDefault();
    console.log('edit click')
    
    window.location.href = `/post/edit/${articleId}`;
})


let sendCommentBtn = document.querySelector('.sendComment')

sendCommentBtn.addEventListener('click', async function(e){
    e.preventDefault();
    let commentContent = document.querySelector('#comment').value;
    
    controller.submitComment(articleId, commentContent);
})






likeIcon.addEventListener('click', function(e){
   controller.likeEvent();
})

var textarea = document.querySelector(".comment-textarea");

let limit = 80;
// textarea.oninput = function() {
//     textarea.style.height = "";
//     textarea.style.height = Math.min(textarea.scrollHeight, limit) + "px";
// };


let model = {
    userData:{},
    article:{},
    comments:[],
    // commentlikes:[],
    //新增完記得設為null
    commentLevels:[],

    checkUser:async function(){
        let result = await checkUser();
        if(result.message ==='登入中'){
            model.userData = result.data;
        }
    },

    getArticleData:function(){
        return fetch(`/api/article/${articleId}`)
        .then(response =>response.json())
        .then(result => {
            console.log(result)
            if(result.error){
                window.location.href= "/articles"
            }
            model.article = result.data.article;
    
            // if(result.ok){
            //     let article = result.data.article;
            //     title.innerHTML   = article.title;
            //     content.innerHTML = article.content;
            //     authorName.textContent = article.author.username;
            //     // authorAvatar.setAttribute('src', article.avatar);
            //     publishTime.textContent = `${dateArray[0]} ${parseInt(dateArray[1])+8}:${dateArray[2]}`;
            // }

            
        })
    },
    getLevelOneComments:function(){
        // fetch 第一層留言
        return fetch(`/api/comments/${articleId}`)
        .then(response => response.json())
        .then(result => {
            
            model.comments = result.data;
        })
    },

    getSubComments:function(){
        // fetch 
        console.log(model.commentLevels)
        return fetch(`/api/childcomments/${model.commentLevels[model.commentLevels.length-1]}`)
        .then(response => response.json())
        .then(result => {
            model.comments = result.data;
            console.log(result)
        })
    },

    // getCommentLikes:function(params) {
    //     fetch('/api/commentlike')
    //     .then(response => response.json())
    //     .then(result => {
    //         // console.log('按讚資料')
    //         // console.log(result);
    //         model.commentlikes = result.data;
    //         // console.log(model.commentlikes);
    //     })
    // },

    submitComment:function(artId, comment, parent=null){
        console.log('送出留言' + parent);
        console.log(model.userData)
        if(model.userData === {}){
            alert('登入後才能使用留言功能~');
            return;
        }
        let requsetData = {
            'article_id':artId,
            'comment':comment,
            'parent':parent,
        }
        return fetch('/api/comment',{
            'method':'POST',
            'body':JSON.stringify(requsetData),
            'headers':{
                'content-type':'application/json'
            }
        })
        .then(response => response.json())
    },


    // 整篇文章
    getLikeData:function(){
        return fetch(`/api/like/${articleId}`)
        .then(response => response.json())
        .then(result => {
            
            // 利用key = user_id value= article_id 存放誰按過此篇文章
            let obj = {};
            result.data.forEach(item => {
                obj[`${item.user_id}`] = item.article_id;
            })
            model.article.likes = obj;
        })
    },

    likeEvent:function(){
        console.log()
        let requestBody = {
            // 改由後端利用session取得userid
            // 'userId':1,
            'article_id':articleId,
        }

        return fetch('/api/like',{
            method:'POST',
            body: JSON.stringify(requestBody),
            headers:{
                'content-type':'application/json'
            }
        })
        .then(response => response.json())
       
    },


    likeCommentEvent:function(commentId){
        let requestBody = {
            // 改由後端利用session取得userid
            // 'userId':1,
            'comment_id':commentId,
        }

        return fetch('/api/commentlike',{
            method:'POST',
            body: JSON.stringify(requestBody),
            headers:{
                'content-type':'application/json'
            }
        })
        .then(response => response.json())
       
    },

    delArticle:function(){
        return fetch('/api/article',{
            'method':'DELETE',
            'body':JSON.stringify({'article_id':articleId}),
            'headers':{
                'content-type':'application/json'
            }
        })
        .then(response => response.json())
        
    }

}

let view = {

    renderArticle:function(){
        let article = model.article;
        console.log(article)
        
        if(model.userData.user_id !== article.author.user_id){
            threeDots.remove();
        }
       
        let authorLink = document.querySelector('.author');
        authorLink.setAttribute('href', `/member/${article.author.user_id}`);

        let authorImg = document.querySelector('.author img');
        authorImg.setAttribute('src', article.author.avatar ? article.author.avatar : '../public/images/default-user-icon.jpg');
        let authorName = document.querySelector('.author h3');
        authorName.textContent = article.author.username;

        let articleTitle = document.querySelector('.article-title');
        articleTitle.textContent = article.title;

        let articleSummary = document.querySelector('.article-summary');
        articleSummary.textContent = article.summary;

        let coverPhotoImg = document.querySelector('.article-coverPhoto img');
        coverPhotoImg.setAttribute('src', article.coverPhoto);

        
        let articleContent = document.querySelector('.article-content');
        articleContent.innerHTML = article.content;

        let dateArray = article.create_time.split(/[T|\.|\:]/);
        let articleTime = document.querySelector('.article-create-time');
        articleTime.textContent = `${dateArray[0]} ${parseInt(dateArray[1])+8}:${dateArray[2]}`
        
        
    },

    renderArticleFeatrues:function(){
        let heartIcon = document.querySelector('.likeIcon');

        if(model.article.user_is_liked === 'yes'){
            heartIcon.classList.remove('bi-heart');
            heartIcon.classList.add('bi-heart-fill');
        }
        else{
            heartIcon.classList.remove('bi-heart-fill');
            heartIcon.classList.add('bi-heart');
        }
        
        let articleLikeQty = document.querySelector('.articleLikeQty');
        articleLikeQty.textContent = model.article.likeQty;
    },
    renderComments:function() {
        
        let comments = document.querySelector('.comments');
        let frag = document.createDocumentFragment();
        let commentTextArea = document.getElementById('comment');
        let replyTo = document.querySelector('.replyTo');
        replyTo.textContent = model.commentLevels.length > 0 ? `正在回覆${model.comments[0].username}...` : '';
        comments.innerHTML = "";
        commentTextArea.value = "";          
        model.comments.forEach((comment, index) => {
            // li
            let commentLi = document.createElement('li');
            commentLi.classList.add('comment');

            
            let authorImgLink = document.createElement('a');
            authorImgLink.setAttribute('href', `/member/${comment.user_id}`);
            let commentAuthorImg = document.createElement('img');
            commentAuthorImg.classList.add('comment-author-img');
            commentAuthorImg.setAttribute('src', comment.avatar ? comment.avatar : `../public/images/default-user-icon.jpg` );
            authorImgLink.appendChild(commentAuthorImg);

            let commentContent = document.createElement('div');
            commentContent.classList.add('comment-content');
            commentContent.innerHTML = `<a href="/member/${comment.user_id}">${comment.username}</a>  ${comment.comment}`;
            
            let commentInfo = document.createElement('div');
            commentInfo.classList.add('comment-info');
            let time = document.createElement('p');
            let date = comment.create_time.split('T');
            time.textContent= date[0];
            
            
            
            

            let commentBtn = document.createElement('p');
            commentBtn.textContent = '回覆';
            commentBtn.setAttribute('data-commentid', comment.comment_id);
            commentBtn.addEventListener('click', function (e) {
                let commentId = e.target.dataset.commentid;
                controller.subCommentMode(commentId)
            })
            commentInfo.appendChild(time);
            if(comment.likeQty){
                let likeQty = document.createElement('p');
                likeQty.textContent= `${comment.likeQty} 個讚`;
                commentInfo.appendChild(likeQty);
            }
            commentInfo.appendChild(commentBtn);

            commentContent.appendChild(commentInfo);

            let likeIcon = document.createElement('i');
            if(comment.user_is_liked ){
                likeIcon.classList.add('bi', 'bi-heart-fill');
            }
            else{
                likeIcon.classList.add('bi', 'bi-heart');
            }
            
            likeIcon.setAttribute('data-commentid', comment.comment_id);
            likeIcon.addEventListener('click', (e)=>{
                let commentId = e.target.dataset.commentid;
                controller.likeCommentEvent(commentId);
            })

            commentLi.appendChild(authorImgLink);
            commentLi.appendChild(commentContent);
            commentLi.appendChild(likeIcon);

            // 回覆留言模式額外設定
            if(model.commentLevels.length && index !== 0){
                commentLi.classList.add('sub-comment');
            }
            if(model.commentLevels.length && index === 0){
                commentBtn.textContent = '';
            }

            frag.appendChild(commentLi);

        })
        comments.appendChild(frag);

       
    }
}


let controller = {
    init:async function () { 
        // 取得文章及第一層留言了
        // 想辦法得到指定的第二層留言
        await model.checkUser();
        await model.getArticleData();
        
        await model.getLikeData();
        view.renderArticle();
        view.renderArticleFeatrues();
        await model.getLevelOneComments();
        view.renderComments();

        let commentAuthorImg = document.querySelector('.user-avatar');
        console.log(model.userData)
        commentAuthorImg.setAttribute('src', model.userData  ? model.userData.avatar : '../public/images/default-user-icon.jpg');
      
    },

    submitComment:async function(artId, comment) {
        console.log('送出留言 parent = ' + model.commentLevels);
        // 回覆留言
        if(model.commentLevels.length){
            // 第三個參數為回覆的留言ID = 資料庫中的parent
            let result = await model.submitComment(artId, comment, model.commentLevels[model.commentLevels.length-1])
            
            if(result.error){
                alert(result.message);
                return;
            }

            await model.getSubComments();
            view.renderComments();
        }
        // 回覆文章
        else{
            let result = await model.submitComment(artId, comment);
            console.log(result)
            if(result.error){
                alert(result.message);
                return;
            }
            await model.getLevelOneComments();
            view.renderComments();
        }
       
        
    },

    subCommentMode:async function(commentId) {
      model.commentLevels.push(commentId);
      await model.getSubComments();
      view.renderComments();
    },

    cancelSubCommentMode: async function(){
        model.commentLevels = [];
        console.log('取消回覆留言')
        await model.getLevelOneComments();
        view.renderComments();
    },
    prevSubComment:async function(){
        model.commentLevels.pop();
        if(!model.commentLevels.length){
            await model.getLevelOneComments();   
        }
        else{
            await model.getSubComments();
        }
        view.renderComments();
    },

    likeEvent:async function(){
        console.log('按讚事件')
        let likeResult =await model.likeEvent();
        await model.getArticleData();
        if(likeResult.error){
            alert(likeResult.message);
            return;
        }
        view.renderArticleFeatrues();
    },

    likeCommentEvent:async function(commentId){
        let result = await model.likeCommentEvent(commentId);
        if(result.error){
            alert(result.message);
            return;
        }

        if(!model.commentLevels.length){
            await model.getLevelOneComments();   
        }
        else{
            await model.getSubComments();
        }
        view.renderComments();
        
    },

    delArticle:async function(){
        let result = await model.delArticle();
        if(result.ok){
            window.location.href="/";
        }
        alert(result.message);
    }

    // submitSubComment: async function(artId, comment, parent) {
    //     let result = await model.submitComment(artId, comment, parent);
    //     console.log(result);
    //     view.renderComments();
    // }
}

controller.init();

// model.getCommentLikes();