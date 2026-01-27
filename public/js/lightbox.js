(() => {
    const galleryLinks = document.querySelectorAll('[data-lightbox]');
    
    if (galleryLinks.length === 0) return;

    // Create lightbox element
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
        <img src="" alt="" />
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    const openLightbox = (src, alt) => {
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset animation by removing and re-adding
        setTimeout(() => {
            lightboxImg.src = '';
        }, 300);
    };

    // Add click handlers to gallery images
    galleryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const img = link.querySelector('img');
            const src = link.href;
            const alt = img.alt;
            openLightbox(src, alt);
        });
    });

    // Close lightbox on click outside image or close button
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
    });

    lightbox.addEventListener('click', closeLightbox);

    // Prevent closing when clicking on image
    lightboxImg.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
})();
