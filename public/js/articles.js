
// 取得main文章列表
fetch('/api/articles', {
    method:'GET'
})
.then(response => response.json())
.then(result => {
    console.log(result)
    model.mainListData = result;
    view.renderMainList();
    view.renderTags();
}) 

// 最新資料
fetch('/api/newpost')
.then(response => response.json())
.then(result => {
    model.asideListData = result;
    view.renderAsideList();
    
})


// <li>
//     <img class="main-list-coverPhoto" src="../public/images/圖片.jpg" alt="">
//     <div class="main-list-summary">
//         <h3 class="main-list-author">
//             <a href="#">aru0828</a>     
//         </h3>
    
//         <h3 class="main-list-title">Mini GT civic</h3>
//         <p  class="main-list-price">$1200</p>                 
//         <h3 class="main-list-description">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quae, voluptatum ea? Veritatis impedit accusantium ea? Pariatur accusantium sapiente sequi fugiat?</h3>               

//         <div class="main-list-features">
//             <i class="bi bi-hand-thumbs-up"></i>
//             <i class="bi bi-chat-dots"></i>
//             <p class="main-list-date">2021/06/20</p>
//         </div>
//     </div>        
// </li>

// 取得aside文章列表
// fetch('/api/newarticles', {
//     method:'GET'
// })
// .then(response => response.json())
// .then(result => {
//     console.log(result)
//     let div = document.querySelector('div');
//     result.forEach(articleSummary => {   
//     })
    
// }) 




let model = {
    mainListData:null,
    asideListData:null,
}

let view = {
    renderMainList:function(){
        let frag = document.createDocumentFragment();
        let mainList = document.querySelector('.main-list');
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
            price.textContent = `${article.price ? `$ ${article.price}` : '價格不公開'}`
            price.classList.add('price');
            content.classList.add('content');
            content.textContent = article.summary;

            
        

            features.classList.add('features');
            thumbsIcon.classList.add('bi', 'bi-hand-thumbs-up')
            messageIcon.classList.add('bi', 'bi-chat-dots')
            
            // date.classList.add('date');
            // date.textContent = article.create_time;
            features.appendChild(thumbsIcon);
            features.appendChild(messageIcon);
            features.appendChild(date);

            summary.appendChild(author);
            summary.appendChild(title);
            summary.appendChild(price);
            summary.appendChild(content);
            summary.appendChild(features);

            a.setAttribute('href', `/article?articleid=${article.article_id}`);
            a.appendChild(summary);
            li.appendChild(a);

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
            link.setAttribute('href', `/article?articleid=${newPost.article_id}`)
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

}