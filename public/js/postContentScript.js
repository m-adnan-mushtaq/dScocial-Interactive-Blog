
// select all content posts and show only inner text instead of inner html
let contentList=document.querySelectorAll('.post-content-wrapper')
contentList.forEach(content=>{
    content.innerHTML=content.innerText
    if (content.classList.contains('further-substr')) {
        content.innerHTML=content.textContent.substring(0,40)+'...'
        
    }
    else{
        content.innerHTML=content.textContent.substring(0,80)+'...'

    }
})
