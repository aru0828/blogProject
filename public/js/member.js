

import {checkUser} from './checkUser.js';

let pathParams = window.location.pathname.split("/");
let memberId = pathParams[pathParams.length-1];


let followBtn = document.querySelector('.follow-btn');

followBtn.addEventListener('click', function(e){
    e.preventDefault();
    controller.followMember();

})


let model = {
    userData:{},
    memberData :{},
    isFollowed:false,

    getUserData:function(){
        return checkUser().then(result=>{
            if(result.message==='登入中'){
                model.userData = result.data;
            }
        })
    },
    getPageData:function(){
        return fetch(`/api/member/${memberId}`)
        .then(response => response.json())
        .then(result => {       
            console.log(result)
            
            if(result.ok){        
                model.memberData = result.data;
            }
            else if(result.error){
                // window.location.href = '/';
            }
        })
    },

    followMember:function(){
        
        let requestData = {
            'follow_id':memberId
        }
        return fetch('/api/follow', {
            'method':'POST',
            'body':JSON.stringify(requestData),
            'headers':{
                'content-type':'application/json'
            }
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            if(result.error){
                alert(result.message);
            }
        })
    },

    getFollowData:function(){
        let followId = memberId;
        console.log('fetch follow')
        return fetch(`/api/follow/${followId}`)
        .then(response => response.json())
        .then(result => {
            console.log(result)
            if(result.ok){
                model.isFollowed = result.data.isFollowed;
            }
        })

    },
}

let view = {

    renderMemberInfo:function(){
        // 會員資訊
        let user = model.memberData.memberData;
        let avatar = document.querySelector('.member-summary img');
        let memberName = document.querySelector('.member-name');
        let postQty = document.querySelector('.post-qty');
        let followerQty = document.querySelector('.follower-qty');
        let memeberDescription = document.querySelector('.member-description p')


        avatar.setAttribute('src', !user.avatar ?  '../public/images/default-user-icon.jpg' : user.avatar);
        memberName.textContent = user.username;
        postQty.textContent = `${model.memberData.articles.length > 0 ? model.memberData.articles.length : 0} 個收藏`;
        followerQty.textContent = `${user.followQty > 0 ? user.followQty : 0} 位追蹤者`;
        console.log(model.memberData)
        console.log(model.memberData.followQty)
        memeberDescription.textContent = !user.description ? `大家好，我是${user.username}` : user.description;
    },
    renderMemberArticles:function(){
        // 會員資訊

        // 會員文章列表

        
        let frag = document.createDocumentFragment();
        let memberPost = document.querySelector('.member-post');

       
         // <li>
        //     <img src="https://aru0828practicebucket.s3.ap-northeast-2.amazonaws.com/48620200979d2e6e7e5e69458b7e3fea" alt="">
        //     <a href="/article/12">
        //         <div class="hover-effect">
        //             <p class="bi bi-heart-fill">
        //                 <span>16</span>
        //             </p>
        //             <p class="bi bi-chat-fill">
        //                 <span>22</span>
        //             </p>
        //         </div>
        //     </a>
        // </li>

        console.log(model.memberData);
        if(model.memberData.articles.length < 1){
            let noPost = document.querySelector('.no-post')
            noPost.textContent = '尚未發布收藏~'
        }
        else{
            model.memberData.articles.forEach(item => {

                let postLi = document.createElement('li');
                let postLink  = document.createElement('a');
                let postImg = document.createElement('img');
                let hoverEffect = document.createElement('div');
                let heartFill = document.createElement('p');
                let chatFill  = document.createElement('p');
                
                let heartQty = document.createElement('span');
                heartQty.textContent = item.likeQty;
                let chatQty = document.createElement('span');
                chatQty.textContent = item.commentQty;

                
                heartFill.classList.add('bi', 'bi-heart-fill');
                heartFill.appendChild(heartQty);
                chatFill.classList.add('bi', 'bi-chat-fill');
                chatFill.appendChild(chatQty);
                hoverEffect.classList.add('hover-effect');
                hoverEffect.appendChild(heartFill);
                hoverEffect.appendChild(chatFill);

                postLink.setAttribute('href', `/article/${item.article_id}`);
                postImg.setAttribute('src', item.coverPhoto);
                postLink.appendChild(postImg);

                postLi.appendChild(postImg);

                postLink.appendChild(hoverEffect);
                postLi.appendChild(postLink);
                frag.appendChild(postLi);
            })
            memberPost.appendChild(frag);
        }
    



        // 會員文章列表
    },

    renderFollowBtn:function(){
        let followBtn = document.querySelector('.follow-btn');
        
        // 如果在自己的會員頁 不顯示追蹤按鈕
        if(model.userData.user_id === parseInt(memberId)){
            followBtn.remove();
        }
        
        if(model.isFollowed){
            followBtn.classList.add('isFollowing');
            followBtn.textContent = '追蹤中';
        }else{
            followBtn.classList.remove('isFollowing');
            followBtn.textContent = '追蹤';
        }

        // <a href="" class="follow-btn">追蹤</a>
    }
}

let controller = {
    init:async function (){
        await model.getUserData();
        await model.getPageData();
        view.renderMemberInfo();
        view.renderMemberArticles();
        controller.getFollowData();
    },

    getFollowData:async function(){
        await model.getPageData();
        await model.getFollowData();
        view.renderMemberInfo();
        view.renderFollowBtn();
    },

    followMember:async function(){
        await model.followMember();
        controller.getFollowData();
    }
}

controller.init();