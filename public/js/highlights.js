(() => {
    const projectsIndexUrl = 'assets/data/projects.json';
    
    // Extract folder path from dataPath
    const getFolderFromDataPath = (dataPath) => {
        if (!dataPath) return '';
        const lastSlash = dataPath.lastIndexOf('/');
        return lastSlash > 0 ? dataPath.substring(0, lastSlash) : '';
    };

    // Generate hero image path from dataPath
    const getHeroImagePath = (dataPath) => {
        const folder = getFolderFromDataPath(dataPath);
        return folder ? `${folder}/Gallery/hero.png` : 'assets/projects/default.png';
    };
    
    const fetchProjectDetails = async (indexItems) => {
        const tasks = (indexItems || []).map(async item => {
            if (!item?.dataPath) return null;
            try {
                const res = await fetch(item.dataPath);
                if (!res.ok) throw new Error(`Bad status ${res.status}`);
                const data = await res.json();
                return { ...data, dataPath: item.dataPath, featured: item.featured };
            } catch (err) {
                console.error(`Error loading project data from ${item?.dataPath}:`, err);
                return null;
            }
        });
        const results = await Promise.all(tasks);
        return results.filter(Boolean);
    };

    const loadHighlights = async () => {
        try {
            const response = await fetch(projectsIndexUrl);
            const indexItems = await response.json();
            const projects = await fetchProjectDetails(indexItems);
            const featured = projects.filter(p => p.featured === true).slice(0, 3);

            if (featured.length === 0) return;

            const stack = document.querySelector('.highlight-stack');
            if (!stack) return;

            stack.innerHTML = '';

            featured.forEach((project, idx) => {
                const isActive = idx === 0;
                const article = document.createElement('article');
                article.className = `highlight-card ${isActive ? 'active' : ''} ${idx === 1 ? 'behind behind-1' : ''} ${idx === 2 ? 'behind behind-2' : ''}`;
                article.setAttribute('aria-hidden', isActive ? 'false' : 'true');
                article.innerHTML = `
                    <img src="${getHeroImagePath(project.dataPath)}" alt="${project.title}">
                    <div class="card-info">
                        <h3>${project.title || ''}</h3>
                        <p>${project.description || ''}</p>
                        <a href="view-project.html?slug=${encodeURIComponent(project.slug || '')}" class="btn-highlight">View Project →</a>
                    </div>
                    <div class="progress-bar" aria-hidden="true"><div class="progress-fill"></div></div>
                `;
                stack.appendChild(article);
            });

            initHighlightsLogic();
        } catch (error) {
            console.error('Error loading highlights:', error);
        }
    };

    const initHighlightsLogic = () => {
        const section = document.querySelector('.highlights');
        if (!section) return;

        const stack = section.querySelector('.highlight-stack');
        const cards = stack ? Array.from(stack.querySelectorAll('.highlight-card')) : [];
        if (cards.length < 2) return;

        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const getDurationMs = () => {
            const raw = getComputedStyle(section).getPropertyValue('--hl-duration').trim();
            if (!raw) return 6000;
            if (raw.endsWith('ms')) return Math.max(0, parseFloat(raw));
            if (raw.endsWith('s')) return Math.max(0, parseFloat(raw) * 1000);
            const n = parseFloat(raw);
            return Number.isFinite(n) ? Math.max(0, n) : 6000;
        };

        let durationMs = getDurationMs();
        let current = Math.max(0, cards.findIndex(c => c.classList.contains('active')));
        let intervalId = null;
        let exitTimeoutId = null;

        const restartProgress = (card) => {
            const fill = card.querySelector('.progress-fill');
            if (!fill) return;
            fill.style.animation = 'none';
            void fill.offsetWidth;
            fill.style.animation = '';
        };

        const applyState = (activeIndex) => {
            const count = cards.length;
            const i0 = activeIndex % count;
            const i1 = (activeIndex + 1) % count;
            const i2 = (activeIndex + 2) % count;

            cards.forEach(c => {
                c.classList.remove('active', 'behind', 'behind-1', 'behind-2', 'is-exiting');
                c.setAttribute('aria-hidden', 'true');
            });

            cards[i0].classList.add('active');
            cards[i0].setAttribute('aria-hidden', 'false');
            if (cards.length > 1) {
                cards[i1].classList.add('behind', 'behind-1');
                if (cards.length > 2) cards[i2].classList.add('behind', 'behind-2');
            }

            restartProgress(cards[i0]);
        };

        const stop = () => {
            if (intervalId) window.clearInterval(intervalId);
            intervalId = null;
            if (exitTimeoutId) window.clearTimeout(exitTimeoutId);
            exitTimeoutId = null;
        };

        const step = () => {
            const leaving = cards[current];
            leaving.classList.add('is-exiting');
            exitTimeoutId = window.setTimeout(() => {
                leaving.classList.remove('is-exiting');
                current = (current + 1) % cards.length;
                applyState(current);
            }, 320);
        };

        const start = () => {
            stop();
            durationMs = getDurationMs();
            applyState(current);
            if (prefersReducedMotion || durationMs <= 0) return;
            intervalId = window.setInterval(step, durationMs);
        };

        cards.forEach((card, idx) => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('a')) return;
                current = idx;
                start();
            });
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stop();
            else start();
        });

        window.addEventListener('resize', () => {
            const next = getDurationMs();
            if (Math.abs(next - durationMs) > 50) start();
        });

        start();
    };

    document.addEventListener('DOMContentLoaded', loadHighlights);
})();
