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
                return { ...data, slug: data.slug || item.slug || '', dataPath: item.dataPath, featured: item.featured };
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
                article.setAttribute('role', 'button');
                article.setAttribute('tabindex', '0');
                article.dataset.slug = project.slug || '';
                article.innerHTML = `
                    <img src="${getHeroImagePath(project.dataPath)}" alt="${project.title}">
                    <div class="card-info">
                        <p class="project-meta">${project.type || 'PROJECT'}</p>
                        <h3>${project.title || ''}</h3>
                        <p>${project.description || ''}</p>
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
        let touchStartX = 0;
        let touchStartY = 0;
        let touchCurrentX = 0;
        let horizontalSwipeDetected = false;
        let swipeInProgress = false;
        let suppressClickUntil = 0;
        const mobileOffsetRight = 54;
        const mobileOffsetLeft = -54;

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
            clearSwipePreview(false);
            durationMs = getDurationMs();
            applyState(current);
            if (prefersReducedMotion || durationMs <= 0) return;
            intervalId = window.setInterval(step, durationMs);
        };

        const shiftBy = (delta) => {
            if (!delta) return;
            current = (current + delta + cards.length) % cards.length;
            start();
        };

        const navigateToProject = (card) => {
            const slug = card.dataset.slug || '';
            if (!slug) return;
            window.location.href = `view-project.html?slug=${encodeURIComponent(slug)}`;
        };

        cards.forEach((card, idx) => {
            card.addEventListener('click', () => {
                if (Date.now() < suppressClickUntil) return;

                if (card.classList.contains('active')) {
                    navigateToProject(card);
                } else {
                    current = idx;
                    start();
                }
            });

            card.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                if (card.classList.contains('active')) {
                    navigateToProject(card);
                } else {
                    current = idx;
                    start();
                }
            });
        });

        const isMobileViewport = () => window.matchMedia('(max-width: 900px)').matches;

        const clearSwipePreview = (animateBack = true) => {
            cards.forEach(card => {
                card.style.willChange = '';
                card.style.transition = animateBack ? 'transform 180ms ease' : '';
                card.style.transform = '';
            });

            if (animateBack) {
                window.setTimeout(() => {
                    cards.forEach(card => {
                        card.style.transition = '';
                    });
                }, 200);
            }
        };

        const applySwipePreview = (deltaX) => {
            const count = cards.length;
            const i0 = current % count;
            const i1 = (current + 1) % count;
            const i2 = (current + 2) % count;

            const clamped = Math.max(-120, Math.min(120, deltaX));
            const drag = clamped * 0.28;

            cards.forEach((card, idx) => {
                if (idx !== i0 && idx !== i1 && idx !== i2) return;

                let baseX = 0;
                let scale = 1;
                let rotate = 0;

                if (idx === i1) {
                    baseX = mobileOffsetRight;
                    scale = 0.96;
                    rotate = 1;
                } else if (idx === i2) {
                    baseX = mobileOffsetLeft;
                    scale = 0.94;
                    rotate = -1;
                }

                card.style.willChange = 'transform';
                card.style.transition = 'none';
                card.style.transform = `translateX(${baseX + drag}px) scale(${scale}) rotate(${rotate}deg)`;
            });
        };

        stack.style.touchAction = 'pan-y';

        stack.addEventListener('touchstart', (e) => {
            if (!isMobileViewport()) return;
            if (!e.touches || e.touches.length !== 1) return;

            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchCurrentX = touch.clientX;
            horizontalSwipeDetected = false;
            swipeInProgress = true;
            stop();
        }, { passive: true });

        stack.addEventListener('touchmove', (e) => {
            if (!swipeInProgress || !isMobileViewport()) return;
            if (!e.touches || e.touches.length !== 1) return;

            const touch = e.touches[0];
            touchCurrentX = touch.clientX;

            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;

            if (!horizontalSwipeDetected) {
                horizontalSwipeDetected = Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY);
            }

            if (horizontalSwipeDetected) {
                e.preventDefault();
                applySwipePreview(deltaX);
            }
        }, { passive: false });

        stack.addEventListener('touchend', () => {
            if (!swipeInProgress || !isMobileViewport()) return;

            const deltaX = touchCurrentX - touchStartX;
            const absDeltaX = Math.abs(deltaX);

            clearSwipePreview(true);

            if (horizontalSwipeDetected && absDeltaX > 42) {
                shiftBy(deltaX < 0 ? 1 : -1);
                suppressClickUntil = Date.now() + 280;
            } else {
                start();
            }

            swipeInProgress = false;
            horizontalSwipeDetected = false;
        });

        stack.addEventListener('touchcancel', () => {
            clearSwipePreview(true);
            start();
            swipeInProgress = false;
            horizontalSwipeDetected = false;
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
