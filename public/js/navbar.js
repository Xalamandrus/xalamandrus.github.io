(() => {
    const initNavbar = () => {
        const navBtn = document.getElementById('navBtn');
        const navLinks = document.getElementById('navLinks');

        if (!navBtn || !navLinks) {
            console.warn('Navbar elements not found, retrying...');
            setTimeout(initNavbar, 100);
            return;
        }

        // Toggle mobile menu
        navBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle('open');
            navBtn.setAttribute('aria-expanded', isOpen);
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navBtn.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navBtn.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('open');
                navBtn.setAttribute('aria-expanded', 'false');
            }
        });
    };

    // Czekaj aż DOM będzie gotowy i wstrzykiwania się zakończą
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        // Dodatkowe opóźnienie na wypadek asynchronicznego wstrzykiwania
        setTimeout(initNavbar, 50);
    }
})();
