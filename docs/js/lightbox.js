(() => {
    // Create lightbox element
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
        <button class="lightbox-nav lightbox-prev" aria-label="Previous image"></button>
        <button class="lightbox-nav lightbox-next" aria-label="Next image"></button>
        <img src="" alt="" />
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    let lightboxItems = [];
    let currentIndex = -1;

    const getItems = () => Array.from(document.querySelectorAll('[data-lightbox]'));

    const updateNavButtons = () => {
        const hasItems = lightboxItems.length > 0;
        const atStart = currentIndex <= 0;
        const atEnd = currentIndex >= lightboxItems.length - 1;
        prevBtn.disabled = !hasItems || atStart;
        nextBtn.disabled = !hasItems || atEnd;
        prevBtn.setAttribute('aria-disabled', prevBtn.disabled ? 'true' : 'false');
        nextBtn.setAttribute('aria-disabled', nextBtn.disabled ? 'true' : 'false');
    };

    const openLightbox = (src, alt, isSwap = false) => {
        if (isSwap) {
            lightboxImg.classList.remove('is-switching');
            // Force reflow to restart animation
            void lightboxImg.offsetWidth;
            lightboxImg.classList.add('is-switching');
        }
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateNavButtons();
    };

    const openByIndex = (index) => {
        lightboxItems = getItems();
        if (!lightboxItems.length) return;
        const clampedIndex = Math.max(0, Math.min(index, lightboxItems.length - 1));
        currentIndex = clampedIndex;
        const link = lightboxItems[currentIndex];
        const img = link.querySelector('img');
        const src = link.href;
        const alt = img ? img.alt : '';
        openLightbox(src, alt, true);
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        currentIndex = -1;
        lightboxItems = [];
        
        // Reset animation by removing and re-adding
        setTimeout(() => {
            lightboxImg.src = '';
        }, 300);
    };

    // Use event delegation to handle dynamically added gallery images
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-lightbox]');
        if (link) {
            e.preventDefault();
            lightboxItems = getItems();
            const index = lightboxItems.indexOf(link);
            if (index >= 0) {
                openByIndex(index);
            } else {
                const img = link.querySelector('img');
                const src = link.href;
                const alt = img ? img.alt : '';
                currentIndex = -1;
                openLightbox(src, alt);
            }
        }
    });

    // Close lightbox on click outside image or close button
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
    });

    lightbox.addEventListener('click', closeLightbox);

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentIndex > 0) {
            openByIndex(currentIndex - 1);
        }
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentIndex < lightboxItems.length - 1) {
            openByIndex(currentIndex + 1);
        }
    });

    // Prevent closing when clicking on image
    lightboxImg.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            openByIndex(currentIndex - 1);
        }
        if (e.key === 'ArrowRight' && currentIndex < lightboxItems.length - 1) {
            openByIndex(currentIndex + 1);
        }
    });
})();
