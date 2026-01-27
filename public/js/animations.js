const reveals = document.querySelectorAll('.reveal');

function revealOnScroll()
{
    const triggerBottom = window.innerHeight * 0.85;
    
    reveals.forEach(el => {
        const boxTop = el.getBoundingClientRect().top;

        if (boxTop < triggerBottom) {
            el.classList.add('active');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);
revealOnScroll();