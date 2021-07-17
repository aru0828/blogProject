

import {checkUser} from './checkUser.js';


let sendComment = document.querySelectorAll('.sendComment');
// console.log(sendComment);












let model = {
    mainListData:null,
    asideListData:null,
    // key = like_id, value = article_id
    userLikes:[],
    userData:{},

    checkUser:function(){
        return  checkUser().then(result => {
            if(result.data){
                model.isLogined = true;
                model.userData = result.data;
            }
        });
    },
    getMainData:function(){
        return fetch('/api/hotpost')
        .then(response => response.json())
        .then(result => {
            model.mainListData = result;
        })
    },

    getAsideData:function(){
        return fetch('/api/newpost')
        .then(response => response.json())
        .then(result => {
            model.asideListData = result;
        })
    },

    getUserLikes:function(){
        return fetch('/api/like')
        .then(response => response.json())
        .then(result =>{
            model.userLikes = result;
        })
    },

    submitComment:function(artId, comment, parent=null){
        // 隨html結構變化

        let requsetData = {
            'article_id':artId,
            'comment':comment,
            'parent':parent,
        }
        console.log(requsetData);
        return fetch('/api/comment',{
            'method':'POST',
            'body':JSON.stringify(requsetData),
            'headers':{
                'content-type':'application/json'
            }
        })
        .then(response => response.json())
        
        // 利用e get 該篇文章的留言input內容
        // console.log(e.path[1].children[1].value);
    },

    
}


let view = {
    renderArticle:function(){
        let frag = document.createDocumentFragment();
        let main = document.querySelector('main');
        console.log(model.mainListData);
        main.innerHTML="";
        model.mainListData.data.forEach(item => {
            let article = document.createElement('div');
            article.classList.add('article');
            // article-header
            let articleHeader = document.createElement('div');
            articleHeader.classList.add('article-header');
            let author = document.createElement('div');
            author.classList.add('author');
            let autohrImg = document.createElement('img');
            autohrImg.setAttribute('src', item.article.avatar ?  item.article.avatar : '../public/images/default-user-icon.jpg');
            let autohrName = document.createElement('h3');
            autohrName.textContent = item.article.author.username;
            author.appendChild(autohrImg);
            author.appendChild(autohrName);
            let features = document.createElement('div');
            features.classList.add('features');
            let threeDots = document.createElement('i');
            threeDots.classList.add('bi', 'bi-three-dots');
            features.appendChild(threeDots);
            articleHeader.appendChild(author);
            articleHeader.appendChild(features);
            
            // article-coverPhoto
            let articleCoverPhoto = document.createElement('div');
            articleCoverPhoto.classList.add('article-coverPhoto');
            let coverPhotoImg = document.createElement('img');
            coverPhotoImg.setAttribute('src', item.article.coverPhoto);
            articleCoverPhoto.appendChild(coverPhotoImg);


            // article-articleFeatures
            let articleFeatures = document.createElement('div');
            articleFeatures.classList.add('article-features');
            let mainLikeIcon = document.createElement('i');
            if(model.userLikes.length){
                mainLikeIcon.classList.add('bi', `${model.userLikes.user_likes[item.article.article_id] ? 'bi-heart-fill' :'bi-heart'}`);
            }
            else{
                mainLikeIcon.classList.add('bi', 'bi-heart');
            }
            
            mainLikeIcon.setAttribute('data-artid', item.article.article_id);
            mainLikeIcon.addEventListener('click', function(e){
                console.log(e.target.dataset.artid)
                fetch('/api/like',{
                    'method':'POST',
                    'body':JSON.stringify({
                        'article_id':e.target.dataset.artid
                    }),
                    'headers':{
                        'content-type':'application/json'
                    }
                })
                .then(response => response.json())
                .then(result => {
                    console.log(result)
                    if(result.ok){
                        controller.rerenderMain();
                    }
                    else if(result.error){
                        alert('登入會員才能按讚哦~')
                    }
                })
            })
            
            let mainChatIcon = document.createElement('i');
            mainChatIcon.classList.add('bi', 'bi-chat-dots');
            let mainLikeQty = document.createElement('p');
            mainLikeQty.textContent = `${item.article.likeQty}個讚`;
            articleFeatures.appendChild(mainLikeIcon);
            articleFeatures.appendChild(mainChatIcon);
            articleFeatures.appendChild(mainLikeQty);

            // article-content
            let articleContent = document.createElement('div');
            articleContent.classList.add('article-content')
            let title = document.createElement('p');
            title.textContent = `${item.article.author.username}  ${item.article.title}`;
            let summary = document.createElement('p');
            summary.textContent = item.article.summary;
            articleContent.appendChild(title);
            articleContent.appendChild(summary);
            
            // show comment
            let showComment = document.createElement('p');
            showComment.classList.add('show-comment');
            showComment.textContent = '查看更多留言';

            // 留言列表
            let articleComment = document.createElement('div');
            articleComment.classList.add('article-comment');
            // 顯示留言 可能要跑for
            for(let i = 0 ; i<2 ; i++){
                let commentRow = document.createElement('div');
                commentRow.classList.add('commentRow');
                let commentAuthor = document.createElement('span');
                commentAuthor.textContent = 'Aru';
                let commentText = document.createElement('span');
                commentText.textContent = '好開心1234';
                let commentLikeIcon = document.createElement('i');
                commentLikeIcon.classList.add('bi', 'bi-heart');
                commentRow.appendChild(commentAuthor);
                commentRow.appendChild(commentText);
                commentRow.appendChild(commentLikeIcon);
                articleComment.appendChild(commentRow);
            }
            

            // // 發布時間
            let articleTime = document.createElement('p');
            let dateArray = item.article.create_time.split(/[T|\.|\:]/);
            articleTime.classList.add('article-time');
            articleTime.textContent = `${dateArray[0]} ${parseInt(dateArray[1])+8}:${dateArray[2]}`
        //             <div class="article-comment">
        //                 <div class="commentRow">
        //                     <span class="comment-author">test</span> <span>好開心1234</span>
        //                     <i class="bi bi-heart"></i>
        //                 </div>
        //                 <div class="commentRow">
        //                     <span class="comment-author">test</span> <span>好開心1234</span>
        //                     <i class="bi bi-heart"></i>
        //                 </div>
        //             </div>


            // 留言input區塊
            let commentInput = document.createElement('div');
            commentInput.classList.add('article-comment-input');
            let userAvatar = document.createElement('img');
            userAvatar.classList.add('user-avatar');
            userAvatar.setAttribute('src', '../public/images/photo-1416339134316-0e91dc9ded92.jpg');
            let textarea = document.createElement('textarea');
            textarea.setAttribute('id', 'comment');
            textarea.setAttribute('placeholder', '留言......');
            let sendComment = document.createElement('a');
            sendComment.classList.add('sendComment');
            sendComment.setAttribute('data-artid', item.article.article_id);
            sendComment.textContent = '發布';
            // 發布留言事件監聽
            sendComment.addEventListener('click', async function(e){
                e.preventDefault(e);
                let comment = e.path[1].children[1];
                let artid  = e.target.dataset.artid;
                let submitResult = await model.submitComment(artid, comment.value);
                if(submitResult.ok){
                    comment.value = "";
                    view.renderArticle();
                }
                else{
                    alert(submitResult.message);
                }
            })
            commentInput.appendChild(userAvatar);
            commentInput.appendChild(textarea);
            commentInput.appendChild(sendComment);
    

            article.appendChild(articleHeader);
            article.appendChild(articleCoverPhoto);
            article.appendChild(articleFeatures);
            article.appendChild(articleContent);
            article.appendChild(showComment);
            article.appendChild(articleComment);
            article.appendChild(articleTime);
            article.appendChild(commentInput);
            
            frag.appendChild(article);
        })
        
        main.appendChild(frag);
        
    },
    renderMainList:function(){
        let frag = document.createDocumentFragment();
        let mainList = document.querySelector('.main-list');
        mainList.innerHTML="";
        model.mainListData.forEach(article => {   
            let li = document.createElement('li');
            let a  = document.createElement('a');
            let coverPhoto = document.createElement('img');
            let summary = document.createElement('div');
            let author = document.createElement('a');
            let avatar = document.createElement('img');
            let username = document.createElement('h3');
            let createTime = document.createElement('span');
            let title = document.createElement('h3');
            let price = document.createElement('p');
            let content = document.createElement('p');
            let features = document.createElement('div');
            let thumbsIcon = document.createElement('i');
            let likes   = document.createElement('span');
            let messageIcon = document.createElement('i');
            let date = document.createElement('p');

            coverPhoto.classList.add('coverPhoto')
            coverPhoto.setAttribute('src', article.coverPhoto);
            a.appendChild(coverPhoto);

            summary.classList.add('summary');
            author.classList.add('author');
            // author.textContent = article.user_id;
            
            // 如果使用者沒有avatar就使用預設照片
            avatar.setAttribute('src', article.avatar ?  article.avatar : '../public/images/default-user-icon.jpg');
            
            username.textContent = article.username;
            let dateArray = article.create_time.split(/[T|\.|\:]/)
            createTime.textContent = `${dateArray[0]} ${parseInt(dateArray[1])+8}:${dateArray[2]}`
            author.appendChild(avatar);
            author.appendChild(username);
            author.appendChild(createTime);
    
            title.classList.add('title');
            title.textContent = article.title;
            price.textContent = `${article.price ? `入手價格: ${article.price}` : '入手價格: 不公開'}`
            price.classList.add('price');
            content.classList.add('content');
            content.textContent = article.summary;

            
        

            features.classList.add('features');
            console.log(article.user_isliked)
            if(article.user_isliked === 'yes'){
                thumbsIcon.classList.add('bi', 'bi-hand-thumbs-up-fill');
            }
            else{
                thumbsIcon.classList.add('bi', 'bi-heart');
            }
            
            messageIcon.classList.add('bi', 'bi-chat-dots')

            likes.textContent = article.likes === 0 ? "" : article.likes;
            thumbsIcon.appendChild(likes);
            thumbsIcon.setAttribute('data-artid', article.article_id);

            thumbsIcon.addEventListener('click', function(e){
                console.log(e.target.dataset.artid)
                fetch('/api/like',{
                    'method':'POST',
                    'body':JSON.stringify({
                        'article_id':e.target.dataset.artid
                    }),
                    'headers':{
                        'content-type':'application/json'
                    }
                })
                .then(response => response.json())
                .then(result => {
                    if(result.ok){
                        model.rerenderMain();
                    }
                })
            })
            
            features.appendChild(thumbsIcon);
            features.appendChild(messageIcon);
            features.appendChild(date);

            summary.appendChild(author);
            summary.appendChild(title);
            summary.appendChild(price);
            summary.appendChild(content);
            summary.appendChild(features);

            a.setAttribute('href', `/article/${article.article_id}`);
            // a.appendChild(summary);
            li.appendChild(a);
            li.appendChild(summary);

            frag.appendChild(li);
        })
        mainList.appendChild(frag);
    },


    renderAsideList: function(){

        model.asideListData.forEach(newPost => {
            let link = document.createElement('a');
            let li = document.createElement('li');
            let img = document.createElement('img');
            let div1 = document.createElement('div1');
            let div2 = document.createElement('div2');
            let h3 = document.createElement('h3');
            let span = document.createElement('span');

            img.setAttribute('src', newPost.coverPhoto);
            
            h3.classList.add('newPost-title');
            h3.textContent = newPost.title;
            span.classList.add('newPost-price');
            span.textContent = newPost.price ? `$ ${newPost.price}` : `$ 秘密`;

            div2.appendChild(h3);
            div2.appendChild(span);
            div1.appendChild(img);
            div1.appendChild(div2);
            div1.classList.add('newPost-info');

            link.appendChild(div1)
            link.setAttribute('href', `/article/${newPost.article_id}`)
            li.appendChild(link);
            let asideList = document.querySelector('.aside-list');
           
            asideList.appendChild(li);
        })
        
        // <li>
        //     <div class="newPost-info">
        //         <img src="../public/images/圖片.jpg" alt="" with="120" height="120">
        //         <div>
        //             <h3 class="newPost-title">Mini GT civic</h3>
        //             <span  class="newPost-price">$1200</span>
        //         </div>
        //     </div>
            
        //     <!-- <div class="newPost-summary">
        //         <h3 class="newPost-description mb-3">Lorem, ipsum dolor sit ameusantium ea? Pariatur accusantium sapiente sequi fugiat?</h3>  
        //     </div> -->
        
        // </li>
    }

}


let controller = {
    init:async function(){
        await model.checkUser();
        console.log(model.userData)
        await Promise.all([model.getMainData(), model.getAsideData()]);
        
        console.log('await ok')
        view.renderArticle();
        view.renderAsideList()
        
    },
    rerenderMain: async function(){
        await Promise.all([model.getMainData(),  model.getUserLikes()]);
        view.renderArticle();
        console.log('renderart')
    }
}

controller.init();

