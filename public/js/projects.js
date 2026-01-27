// Blur tła + Render projektów z projects.json
(function() {
    const projectsIndexUrl = 'assets/data/projects.json';
    const fadeDuration = 100; // ms; sparowane z CSS transition w body::before
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

    // ====== RENDER Z JSON (wielu plików) ======
    const fetchDateForSlug = async (slug) => {
        if (!slug) return null;
        try {
            const res = await fetch(`assets/projects/${slug}/date.txt`, { cache: 'no-store' });
            if (!res.ok) throw new Error(`Bad status ${res.status}`);
            const text = (await res.text()).trim();
            return text || null;
        } catch (err) {
            console.warn(`Date not found for slug '${slug}':`, err);
            return null;
        }
    };

    const fetchProjectDetails = async (indexItems) => {
        const tasks = (indexItems || []).map(async item => {
            if (!item?.dataPath) return null;
            try {
                const res = await fetch(item.dataPath);
                if (!res.ok) throw new Error(`Bad status ${res.status}`);
                const data = await res.json();
                const slug = data.slug || item.slug || '';
                const dateFromFile = await fetchDateForSlug(slug);
                return { ...data, slug, date: dateFromFile || data.date || '', dataPath: item.dataPath };
            } catch (err) {
                console.error(`Error loading project data from ${item?.dataPath}:`, err);
                return null;
            }
        });
        const results = await Promise.all(tasks);
        return results.filter(Boolean);
    };

    const parseDate = (dateStr) => {
        const months = {
            'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
            'July': 6, 'Juli': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
        };
        const [monthStr, year] = (dateStr || '').split(' ');
        const month = months[monthStr] ?? 0;
        return new Date(year || 0, month);
    };

    const sortByDate = (projects) => projects.sort((a, b) => parseDate(b.date) - parseDate(a.date));

    const createCard = (project, isCompact) => {
        const imageSrc = project.heroImage || 'assets/projects/default.png';
        const cardClass = isCompact ? 'project-card--compact' : 'project-card--featured';
        const metaText = project.type || 'PROJECT';
        const tagsHtml = (project.technologies || [])
            .map(tech => `<span class="tag" role="listitem">${tech}</span>`)
            .join('');
        const href = `view-project.html?slug=${encodeURIComponent(project.slug || '')}`;

        return `
            <a href="${href}" class="project-card ${cardClass}" data-bg="${imageSrc}" role="article">
                <div class="project-media">
                    <img src="${imageSrc}" alt="${project.title || 'Project'} preview">
                </div>
                <div class="project-layer">
                    <div class="project-body">
                        <p class="project-meta">${metaText}</p>
                        <h3 class="project-title">${project.title || ''}</h3>
                        ${project.description ? `<p class="project-description">${project.description}</p>` : ''}
                    </div>
                    <div class="project-footer">
                        ${tagsHtml ? `<div class="tags" role="list">${tagsHtml}</div>` : ''}
                    </div>
                </div>
            </a>
        `;
    };

    const renderProjects = async () => {
        try {
            const response = await fetch(projectsIndexUrl);
            const indexItems = await response.json();

            const projects = await fetchProjectDetails(indexItems);

            const featured = projects.filter(p => p.featured === true).slice(0, 3);
            const nonFeatured = projects.filter(p => p.featured !== true);

            const featuredSorted = sortByDate(featured);
            const allProjectsSorted = sortByDate(nonFeatured);

            const featuredContainer = document.querySelector('.projects-featured-list');
            if (featuredContainer) {
                featuredContainer.innerHTML = featuredSorted
                    .map(project => createCard(project, false))
                    .join('');
            }

            const gridContainer = document.querySelector('.projects-grid');
            if (gridContainer) {
                gridContainer.innerHTML = allProjectsSorted
                    .map(project => createCard(project, true))
                    .join('');
            }

            attachBackgroundListeners();

        } catch (error) {
            console.error('Error loading projects:', error);
        }
    };

    // Start: Renderuj projekty gdy DOM jest gotowy
    document.addEventListener('DOMContentLoaded', renderProjects);
})();
