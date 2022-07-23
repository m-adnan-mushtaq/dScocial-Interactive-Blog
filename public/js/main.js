let searchTogglerBtn = document.getElementById('searchTogglerBtn')
searchTogglerBtn.addEventListener('click', () => {
    document.querySelector('.wrapper').classList.add('show')
})
closeWrapperBtn.addEventListener('click', () => {

    document.querySelector('.wrapper').classList.remove('show')
})

// hide the loader
window.addEventListener('DOMContentLoaded', () => {
    loader.style.display = 'none'
})


// drop down handler
if (document.querySelector('#toggle_menu')) {
    document.querySelector('#toggle_menu').addEventListener('click',()=>{
        document.querySelector('.dropdown-account-menu').classList.toggle('active')
    })
}

// functin for getting how much time taken by person to read a post


