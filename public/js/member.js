

let pathParams = window.location.pathname.split("/");
userid = pathParams[pathParams.length-1];



let model = {
    data :null,
    getPageData:function(){
        return fetch(`/api/member/${userid}`)
        .then(response => response.json())
        .then(result => {
            model.data = result;
        })
    }
}

let view = {
    renderMemberPage:function(){
        console.log(model.data);

       
        // 會員資訊
        let user = model.data.data.user;
        let avatar = document.querySelector('.member-summary img');
        let postQty = document.querySelector('.post-qty');
        let followerQty = document.querySelector('.follower-qty');
        let memeberDescription = document.querySelector('.member-description')


        avatar.setAttribute('src', !user.avatar ?  '../public/images/default-user-icon.jpg' : user.avatar)
        postQty.textContent = `${user.postNum > 0 ? user.postNum : 0} 個收藏`;
        followerQty.textContent = `22 位追蹤者`;
        console.log(user.description)
        memeberDescription.textContent = !user.description ? `大家好，我是${user.username}` : user.description;
        // 會員資訊

        // 會員文章列表

        
        let frag = document.createDocumentFragment();
        let memberPost = document.querySelector('.member-post');

        console.log('會員文章', model.data.data.articles);
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


        if(!model.data.data.articles){
            let noPost = document.querySelector('.no-post')
            alert('尚未發布收藏');
            noPost.textContent = '尚未發布收藏~'
        }
        else{
            model.data.data.articles.forEach(item => {

                let postLi = document.createElement('li');
                let postLink  = document.createElement('a');
                let postImg = document.createElement('img');
                let hoverEffect = document.createElement('div');
                let heartFill = document.createElement('p');
                let chatFill  = document.createElement('p');
                
                let heartQty = document.createElement('span');
                heartQty.textContent = '22';
                let chatQty = document.createElement('span');
                chatQty.textContent = '18';

                console.log(heartQty, chatQty);
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
    }
}

let controller = {
    init:async function (){
        await model.getPageData();
        view.renderMemberPage();
    }
}

controller.init();