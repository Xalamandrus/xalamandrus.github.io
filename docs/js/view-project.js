(() => {
    const indexUrl = 'assets/data/projects.json';

    const qs = new URLSearchParams(window.location.search);
    const slug = qs.get('slug') || 'slay-the-nightmares';

    const $ = (sel) => document.querySelector(sel);
    const setText = (sel, text) => {
        const el = typeof sel === 'string' ? $(sel) : sel;
        if (el) el.textContent = text || '';
    };

    // Extract folder path from dataPath (e.g., "assets/projects/Project-Name/project.json" -> "assets/projects/Project-Name")
    const getFolderFromDataPath = (dataPath) => {
        if (!dataPath) return '';
        const lastSlash = dataPath.lastIndexOf('/');
        return lastSlash > 0 ? dataPath.substring(0, lastSlash) : '';
    };

    // Generate hero image path from dataPath
    const getHeroImagePath = (dataPath) => {
        const folder = getFolderFromDataPath(dataPath);
        return folder ? `${folder}/Gallery/hero.png` : '';
    };



    const buildCtaButtons = (container, data) => {
        if (!container) return;
        const buttons = [];

        // Build download button if buildUrl exists
        if (data.buildUrl) {
            buttons.push(`
                <a href="${data.buildUrl}" class="cta-button cta-button--primary" target="_blank" rel="noopener noreferrer">
                    Download Build
                </a>
            `);
        }

        // Build Steam button if steamUrl exists
        if (data.steamUrl) {
            buttons.push(`
                <a href="${data.steamUrl}" class="cta-button cta-button--secondary" target="_blank" rel="noopener noreferrer">
                    🔗 View on Steam
                </a>
            `);
        }

        // Only show container if there are buttons
        if (buttons.length > 0) {
            container.innerHTML = buttons.join('');
            container.style.display = 'flex';
        } else {
            container.style.display = 'none';
        }
    };

    const buildTags = (container, items) => {
        if (!container) return;
        container.innerHTML = (items || []).map(t => `<span class="tag" role="listitem">${t}</span>`).join('');
    };

    const buildGallery = (container, items) => {
        if (!container) return;
        container.innerHTML = (items || []).map((img, idx) => `
            <a class="vp-shot ${img.wide ? 'vp-shot--wide' : ''} ${img.tall ? 'vp-shot--tall' : ''}" 
               href="${img.src}" role="listitem" data-lightbox>
              <img src="${img.src}" alt="${img.alt || `Gallery image ${idx + 1}`}" loading="lazy" decoding="async" />
            </a>
        `).join('');
    };

    const buildTimeline = (container, items) => {
        if (!container) return;
        container.innerHTML = (items || []).map((item, idx) => `
            <a class="timeline-item" href="${item.src}" role="listitem" data-lightbox>
              <span class="timeline-date">${item.date || ''}</span>
              <img class="timeline-img" src="${item.src}" alt="${item.alt || `Timeline ${idx + 1}`}" loading="lazy" decoding="async" />
            </a>
        `).join('');
    };

    const buildCodeTabs = async (tabsContainer, panelsContainer, examples) => {
        if (!tabsContainer || !panelsContainer) return;
        tabsContainer.innerHTML = '';
        panelsContainer.innerHTML = '';

        for (let idx = 0; idx < (examples || []).length; idx++) {
            const ex = examples[idx];
            const isActive = idx === 0;
            
            // Fetch code from file if filePath is provided
            let code = ex.code || '';
            if (ex.filePath && !code) {
                try {
                    const response = await fetch(ex.filePath);
                    if (response.ok) {
                        code = await response.text();
                    } else {
                        console.warn(`Failed to load code file: ${ex.filePath}`);
                        code = `// Failed to load file: ${ex.filePath}`;
                    }
                } catch (err) {
                    console.error(`Error loading code file ${ex.filePath}:`, err);
                    code = `// Error loading file: ${ex.filePath}`;
                }
            }

            const tab = document.createElement('button');
            tab.className = `code-tab${isActive ? ' active' : ''}`;
            tab.role = 'tab';
            tab.dataset.tab = ex.id || `code-${idx}`;
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
            tab.textContent = ex.title || `Code ${idx + 1}`;
            tabsContainer.appendChild(tab);

            const panel = document.createElement('div');
            panel.className = `code-panel${isActive ? ' active' : ''}`;
            panel.role = 'tabpanel';
            panel.dataset.panel = ex.id || `code-${idx}`;
            panel.innerHTML = `<pre><code class="language-${ex.language || 'csharp'}">${escapeHtml(code)}</code></pre>`;
            panelsContainer.appendChild(panel);
        }

        // Re-init code-tabs if function exists
        document.querySelectorAll('.code-tab').forEach((btn, idx) => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.code-tab').forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                document.querySelectorAll('.code-panel').forEach(p => p.classList.remove('active'));
                
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                const panel = document.querySelector(`[data-panel="${btn.dataset.tab}"]`);
                if (panel) panel.classList.add('active');
            });
        });
    };

    // Helper to escape HTML in code
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    const applyHero = (data) => {
        const heroImagePath = getHeroImagePath(data.dataPath);
        const heroImg = document.querySelector('.project-hero-media img');
        if (heroImg && heroImagePath) {
            heroImg.src = heroImagePath;
            heroImg.alt = data.title ? `${data.title} header` : 'Project header';
        }

        setText('.project-kicker', data.kicker || '');
        setText('.project-title', data.title || '');
        setText('.project-subtitle', data.subtitle || '');

        // Handle action buttons
        const downloadBtn = document.querySelector('[data-bind="download-build-btn"]');
        const steamBtn = document.querySelector('[data-bind="steam-link-btn"]');

        if (downloadBtn) {
            if (data.downloadBuildUrl) {
                downloadBtn.href = data.downloadBuildUrl;
                downloadBtn.style.display = 'inline-flex';
            } else {
                downloadBtn.style.display = 'none';
            }
        }

        if (steamBtn) {
            if (data.steamUrl) {
                steamBtn.href = data.steamUrl;
                steamBtn.style.display = 'inline-flex';
            } else {
                steamBtn.style.display = 'none';
            }
        }

        if (heroImagePath) {
            // Convert path to be relative from CSS folder (../assets/... instead of assets/...)
            const bgPath = heroImagePath.replace('assets/', '../assets/');
            document.body.style.setProperty('--project-bg-image', `url("${bgPath}")`);
        }
    };


    const render = async (data) => {
        applyHero(data);

        setText('[data-bind="heading-overview"]', data.headings?.overview || 'Project Overview');
        setText('[data-bind="heading-role"]', data.headings?.role || 'My Role');

        setText('[data-bind="overview-text"]', data.overview || '');
        setText('[data-bind="role-text"]', data.role || '');

        buildTags($('[data-bind="tools-list"]'), data.tools);
        buildTags($('[data-bind="tags-list"]'), data.tags);

        // Use gallery array from JSON data instead of scanning folder
        const galleryImages = data.gallery || [];
        const timelineImages = data.timeline || [];

        const galleryData = galleryImages.map((src, idx) => ({
            src,
            alt: `${data.title} - Gallery ${idx + 1}`,
            wide: idx === 0 // First image wide
        }));

        const timelineData = timelineImages.map((src, idx) => ({
            src,
            alt: `${data.title} - Timeline ${idx + 1}`,
            date: data.timelineDates?.[idx] || '',
            caption: data.timelineCaptions?.[idx] || ''
        }));

        buildGallery($('[data-bind="gallery-list"]'), galleryData);
        
        // Build CTA buttons in hero
        buildCtaButtons($('[data-bind="hero-cta-buttons"]'), data);
        
        // Show Timeline section only if there's timeline data
        const timelineSection = document.querySelector('[data-section="timeline"]');
        if (timelineSection && timelineImages.length > 0) {
            timelineSection.style.display = '';
            buildTimeline($('[data-bind="timeline-list"]'), timelineData);
        } else if (timelineSection) {
            timelineSection.style.display = 'none';
        }
        
        // Show Code Examples section only if there are code examples
        const codeSection = document.querySelector('[data-section="code"]');
        if (codeSection && data.codeExamples && data.codeExamples.length > 0) {
            codeSection.style.display = '';
            await buildCodeTabs(
                $('[data-bind="code-tabs"]'),
                $('[data-bind="code-panels"]'),
                data.codeExamples
            );
        } else if (codeSection) {
            codeSection.style.display = 'none';
        }

        // Reattach lightbox
        const lightboxScript = document.createElement('script');
        lightboxScript.textContent = `
            if (typeof LightboxInit === 'function') LightboxInit();
            else {
                document.querySelectorAll('[data-lightbox]').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        // Simple lightbox fallback
                    });
                });
            }
        `;
        document.body.appendChild(lightboxScript);
    };

    const load = async () => {
        try {
            const idxRes = await fetch(indexUrl);
            const indexList = await idxRes.json();
            const match = indexList.find(p => p.slug === slug);
            if (!match) throw new Error(`Project slug '${slug}' not found in index`);

            const dataRes = await fetch(match.dataPath);
            if (!dataRes.ok) throw new Error(`Failed to load project data (${dataRes.status})`);
            const data = await dataRes.json();
            
            data.slug = slug;
            data.dataPath = match.dataPath;

            await render(data);
            
            // Signal that content is loaded and fade out loading screen after 1s delay
            setTimeout(() => {
                const loadingScreen = document.getElementById('loadingScreen');
                if (loadingScreen) {
                    loadingScreen.classList.add('hide');
                }
            }, 1000);
        } catch (err) {
            console.error(err);
        }
    };

    document.addEventListener('DOMContentLoaded', load);
})();
