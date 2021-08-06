// const { text } = require("express");
import { checkUser } from './checkUser.js';
import { sweetAlert } from './sweetAlert.js';
import { loading } from './loading.js';



let cancelCurrentCommentId = document.querySelector('.cancel-currentCommentId');
let prevCurrentCommentId = document.querySelector('.prev-currentCommentId');
prevCurrentCommentId.addEventListener('click', function () {
    controller.prevSubComment();
})
cancelCurrentCommentId.addEventListener('click', function () {
    controller.cancelSubCommentMode();
})

let threeDots = document.querySelector('.bi-three-dots');
let authorFeatureCollapase = document.querySelector('.author-feature-collapase');

threeDots.addEventListener('click', function (e) {
    e.preventDefault();
    authorFeatureCollapase.classList.toggle('active');
})


let likeIcon = document.querySelector('.likeIcon');


// path params articleid
let pathParams = window.location.pathname.split("/");
let articleId = pathParams[pathParams.length - 1];
// let queryString = new URLSearchParams(window.location.search)
// let articleId = queryString.get("articleid")

//作者進行編輯or刪除
let authorDel = document.querySelector('.author-feature-del');
let authorEdit = document.querySelector('.author-feature-edit');


authorDel.addEventListener('click', function () {
    sweetAlert.confirmAlert('warning', '確定要刪除文章嗎?').then(result => {
        if (result.isConfirmed) {
            controller.delArticle();
        }
    });

})

authorEdit.addEventListener('click', function (e) {
    e.preventDefault();

    window.location.href = `/post/edit/${articleId}`;
})


let sendCommentBtn = document.querySelector('.sendComment')

sendCommentBtn.addEventListener('click', async function (e) {
    e.preventDefault();
    let commentContent = document.querySelector('#comment').value;
    controller.submitComment(articleId, commentContent);
})






likeIcon.addEventListener('click', function (e) {
    controller.likeEvent();
})




let model = {
    userData: {},
    article: {},
    comments: [],
    //新增完記得設為null
    commentLevels: [],

    checkUser: async function () {
        let result = await checkUser();
        if (result.message === '登入中') {
            model.userData = result.data;
        }
    },

    getArticleData: function () {
        return fetch(`/api/article/${articleId}`)
            .then(response => response.json())
            .then(result => {
                if (result.error) {
                    window.location.href = "/articles"
                }
                model.article = result.data.article;
            })
    },
    getLevelOneComments: function () {
        // fetch 第一層留言
        return fetch(`/api/comments/${articleId}`)
            .then(response => response.json())
            .then(result => {
                model.comments = result.data;
            })
    },

    getSubComments: function () {
        return fetch(`/api/childcomments/${model.commentLevels[model.commentLevels.length - 1]}`)
            .then(response => response.json())
            .then(result => {
                model.comments = result.data;
            })
    },

    submitComment: function (artId, comment, parent = null) {
        if (model.userData === {}) {
            sweetAlert.alert('error', '登入後才能使用留言功能~')
            // alert('登入後才能使用留言功能~');
            return;
        }
        else if (!comment) {
            sweetAlert.alert('warning', '請輸入訊息~')
            return;
        }
        let requsetData = {
            'article_id': artId,
            'comment': comment,
            'parent': parent,
        }
        return fetch('/api/comment', {
            'method': 'POST',
            'body': JSON.stringify(requsetData),
            'headers': {
                'content-type': 'application/json'
            }
        })
            .then(response => response.json())
    },



    likeEvent: function () {
        let requestBody = {
            // 改由後端利用session取得userid
            // 'userId':1,
            'article_id': articleId,
        }

        return fetch('/api/like', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'content-type': 'application/json'
            }
        })
            .then(response => response.json())

    },


    likeCommentEvent: function (commentId) {
        let requestBody = {
            // 改由後端利用session取得userid
            // 'userId':1,
            'comment_id': commentId,
        }

        return fetch('/api/commentlike', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'content-type': 'application/json'
            }
        })
            .then(response => response.json())

    },

    delArticle: function () {
        return fetch('/api/article', {
            'method': 'DELETE',
            'body': JSON.stringify({ 'article_id': articleId }),
            'headers': {
                'content-type': 'application/json'
            }
        })
            .then(response => response.json())

    }

}

let view = {

    renderArticle: function () {
        let article = model.article;

        if (model.userData.user_id !== article.author.user_id) {
            threeDots.remove();
        }

        let authorLink = document.querySelector('.author');
        authorLink.setAttribute('href', `/member/${article.author.user_id}`);

        let authorImg = document.querySelector('.author img');
        authorImg.setAttribute('src', article.author.avatar ? article.author.avatar : '../public/images/default-user-icon.jpg');
        let authorName = document.querySelector('.author h3');
        authorName.textContent = article.author.username;

        let articleTags = document.querySelector('.article-tags');
        if (!article.tags.length) {
            articleTags.classList.add('hidden');
        }
        article.tags.forEach(tagObj => {
            let tagDom = document.createElement('a');
            tagDom.setAttribute('href', `/articles?tag=${tagObj.tag_id}`);
            tagDom.classList.add('article-tag');
            tagDom.textContent = tagObj.tag;

            articleTags.appendChild(tagDom);
        })
        // articleTitle.textContent = article.title;

        let articleTitle = document.querySelector('.article-title');
        articleTitle.textContent = article.title;

        let articleSummary = document.querySelector('.article-summary');
        articleSummary.textContent = article.summary;

        let articlPirce = document.querySelector('.article-price');
        articlPirce.textContent = `入手價格:${article.price ? article.price : ' 不公開'}`;

        let coverPhotoImg = document.querySelector('.article-coverPhoto img');
        coverPhotoImg.setAttribute('src', article.coverPhoto);


        let articleContent = document.querySelector('.article-content');
        articleContent.innerHTML = article.content;

        let dateArray = article.create_time.split(/[T|\.|\:]/);
        let articleTime = document.querySelector('.article-create-time');
        articleTime.textContent = `${dateArray[0]} ${parseInt(dateArray[1])}:${dateArray[2]}`


    },

    renderArticleFeatrues: function () {
        let heartIcon = document.querySelector('.likeIcon');

        if (model.article.user_is_liked === 'yes') {
            heartIcon.classList.remove('bi-heart');
            heartIcon.classList.add('bi-heart-fill');
        }
        else {
            heartIcon.classList.remove('bi-heart-fill');
            heartIcon.classList.add('bi-heart');
        }

        let articleLikeQty = document.querySelector('.articleLikeQty');
        articleLikeQty.textContent = model.article.likeQty;
    },
    renderComments: function () {

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
            commentAuthorImg.setAttribute('src', comment.avatar ? comment.avatar : `/public/images/default-user-icon.jpg`);
            authorImgLink.appendChild(commentAuthorImg);

            let commentContent = document.createElement('div');
            commentContent.classList.add('comment-content');
            commentContent.innerHTML = `<a href="/member/${comment.user_id}">${comment.username}</a>  ${comment.comment}`;

            let commentInfo = document.createElement('div');
            commentInfo.classList.add('comment-info');
            let time = document.createElement('p');
            let date = comment.create_time.split('T');
            time.textContent = date[0];





            let commentBtn = document.createElement('a');
            commentBtn.textContent = `回覆`;
            commentBtn.setAttribute('data-commentid', comment.comment_id);
            commentBtn.addEventListener('click', function (e) {
                e.preventDefault();
                let commentId = e.target.dataset.commentid;
                controller.subCommentMode(commentId)
            })

            if (comment.likeQty) {
                let likeQty = document.createElement('p');
                likeQty.textContent = `${comment.likeQty} 個讚`;
                commentInfo.appendChild(likeQty);
            }
            commentInfo.appendChild(commentBtn);
            commentInfo.appendChild(time);
            commentContent.appendChild(commentInfo);


            //  顯示留言底下還有幾則第一層留言,回覆留言情況下取得的第一筆資料為parent不顯示訊息
            if (comment.commentQty > 0 && (index !== 0 || model.commentLevels.length === 0)) {
                let viewSubComment = document.createElement('a');
                let viewSubCommentIcon = document.createElement('i');
                let viewSubCommentQty = document.createElement('span');
                viewSubComment.classList.add('view-sub-comment');
                viewSubCommentQty.textContent = `${comment.commentQty}則留言`;
                viewSubCommentIcon.classList.add('fas', 'fa-level-down-alt');

                viewSubComment.setAttribute('data-commentid', comment.comment_id);
                viewSubComment.addEventListener('click', function (e) {
                    e.preventDefault();

                    let commentId = e.currentTarget.dataset.commentid;
                    controller.subCommentMode(commentId)
                }, false)
                viewSubComment.appendChild(viewSubCommentIcon);
                viewSubComment.appendChild(viewSubCommentQty);
                commentContent.appendChild(viewSubComment);

            }


            let likeIcon = document.createElement('i');
            if (comment.user_is_liked) {
                likeIcon.classList.add('bi', 'bi-heart-fill');
            }
            else {
                likeIcon.classList.add('bi', 'bi-heart');
            }

            likeIcon.setAttribute('data-commentid', comment.comment_id);
            likeIcon.addEventListener('click', (e) => {
                let commentId = e.target.dataset.commentid;
                controller.likeCommentEvent(commentId);
            })

            commentLi.appendChild(authorImgLink);
            commentLi.appendChild(commentContent);
            commentLi.appendChild(likeIcon);

            // 回覆留言模式額外設定
            if (model.commentLevels.length && index !== 0) {
                commentLi.classList.add('sub-comment');
            }
            if (model.commentLevels.length && index === 0) {
                commentBtn.textContent = '';
            }

            frag.appendChild(commentLi);

        })
        comments.appendChild(frag);


    }
}


let controller = {
    init: async function () {
        // 取得文章及第一層留言了
        // 想辦法得到指定的第二層留言
        loading.toggleLoading();

        await model.checkUser();
        await model.getArticleData();

        view.renderArticle();
        view.renderArticleFeatrues();
        await model.getLevelOneComments();
        view.renderComments();

        let commentAuthorImg = document.querySelector('.user-avatar');
        if (model.userData) {
            commentAuthorImg.setAttribute('src', model.userData.avatar ? model.userData.avatar : '/public/images/default-user-icon.jpg');
        }
        else {
            commentAuthorImg.setAttribute('src', '/public/images/default-user-icon.jpg');
        }


        loading.toggleLoading();
    },

    submitComment: async function (artId, comment) {

        // 回覆留言
        if (model.commentLevels.length) {
            // 第三個參數為回覆的留言ID = 資料庫中的parent
            let result = await model.submitComment(artId, comment, model.commentLevels[model.commentLevels.length - 1])

            if (result.error) {
                sweetAlert.alert('error', result.message);
                return;
            }

            await model.getSubComments();
            view.renderComments();
        }
        // 回覆文章
        else {
            let result = await model.submitComment(artId, comment);
            if (result.error) {
                sweetAlert.alert('error', result.message);
                return;
            }
            await model.getLevelOneComments();
            view.renderComments();
        }


    },

    subCommentMode: async function (commentId) {
        model.commentLevels.push(commentId);
        await model.getSubComments();
        view.renderComments();
    },

    cancelSubCommentMode: async function () {
        model.commentLevels = [];
        await model.getLevelOneComments();
        view.renderComments();
    },
    prevSubComment: async function () {
        model.commentLevels.pop();
        if (!model.commentLevels.length) {
            await model.getLevelOneComments();
        }
        else {
            await model.getSubComments();
        }
        view.renderComments();
    },

    likeEvent: async function () {
        let likeResult = await model.likeEvent();
        await model.getArticleData();
        if (likeResult.error) {
            sweetAlert.alert('error', likeResult.message);
            return;
        }
        view.renderArticleFeatrues();
    },

    likeCommentEvent: async function (commentId) {
        let result = await model.likeCommentEvent(commentId);
        if (result.error) {
            sweetAlert.alert('error', '登入後才能使用會員功能');
            return;
        }

        if (!model.commentLevels.length) {
            await model.getLevelOneComments();
        }
        else {
            await model.getSubComments();
        }
        view.renderComments();

    },

    delArticle: async function () {
        let result = await model.delArticle();
        if (result.ok) {
            sweetAlert.alert('success', result.message).then(result => {
                if (result.isConfirmed) {
                    window.location.href = "/";
                }
            });
        }
    }

}

controller.init();

