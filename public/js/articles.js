import { checkUser } from './checkUser.js';
import { loading } from './loading.js';
import { sweetAlert } from './sweetAlert.js';

let rectObject = document.querySelector('body').getBoundingClientRect();

let body = document.querySelector('body');

window.addEventListener('scroll', function () {
    if ((window.screen.height + window.pageYOffset) + 1 > body.clientHeight) {

        if (model.getPage !== null && model.apiDone) {
            controller.getMainList();
        }
    }
})

let toggleShow = document.querySelectorAll('.toggleShow li a');
toggleShow.forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        let display = e.target.dataset.display;
        if (!display) {
            window.location.href = `${window.location.pathname}`
        }
        else {
            window.location.href = `${window.location.pathname}?display=${display}`
        }

    })

})


let model = {
    userData: {},
    mainListData: [],
    asideListData: [],
    tags: [],
    getPage: 0,
    apiDone: true,

    getUserData: function () {
        return checkUser().then(result => {
            if (result.message === '登入中') {
                model.userData = result.data;
            }
            else {
                let displayFollowingBtn = document.querySelector('.displayFollowingBtn');

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
            return fetch(`/api/articles?keyword=${keyword}&page=${model.getPage}`)
                .then(response => response.json())
                .then(result => {

                    if (result.ok) {
                        model.mainListData = result.data.articles;
                        model.getPage = result.data.nextPage;
                    }

                    // view.renderMainList();
                    // view.renderTags();
                })
        }
        else if (display) {
            return fetch(`/api/articles?display=${display}&page=${model.getPage}`)
                .then(response => response.json())
                .then(result => {
                    if (result.ok) {
                        model.mainListData = result.data.articles;
                        model.getPage = result.data.nextPage;
                    }

                })
        }
        else if (tag) {
            return fetch(`/api/articles?tag=${tag}&page=${model.getPage}`)
                .then(response => response.json())
                .then(result => {

                    if (result.ok) {
                        model.mainListData = result.data.articles;
                        model.getPage = result.data.nextPage;
                    }
                })
        }
        else {

            return fetch(`/api/articles?page=${model.getPage}`)
                .then(response => response.json())
                .then(result => {

                    if (result.ok) {
                        model.mainListData = result.data.articles;
                        model.getPage = result.data.nextPage;
                    }

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

    likeEvent: function (artId) {
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


    renderAsideList: function () {

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
    },

    renderMainList: function () {
        let frag = document.createDocumentFragment();
        let mainList = document.querySelector('.main-list');

        // mainList.innerHTML = "";
        if (model.mainListData.length === 0) {
            let li = document.createElement('li');
            let h3 = document.createElement('h3');

            h3.textContent = '沒有符合的文章~ 試試其他搜尋吧'
            h3.classList.add('not-found')
            li.appendChild(h3);
            mainList.appendChild(li);
            return;
        }
        else {
            model.mainListData.forEach((item) => {
                let li = document.createElement('li');
                let coverPhotoLink = document.createElement('a');
                let coverPhoto = document.createElement('img');
                let summary = document.createElement('div');
                let author = document.createElement('a');
                let avatar = document.createElement('img');
                let username = document.createElement('h3');
                let createTime = document.createElement('span');
                let titleLink = document.createElement('a');
                let title = document.createElement('h3');
                let price = document.createElement('p');
                let content = document.createElement('p');
                let features = document.createElement('div');
                let heartIcon = document.createElement('i');
                let likeQty = document.createElement('span');
                let commentQty = document.createElement('span');
                let messageIcon = document.createElement('a');
                let date = document.createElement('p');


                coverPhotoLink.classList.add('coverPhotoLink');
                coverPhoto.classList.add('coverPhoto')
                coverPhoto.setAttribute('src', item.coverPhoto);
                coverPhotoLink.appendChild(coverPhoto);

                summary.classList.add('summary');
                author.classList.add('author');
                author.setAttribute('href', `/member/${item.author.user_id}`);
                // author.textContent = item.article.user_id;

                // 如果使用者沒有avatar就使用預設照片
                avatar.setAttribute('src', item.author.avatar ? item.author.avatar : '../public/images/default-user-icon.jpg');

                username.textContent = item.author.username;
                let dateArray = item.create_time.split(/[T|\.|\:]/)
                createTime.textContent = `${dateArray[0]} ${parseInt(dateArray[1])}:${dateArray[2]}`
                author.appendChild(avatar);
                author.appendChild(username);
                author.appendChild(createTime);

                title.classList.add('title');
                title.textContent = item.title;
                titleLink.appendChild(title);
                titleLink.setAttribute('href', `/article/${item.article_id}`);
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
                    controller.likeEvent(e.target.dataset.artid);
                })

                features.appendChild(heartIcon);
                features.appendChild(messageIcon);
                features.appendChild(date);

                summary.appendChild(author);
                summary.appendChild(titleLink);
                summary.appendChild(price);
                summary.appendChild(content);
                summary.appendChild(features);

                coverPhotoLink.setAttribute('href', `/article/${item.article_id}`);
                // a.appendChild(summary);
                li.appendChild(coverPhotoLink);
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


        if (display === null) {
            let newest = document.querySelector('.newest');
            newest.classList.add('active');
        }
        else if (display === 'hot') {
            let hot = document.querySelector('.hot');
            hot.classList.add('active');
        }
        else if (display === 'following') {
            // 避免沒有登入的情況下直接輸入網址導致錯誤
            if (model.userData.hasOwnProperty('user_id')) {
                let following = document.querySelector('.following');
                following.classList.add('active');
            }
            else {
                window.location.href = '/articles';
            }
        }

        let tags = document.querySelector('.tags');


        model.tags.forEach(item => {
            let li = document.createElement('li');
            let a = document.createElement('a');
            a.classList.add('tag');
            if (item.tag_id === parseInt(tag)) {
                a.classList.add('active');
            }
            a.setAttribute('data-tag', item.tag_id);

            a.textContent = item.tag;

            li.appendChild(a);
            tags.appendChild(li);

            a.addEventListener('click', function (e) {
                let tagId = e.target.dataset.tag;
                window.location.href = `/articles?tag=${tagId}`;
            })
        })
    },

    rerenderArticleLikes: function (likeData) {
        if (likeData.length > 0) {
            let likeDom = document.querySelector(`.features [data-artid= '${likeData[0].article_id}']`);
            let likeQty = document.querySelector(`.features [data-artid= '${likeData[0].article_id}'] span`);
            likeQty.textContent = likeData[0].likeQty;
            if (likeData[0].user_is_liked === 'yes') {
                likeDom.classList.remove('bi-heart');
                likeDom.classList.add('bi-heart-fill');
            }
            else {
                likeDom.classList.remove('bi-heart-fill');
                likeDom.classList.add('bi-heart');
            }
        }
    }
}


let controller = {
    init: async function () {

        loading.toggleLoading();

        await model.getUserData();

        await model.getMainListData();
        view.renderMainList();

        await model.getAsideListData();
        view.renderAsideList();

        await model.getTags();
        view.renderTags();


        loading.toggleLoading();

    },

    // 拿掉
    getMainList: async function () {

        model.apiDone = false;
        loading.toggleLoading_S();
        await model.getMainListData();
        view.renderMainList();
        loading.toggleLoading_S();
        model.apiDone = true;

    },

    getAsideList: async function () {
        await model.getAsideListData();
        view.renderAsideList();
    },

    getTags: async function () {
        await model.getTags();
        view.renderTags();
    },

    likeEvent: async function (artId) {
        let likeResult = await model.likeEvent(artId);



        if (likeResult.ok) {
            fetch(`/api/like?articleid=${artId}`)
                .then(response => response.json())
                .then(result => {
                    if (result.ok) {
                        view.rerenderArticleLikes(result.data)
                    }
                })
        }
        else {
            sweetAlert.alert('error', likeResult.message);

        }

    },

}

controller.init()