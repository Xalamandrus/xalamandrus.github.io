// Delay scroll to anchor until animations are loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if there's a hash in the URL
    if (window.location.hash) {
        const hash = window.location.hash;
        const element = document.querySelector(hash);
        
        if (element) {
            // Delay scroll to allow animations to load
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
});
