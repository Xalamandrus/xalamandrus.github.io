// Intersection Observer for reveal animations
const initRevealAnimations = () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    let observer = null;
    
    if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
    }
    
    const observeElements = () => {
        const reveals = document.querySelectorAll('.reveal, .fade-in-footer');
        reveals.forEach(el => {
            if (!el.classList.contains('active')) {
                if (observer) {
                    observer.observe(el);
                }
            }
        });
    };
    
    if ('IntersectionObserver' in window) {
        // Observe elements on initial load
        observeElements();
        
        // Watch for dynamically added elements (like injected footer)
        const mutationObserver = new MutationObserver(() => {
            observeElements();
        });
        
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        // Fallback for older browsers
        function revealOnScroll() {
            const triggerBottom = window.innerHeight * 0.85;
            const reveals = document.querySelectorAll('.reveal, .fade-in-footer');
            
            reveals.forEach(el => {
                const boxTop = el.getBoundingClientRect().top;

                if (boxTop < triggerBottom) {
                    el.classList.add('active');
                }
            });
        }

        window.addEventListener('scroll', revealOnScroll);
        revealOnScroll();
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRevealAnimations);
} else {
    initRevealAnimations();
}
