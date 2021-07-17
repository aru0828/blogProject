

// // 取得main文章列表
// function getMainList(){
//     fetch('/api/articles', {
//         method:'GET'
//     })
//     .then(response => response.json())
//     .then(result => {
//         console.log(result)
//         model.mainListData = result;
//         view.renderMainList();
//         // view.renderTags();
//     }) 
// }

// getMainList();


// 隨機資料



let model = {
    mainListData:null,
    asideListData:null,

    getMainListData:function(){
        return fetch('/api/articles')
                .then(response => response.json())
                .then(result => {
                    console.log(result)
                    model.mainListData = result;
                    view.renderMainList();
                    // view.renderTags();
                }) 
    },

    getAsideListData:function(){
        return fetch('/api/randompost')
        .then(response => response.json())
        .then(result => {
            model.asideListData = result;
            view.renderAsideList();

        })
    }
}

let view = {
    renderMainList:function(){
        let frag = document.createDocumentFragment();
        let mainList = document.querySelector('.main-list');
        mainList.innerHTML="";
        model.mainListData.data.articles.forEach(article => {   
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
            
            if(article.user_isliked === 'yes'){
                thumbsIcon.classList.add('bi', 'bi-heart-fill');
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
                    console.log(result)
                    if(result.ok){
                        controller.getMainList();
                    }
                    else if(result.error){
                        alert('登入會員才能按讚哦~')
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

    renderTags:function(){
        let tagGroup = document.querySelector('.tagGroup');
        console.log(model)
        model.mainListData.data.tags.forEach(tag => {
            
            let tagLink  = document.createElement('a');
            tagLink.classList.add('badge', 'rounded-pill' , 'bg-dark');
            tagLink.textContent = tag.tag;
            tagGroup.appendChild(tagLink);
        })
        
        // <a class="badge rounded-pill bg-dark">tomica</a>
    }

}


let controller = {
    init:function(){
        controller.getMainList();
        controller.getAsideList();
    },

    getMainList:async function(){
        await model.getMainListData();
        view.renderMainList();
    },

    getAsideList:async function(){
        await model.getAsideListData();
        view.renderAsideList();
    }
}

controller.init()