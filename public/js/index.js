

import {checkUser} from './checkUser.js';
import {loading} from './loading.js';



let model = {
    mainData:null,
    asideListData:null,
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

    
    
}


let view = {
    
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

            let articleSummary = document.createElement('p');
            articleSummary.classList.add('article-summary');
            articleSummary.textContent = article.summary;

            articleContent.appendChild(articleTitle);
            articleContent.appendChild(articleSummary);

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
            let div1 = document.createElement('div');
            let div2 = document.createElement('div');
            let h3 = document.createElement('h3');
            let span = document.createElement('span');
            let imgContainer = document.createElement('div');
            imgContainer.classList.add('aside-coverPhoto');
            
            img.setAttribute('src', newPost.coverPhoto);
            imgContainer.appendChild(img);
            h3.classList.add('newPost-title');
            h3.textContent = newPost.title;
            span.classList.add('newPost-price');
            span.textContent = newPost.price ? `$ ${newPost.price}` : `$ 不公開`;

            div2.appendChild(h3);
            div2.appendChild(span);
            div1.appendChild(imgContainer);
            div1.appendChild(div2);
            div1.classList.add('newPost-info');
            div2.classList.add('newPost-text');
            link.appendChild(div1)
            link.setAttribute('href', `/article/${newPost.article_id}`)
            link.classList.add('aside-article-link');
            li.appendChild(link);
            let asideList = document.querySelector('.aside-list');
           
            asideList.appendChild(li);
        })
    }

}


let controller = {
    init:async function(){
    
        
       
        loading.toggleLoading()
    
        await model.checkUser();
        await model.getMainData();
        await model.getAsideData();
        
        view.renderMain('newest');
        view.renderMain('popular');
        view.renderMain('discussion');
        view.renderAsideList();
        
        
       
        loading.toggleLoading()
        
    },
}

controller.init();

