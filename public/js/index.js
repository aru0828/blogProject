

import {checkUser} from './checkUser.js';

let queryString = window.location.search;
let params = new URLSearchParams(queryString);
let q = params.get("display"); // is the number 123


let sendComment = document.querySelectorAll('.sendComment');
// console.log(sendComment);


let toggleShow = document.querySelectorAll('.toggleShow li');
toggleShow.forEach(item=>{
    item.addEventListener('click', function(e){
        console.log(e.target.dataset.display)
        let display = e.target.dataset.display;
        if(!display){
            window.location.href= `${window.location.pathname}`
        }
        else{
            window.location.href= `${window.location.pathname}?display=${display}`
        }
        console.log(`${window.location.pathname}?display=${display}`)
        
    })
    
})









let model = {
    mainData:null,
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
    getMainData:function(keyword = null){
        return fetch('/api/index')
        .then(response => response.json())
        .then(result => {
            console.log(result);
            model.mainData = result.data;
        })
    },


    getAsideData:function(){
        return fetch('/api/randompost')
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
    // <div class="index-section-articles">
    //                 <ul class="article-list">
    //                     <li>
    //                         <a href="">
    //                             <div class="article-img">
    //                             <img 
    //                             src="https://aru0828practicebucket.s3.ap-northeast-2.amazonaws.com/b2d5d953c5eca98b0ca7b8818e798aa8"
    //                              </div>
    //                            
    //                             alt="">
    //                         </a>
                            
    //                         <div class="article-content">
    //                              article-title
    //                             【影評人】《破處》　褲子都脫了給我看這個
    //                         </div>
    //                     </li>

    //                 </ul>
    //             </div>
    renderMain:function(dataSource){
        let indexSectionArticles = document.querySelector('.index-section-articles');
        let articleList = document.querySelector(`.${dataSource}-article-list`);
        console.log(dataSource);

        model.mainData[`${dataSource}Articles`].forEach(article => {
            let li = document.createElement('li');

            let imgLink = document.createElement('a');
            let imgDiv = document.createElement('div');
            imgDiv.classList.add('article-img');
            imgLink.setAttribute('href', `/article/${article.article_id}`);
            let img = document.createElement('img');
            img.setAttribute('src', article.coverPhoto);
            imgDiv.appendChild(img);
            imgLink.appendChild(imgDiv);

            let articleContent = document.createElement('div');
            articleContent.classList.add('article-content')

            let articleTitle = document.createElement('p');
            articleTitle.classList.add('article-title');
            articleTitle.textContent = article.title;

            // let articleSummary = document.createElement('p');
            // articleSummary.classList.add('article-summary');
            // articleSummary.textContent = article.summary;

            articleContent.appendChild(articleTitle);
            // articleContent.appendChild(articleSummary);

            li.appendChild(imgLink);
            li.appendChild(articleContent);
            articleList.appendChild(li);
        })

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
        await model.getMainData();
        await model.getAsideData();
        // view.renderArticle();
        // view.renderMainList();
        view.renderAsideList()
        view.renderMain('newest');
        view.renderMain('popular');
        view.renderMain('discussion');
        
    },

    keyWorkSearch:async function(){
        console.log('keyword')
    },

    rerenderMain: async function(){
        await model.getMainData();
        await model.getUserLikes();
        // view.renderArticle();
        view.renderMain('newest');
        view.renderMain('polular');
        view.renderMain('discussion');
        console.log('renderart')
    }
}

controller.init();

