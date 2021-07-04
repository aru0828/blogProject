
let content = document.querySelector('.article-content');
let title = document.querySelector('.article-title');
let likeIcon = document.querySelector('.likeIcon'); 
let authorName = document.querySelector('.author-info .name');
let authorAvatar = document.querySelector('.author-info .avatar');
let publishTime = document.querySelector('.author-info .date');

// let queryString = window.location.search
let queryString = new URLSearchParams(window.location.search)
let articleId = queryString.get("articleid")

fetch(`/api/article?articleid=${articleId}`)
.then(response =>response.json())
.then(result => {''
    let dateArray = result.data.article.create_time.split(/[T|\.|\:]/)
    console.log(result)
    if(result.ok){
        let article = result.data.article;
        title.innerHTML   = article.title;
        content.innerHTML = article.content;
        authorName.textContent = result.data.author.username;
        // authorAvatar.setAttribute('src', article.avatar);
        publishTime.textContent = `${dateArray[0]} ${parseInt(dateArray[1])+8}:${dateArray[2]}`;
    }
    
})



likeIcon.addEventListener('click', function(e){
    let requestBody = {
        'userId':1,
        'articleId':articleId,
    }
    fetch('/api/like',{
        method:'POST',
        body: JSON.stringify(requestBody),
        headers:{
            'content-type':'application/json'
        }
    })
    .then(response = response.json())
    .then(result => {
        console.log(result)
    })
})
