import { checkUser } from './checkUser.js';


let toggleShow = document.querySelectorAll('.toggleShow li a');
toggleShow.forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        console.log(e.target.dataset.display)
        let display = e.target.dataset.display;
        if (!display) {
            window.location.href = `${window.location.pathname}`
        }
        else {
            window.location.href = `${window.location.pathname}?display=${display}`
        }
        console.log(`${window.location.pathname}?display=${display}`)

    })

})


let model = {
    userData: {},
    mainListData: [],
    asideListData: [],
    tags: [],

    getUserData: function () {
        return checkUser().then(result => {
            if (result.message === '登入中') {
                model.userData = result.data;
            }
            else {
                let displayFollowingBtn = document.querySelector('.displayFollowingBtn');
                console.log(displayFollowingBtn)
                displayFollowingBtn.remove();
            }
        })
    },
    getMainListData: function () {

        let querystring = window.location.search;
        let params = new URLSearchParams(querystring);
        let keyword = params.get('keyword');
        let display = params.get('display');
        let tag = params.get('tag');
        
        if (keyword) {
            return fetch(`/api/articles?keyword=${keyword}`)
                .then(response => response.json())
                .then(result => {
                    console.log(result)
                    if(result.ok){
                        model.mainListData = result.data;
                    }
                    
                    // view.renderMainList();
                    // view.renderTags();
                })
        }
        else if (display) {
            return fetch(`/api/articles?display=${display}`)
                .then(response => response.json())
                .then(result => {
                    if(result.ok){
                        model.mainListData = result.data;
                    }
                    
                    // view.renderMainList();
                    // view.renderTags();
                })
        }
        else if(tag){
            return fetch(`/api/articles?tag=${tag}`)
                .then(response => response.json())
                .then(result => {
                    console.log(result)
                    if(result.ok){
                        model.mainListData = result.data;
                    }
                    // view.renderMainList();
                    // view.renderTags();
                })
        }
        else {
            return fetch('/api/articles')
                .then(response => response.json())
                .then(result => {
                    console.log(result)
                    if(result.ok){
                        model.mainListData = result.data;
                    }
                    // view.renderMainList();
                    // view.renderTags();
                })
        }

    },

    getAsideListData: function () {
        return fetch('/api/randompost')
            .then(response => response.json())
            .then(result => {
                model.asideListData = result;
            })
    },

    getTags: function () {
        return fetch('/api/tag')
            .then(response => response.json())
            .then(result => {
                if (result.ok) {
                    model.tags = result.data;
                }
            })
    },

    likeEvent:function(artId){
        return fetch('/api/like', {
            'method': 'POST',
            'body': JSON.stringify({
                'article_id': artId
            }),
            'headers': {
                'content-type': 'application/json'
            }
        })
        .then(response => response.json());
    }
}

let view = {
    renderMainList: function () {
        console.log(model.mainListData)
        let frag = document.createDocumentFragment();
        let main = document.querySelector('main');
        console.log(model.mainListData);
        main.innerHTML = "";
        model.mainListData.forEach(item => {
            let article = document.createElement('div');
            article.classList.add('article');
            // article-header
            let articleHeader = document.createElement('div');
            articleHeader.classList.add('article-header');
            let author = document.createElement('a');
            author.setAttribute('href', `/member/${item.author.user_id}`);
            author.classList.add('author');
            let autohrImg = document.createElement('img');
            autohrImg.setAttribute('src', item.author.avatar ? item.author.avatar : '../public/images/default-user-icon.jpg');
            let autohrName = document.createElement('h3');
            autohrName.textContent = item.author.username;
            author.appendChild(autohrImg);
            author.appendChild(autohrName);
            // let features = document.createElement('div');
            // features.classList.add('author-features');

            // let authorFeaturesCollapase = document.createElement('ul')
            // authorFeaturesCollapase.classList.add('author-features-collapase', 'collapase');

            // // collapase 編輯按鈕
            // let authorFeatureEdit = document.createElement('li');
            // let authorFeatureEditLink = document.createElement('a');
            // authorFeatureEditLink.setAttribute('href', "");
            // authorFeatureEditLink.textContent = "編輯文章"
            // authorFeatureEditLink.classList.add('author-feature');
            // authorFeatureEdit.appendChild(authorFeatureEditLink);

            // // collapase 刪除按鈕
            // let authorFeatureDel = document.createElement('li');
            // let authorFeatureDelLink = document.createElement('a');
            // authorFeatureDelLink.setAttribute('href', "");
            // authorFeatureDelLink.textContent = "刪除文章"
            // authorFeatureDel.classList.add('author-feature');
            // authorFeatureDelLink.addEventListener('click', function(e){
            //     e.preventDefault();
            //     fetch('/api/article', {
            //         'method':'DELETE'
            //     })
            // })
            // authorFeatureDel.appendChild(authorFeatureDelLink);

            // authorFeaturesCollapase.appendChild(authorFeatureEdit);
            // authorFeaturesCollapase.appendChild(authorFeatureDel);

            // let threeDots = document.createElement('i');
            // threeDots.classList.add('bi', 'bi-three-dots');

            // threeDots.addEventListener('click', function(e){
            //     e.preventDefault();
            //     console.log('toggle')
            //     authorFeaturesCollapase.classList.toggle('active');
            // })

            // threeDots.appendChild(authorFeaturesCollapase);

            // features.appendChild(threeDots);
            articleHeader.appendChild(author);
            // articleHeader.appendChild(features);

            // article-coverPhoto
            let articleLink = document.createElement('a');
            articleLink.setAttribute('href', '/article/item.article_id');
            let articleCoverPhoto = document.createElement('a');
            articleCoverPhoto.setAttribute('href', `/article/${item.article_id}`);
            articleCoverPhoto.classList.add('article-coverPhoto');
            let coverPhotoImg = document.createElement('img');
            coverPhotoImg.setAttribute('src', item.coverPhoto);
            articleCoverPhoto.appendChild(coverPhotoImg);


            // article-articleFeatures
            let articleFeatures = document.createElement('div');
            articleFeatures.classList.add('article-features');
            let mainLikeIcon = document.createElement('i');
            if (item.user_is_liked) {
                mainLikeIcon.classList.add('bi', 'bi-heart-fill');
            }
            else {
                mainLikeIcon.classList.add('bi', 'bi-heart');
            }

            mainLikeIcon.setAttribute('data-artid', item.article_id);
            mainLikeIcon.addEventListener('click', function (e) {
                console.log(e.target.dataset.artid)
                fetch('/api/like', {
                    'method': 'POST',
                    'body': JSON.stringify({
                        'article_id': e.target.dataset.artid
                    }),
                    'headers': {
                        'content-type': 'application/json'
                    }
                })
                    .then(response => response.json())
                    .then(result => {
                        console.log(result)
                        if (result.ok) {
                            controller.getMainList();
                        }
                        else if (result.error) {
                            alert(result.message);
                        }
                    })
            })

            let mainChatIcon = document.createElement('a');
            mainChatIcon.classList.add('bi', 'bi-chat');
            mainChatIcon.setAttribute('href', `/article/${item.article_id}`);

            let mainLikeQty = document.createElement('p');
            mainLikeQty.textContent = `${item.likeQty}個讚`;
            articleFeatures.appendChild(mainLikeIcon);
            articleFeatures.appendChild(mainChatIcon);
            articleFeatures.appendChild(mainLikeQty);

            // article-content
            let articleContent = document.createElement('div');
            articleContent.classList.add('article-content')
            let title = document.createElement('p');
            title.textContent = `${item.author.username}  ${item.title}`;
            let summary = document.createElement('p');
            summary.textContent = item.summary;
            articleContent.appendChild(title);
            articleContent.appendChild(summary);

            // show comment
            let showComment = document.createElement('a');
            showComment.setAttribute('href', `/article/${item.article_id}`);
            showComment.classList.add('show-comment');
            showComment.textContent = '查看留言';



            // // 發布時間
            let articleTime = document.createElement('p');
            let dateArray = item.create_time.split(/[T|\.|\:]/);
            articleTime.classList.add('article-time');
            articleTime.textContent = `${dateArray[0]} ${parseInt(dateArray[1]) + 8}:${dateArray[2]}`



            // 留言input區塊
            let commentInput = document.createElement('div');
            commentInput.classList.add('article-comment-input');
            let userAvatar = document.createElement('img');
            userAvatar.classList.add('user-avatar');
            userAvatar.setAttribute('src', model.userData.avatar ? model.userData.avatar : '../public/images/default-user-icon.jpg');
            let textarea = document.createElement('textarea');
            textarea.setAttribute('id', 'comment');
            textarea.setAttribute('placeholder', '留言......');
            let sendComment = document.createElement('a');
            sendComment.classList.add('sendComment');
            sendComment.setAttribute('data-artid', item.article_id);
            sendComment.textContent = '發布';
            // 發布留言事件監聽
            sendComment.addEventListener('click', async function (e) {
                e.preventDefault(e);
                let comment = e.path[1].children[1];
                let artid = e.target.dataset.artid;
                let submitResult = await model.submitComment(artid, comment.value);
                if (submitResult.ok) {
                    comment.value = "";
                    view.renderArticle();
                }
                else {
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
            // article.appendChild(articleComment);
            article.appendChild(articleTime);
            article.appendChild(commentInput);

            frag.appendChild(article);
        })

        main.appendChild(frag);
    },


    renderAsideList: function () {

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
            span.textContent = newPost.price ? `入手價格: ${newPost.price}` : `入手價格: 不公開`;

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
    },

    renderMainListold: function () {
        let frag = document.createDocumentFragment();
        let mainList = document.querySelector('.main-list');

        mainList.innerHTML="";
        if(model.mainListData.length === 0){
            let li = document.createElement('li');
            let h3 = document.createElement('h3');

            h3.textContent = '沒有符合的文章~ 試試其他搜尋吧'
            h3.classList.add('not-found')
            li.appendChild(h3);
            mainList.appendChild(li);
            return;
        }
        else{
            model.mainListData.forEach((item) => {
                let li = document.createElement('li');
                let a = document.createElement('a');
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
                let heartIcon = document.createElement('i');
                let likeQty = document.createElement('span');
                let commentQty = document.createElement('span');
                let messageIcon = document.createElement('a');
                let date = document.createElement('p');
    
                coverPhoto.classList.add('coverPhoto')
                coverPhoto.setAttribute('src', item.coverPhoto);
                a.appendChild(coverPhoto);
    
                summary.classList.add('summary');
                author.classList.add('author');
                author.setAttribute('href', `/member/${item.author.user_id}`);
                // author.textContent = item.article.user_id;
    
                // 如果使用者沒有avatar就使用預設照片
                avatar.setAttribute('src', item.author.avatar ? item.author.avatar : '../public/images/default-user-icon.jpg');
    
                username.textContent = item.author.username;
                let dateArray = item.create_time.split(/[T|\.|\:]/)
                createTime.textContent = `${dateArray[0]} ${parseInt(dateArray[1])+8}:${dateArray[2]}`
                author.appendChild(avatar);
                author.appendChild(username);
                author.appendChild(createTime);
    
                title.classList.add('title');
                title.textContent = item.title;
                price.textContent = `${item.price ? `入手價格: ${item.price}` : '入手價格: 不公開'}`
                price.classList.add('price');
                content.classList.add('content');
                content.textContent = item.summary;
    
    
    
    
                features.classList.add('features');
                if (item.user_is_liked === 'yes') {
                    heartIcon.classList.add('bi', 'bi-heart-fill');
                }
                else {
                    heartIcon.classList.add('bi', 'bi-heart');
                }
    
                messageIcon.classList.add('bi', 'bi-chat-dots')
    
                likeQty.textContent = item.likeQty === 0 ? "" : item.likeQty;
                heartIcon.appendChild(likeQty);
                heartIcon.setAttribute('data-artid', item.article_id);
    
                commentQty.textContent = item.commentQty === 0 ? "" : item.commentQty;
                messageIcon.appendChild(commentQty);
                messageIcon.setAttribute('href', `/article/${item.article_id}`);
    
                heartIcon.addEventListener('click', function (e) {
                    // console.log(e.target.dataset.artid)
                    // fetch('/api/like', {
                    //     'method': 'POST',
                    //     'body': JSON.stringify({
                    //         'article_id': e.target.dataset.artid
                    //     }),
                    //     'headers': {
                    //         'content-type': 'application/json'
                    //     }
                    // })
                    // .then(response => response.json())
                    // .then(result => {
                    //     if (result.ok) {
                    //         controller.getMainList();
                    //     }
                    // })
                    controller.likeEvent(e.target.dataset.artid);
                })
    
                features.appendChild(heartIcon);
                features.appendChild(messageIcon);
                features.appendChild(date);
    
                summary.appendChild(author);
                summary.appendChild(title);
                summary.appendChild(price);
                summary.appendChild(content);
                summary.appendChild(features);
    
                a.setAttribute('href', `/article/${item.article_id}`);
                // a.appendChild(summary);
                li.appendChild(a);
                li.appendChild(summary);
    
                frag.appendChild(li);
            })
            mainList.appendChild(frag);
        }
        
    },

    renderTags: function () {
        
        let querystring = window.location.search;
        let params = new URLSearchParams(querystring);
        let tag = params.get('tag');
        let display = params.get('display');

    
        if(display=== null){
            let newest = document.querySelector('.newest');
            newest.classList.add('active');
        }
        else if(display=== 'hot'){
            let hot = document.querySelector('.hot');
            hot.classList.add('active');
        }
        else if(display=== 'following'){
            let following = document.querySelector('.following');
            following.classList.add('active');
        }

        let tags = document.querySelector('.tags');

      
        model.tags.forEach(item => {
            let li = document.createElement('li');
            let a = document.createElement('a');
            a.classList.add('tag');
            if(item.tag_id === parseInt(tag)){
                a.classList.add('active'); 
            }
            a.setAttribute('data-tag', item.tag_id);
        
            a.textContent = item.tag;

            li.appendChild(a);
            tags.appendChild(li);

            a.addEventListener('click', function(e){
                let tagId = e.target.dataset.tag;
                window.location.href = `/articles?tag=${tagId}`;
            })
        })
    }

}


let controller = {
    init: async function () {
        await model.getUserData();

        controller.getMainList();
        controller.getAsideList();
        controller.getTags();

    },

    getMainList: async function () {
        console.log('controll get main')
        await model.getMainListData();
        view.renderMainListold();
    },

    getAsideList: async function () {
        await model.getAsideListData();
        view.renderAsideList();
    },

    getTags: async function () {
        await model.getTags();
        view.renderTags();
    },

    likeEvent:async function(artId){
        let likeResult = await model.likeEvent(artId);
        console.log(likeResult);
        if(likeResult.ok){
            controller.getMainList();
        }
        else{
            alert(likeResult.message);
        }
        
    },

}

controller.init()