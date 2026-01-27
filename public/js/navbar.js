(() => {
    const initNavbar = () => {
        const navBtn = document.getElementById('navBtn');
        const navLinks = document.getElementById('navLinks');

        if (!navBtn || !navLinks) {
            console.warn('Navbar elements not found, retrying...');
            setTimeout(initNavbar, 100);
            return;
        }

        // Set active link based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const currentHash = window.location.hash;
        
        navLinks.querySelectorAll('a').forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            
            // Check if link matches current page
            if (linkHref.includes('projects.html') && currentPage.includes('projects.html')) {
                link.classList.add('active');
            } else if (linkHref.includes('index.html') || linkHref === '#home') {
                // For index.html links, check hash or default to home
                if (currentPage === 'index.html' || currentPage === '') {
                    if (currentHash && linkHref.includes(currentHash)) {
                        link.classList.add('active');
                    } else if (!currentHash && (linkHref.includes('#home') || linkHref === 'index.html#home')) {
                        link.classList.add('active');
                    }
                }
            }
        });

        // Toggle mobile menu
        navBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle('open');
            navBtn.setAttribute('aria-expanded', isOpen);
        });

        // Close menu when a link is clicked and set active state
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                // Remove active class from all links
                navLinks.querySelectorAll('a').forEach(l => l.classList.remove('active'));
                // Add active class to clicked link
                link.classList.add('active');
                
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
