const reveals = document.querySelectorAll('.reveal');

function revealOnScroll()
{
    const triggerBottom = window.innerHeight * 0.85;
    
    reveals.forEach(el =>
    {
        const boxTop = el.getBoundingClientRect().top;

        if (boxTop < triggerBottom)
        {
            el.classList.add('active');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);
revealOnScroll();

// === Highlights rotation ===
document.addEventListener('DOMContentLoaded', function() {
    const stack = document.querySelector('.highlight-stack');
    if (!stack) return;

    const card1 = stack.querySelector('.highlight-card.pos-1');
    const card2 = stack.querySelector('.highlight-card.pos-2');
    const card3 = stack.querySelector('.highlight-card.pos-3');

    if (!card1 || !card2 || !card3) return;

    const img1 = card1.querySelector('img');
    const img2 = card2.querySelector('img');
    const img3 = card3.querySelector('img');

    const cardInfo = card2.querySelector('.card-info');
    const cardInfoTitle = cardInfo.querySelector('h3');
    const cardInfoDesc = cardInfo.querySelector('p');
    const cardInfoLink = cardInfo.querySelector('.btn-highlight');
    const progressFill = card2.querySelector('.progress-fill');

    if (!img1 || !img2 || !img3 || !cardInfo || !progressFill) return;

    const projects = [
        {
            name: 'Journey Of Johan',
            desc: 'Przygodowa gra z unikalną mechaniką i wciągającą fabułą.',
            img: './assets/projects/Journey-Of-Johan/image.png',
            link: '#'
        },
        {
            name: 'Slay The Nightmares',
            desc: 'Dynamiczna akcja i mroczny klimat. Walcz z koszmarami w rytmie arcade.',
            img: './assets/projects/Slay-The-Nightmares/image.png',
            link: '#'
        },
        {
            name: 'Beans & Rats',
            desc: 'Eksperymentalna gra z humorem i zaskakującą mechaniką kooperacji.',
            img: './assets/projects/Beans-&-Rats/image.png',
            link: '#'
        }
    ];

    let positions = [0, 1, 2];
    let isRotating = false;

    function updateMiddleCard() {
        const idx = positions[1];
        const project = projects[idx];
        cardInfoTitle.textContent = project.name;
        cardInfoDesc.textContent = project.desc;
        cardInfoLink.href = project.link;
    }

    function restartProgress() {
        progressFill.style.animation = 'none';
        void progressFill.offsetWidth;
        progressFill.style.animation = 'progressSlide 5s linear';
    }

    function rotateRight() {
        if (isRotating) return;
        isRotating = true;

        // Start transition
        card2.classList.add('transitioning');
        cardInfo.classList.add('transitioning');

        setTimeout(() => {
            // Swap images
            const tempSrc = img3.src;
            const tempAlt = img3.alt;
            
            img3.src = img2.src;
            img3.alt = img2.alt;
            img2.src = img1.src;
            img2.alt = img1.alt;
            img1.src = tempSrc;
            img1.alt = tempAlt;

            // Update positions
            const temp = positions[2];
            positions[2] = positions[1];
            positions[1] = positions[0];
            positions[0] = temp;

            updateMiddleCard();

            // End transition
            setTimeout(() => {
                card2.classList.remove('transitioning');
                cardInfo.classList.remove('transitioning');
                restartProgress();
                isRotating = false;
            }, 50);
        }, 600);
    }

    function rotateLeft() {
        if (isRotating) return;
        isRotating = true;

        card2.classList.add('transitioning');
        cardInfo.classList.add('transitioning');

        setTimeout(() => {
            const tempSrc = img1.src;
            const tempAlt = img1.alt;
            
            img1.src = img2.src;
            img1.alt = img2.alt;
            img2.src = img3.src;
            img2.alt = img3.alt;
            img3.src = tempSrc;
            img3.alt = tempAlt;

            const temp = positions[0];
            positions[0] = positions[1];
            positions[1] = positions[2];
            positions[2] = temp;

            updateMiddleCard();

            setTimeout(() => {
                card2.classList.remove('transitioning');
                cardInfo.classList.remove('transitioning');
                restartProgress();
                isRotating = false;
            }, 50);
        }, 600);
    }

    card1.addEventListener('click', rotateLeft);
    card3.addEventListener('click', rotateRight);
    progressFill.addEventListener('animationend', rotateRight);

    updateMiddleCard();
    restartProgress();
});