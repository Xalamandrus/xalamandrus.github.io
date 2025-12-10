// Blur tła + Render projektów z projects.json
(function() {
    const projectsUrl = 'assets/data/projects.json';
    const fadeDuration = 200; // ms; sparowane z CSS transition w body::before
    let fadeTimeout;

    // ====== BLUR TŁA ======
    const showBackground = (bg) => {
        clearTimeout(fadeTimeout);
        document.body.classList.remove('projects-bg-active');
        fadeTimeout = setTimeout(() => {
            document.body.style.setProperty('--project-bg-image', `url("${bg}")`);
            document.body.classList.add('projects-bg-active');
        }, fadeDuration);
    };

    const hideBackground = () => {
        clearTimeout(fadeTimeout);
        document.body.classList.remove('projects-bg-active');
    };

    const attachBackgroundListeners = () => {
        document.querySelectorAll('.project-card[data-bg]').forEach(card => {
            const bg = card.dataset.bg;
            if (!bg) return;

            // Usuń poprzednie listenery aby unikać duplikatów
            card.removeEventListener('mouseenter', mouseenterHandler);
            card.removeEventListener('mouseleave', mouseleaveHandler);
            card.removeEventListener('focusin', focusinHandler);
            card.removeEventListener('focusout', focusoutHandler);

            // Dodaj nowe listenery
            card.addEventListener('mouseenter', mouseenterHandler);
            card.addEventListener('mouseleave', mouseleaveHandler);
            card.addEventListener('focusin', focusinHandler);
            card.addEventListener('focusout', focusoutHandler);
        });
    };

    const mouseenterHandler = function() {
        const bg = this.dataset.bg;
        // Konwertuj ścieżkę na relative od CSS folderu (public/css/)
        const bgPath = bg.replace('assets/', '../assets/');
        if (bg) showBackground(bgPath);
    };

    const mouseleaveHandler = () => hideBackground();
    const focusinHandler = function() {
        const bg = this.dataset.bg;
        // Konwertuj ścieżkę na relative od CSS folderu (public/css/)
        const bgPath = bg.replace('assets/', '../assets/');
        if (bg) showBackground(bgPath);
    };
    const focusoutHandler = () => hideBackground();

    // ====== RENDER Z JSON ======
    const parseDate = (dateStr) => {
        const months = {
            'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
            'July': 6, 'Juli': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
        };
        const [monthStr, year] = dateStr.split(' ');
        const month = months[monthStr] ?? 0;
        return new Date(year, month);
    };

    const sortByDate = (projects) => {
        return projects.sort((a, b) => parseDate(b.date) - parseDate(a.date));
    };

    const createCard = (project, isCompact) => {
        const imageSrc = project.images?.[0] || 'assets/projects/default.png';
        const cardClass = isCompact ? 'project-card--compact' : 'project-card--featured';
        const metaText = project.type || 'PROJECT';
        
        const tagsHtml = (project.technologies || [])
            .map(tech => `<span class="tag" role="listitem">${tech}</span>`)
            .join('');

        return `
            <article class="project-card ${cardClass}" data-bg="${imageSrc}">
                <div class="project-media">
                    <img src="${imageSrc}" alt="${project.title} preview">
                </div>
                <div class="project-layer">
                    <div class="project-body">
                        <p class="project-meta">${metaText}</p>
                        <h3 class="project-title">${project.title}</h3>
                        ${project.description ? `<p class="project-description">${project.description}</p>` : ''}
                    </div>
                    <div class="project-footer">
                        ${tagsHtml ? `<div class="tags" role="list">${tagsHtml}</div>` : ''}
                        <a href="#" class="project-link">View project &nearrow;</a>
                    </div>
                </div>
            </article>
        `;
    };

    const renderProjects = async () => {
        try {
            const response = await fetch(projectsUrl);
            const projects = await response.json();

            // Filtruj featured i non-featured
            const featured = projects.filter(p => p.featured === true);
            const nonFeatured = projects.filter(p => p.featured !== true);

            // Sortuj po dacie (najnowsze pierwsze)
            const featuredSorted = sortByDate(featured);
            const allProjectsSorted = sortByDate(nonFeatured);

            // Renderuj Featured section
            const featuredContainer = document.querySelector('.projects-featured-list');
            if (featuredContainer) {
                featuredContainer.innerHTML = featuredSorted
                    .map(project => createCard(project, false))
                    .join('');
            }

            // Renderuj All Projects grid
            const gridContainer = document.querySelector('.projects-grid');
            if (gridContainer) {
                gridContainer.innerHTML = allProjectsSorted
                    .map(project => createCard(project, true))
                    .join('');
            }

            // Załącz listenery do wszystkich kart
            attachBackgroundListeners();

        } catch (error) {
            console.error('Error loading projects:', error);
        }
    };

    // Start: Renderuj projekty gdy DOM jest gotowy
    document.addEventListener('DOMContentLoaded', renderProjects);
})();
