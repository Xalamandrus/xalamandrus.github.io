function injectHtml(container, url)
{
    if (!container)
    {
        console.warn('Container not found');
        return;
    }

    fetch(url)
        .then(response => {
            if (!response.ok)
            {
                throw new Error(`Failed to fetch '${url}': ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
        })
        .catch(error => {
            console.error(`Error injecting HTML from '${url}':`, error);
        });
}

function autoInject()
{
    const elements = document.querySelectorAll('[data-inject]');

    elements.forEach(el => {
        const url = el.getAttribute('data-inject');
        const targetAttr = el.getAttribute('data-target');

        if (!url)
        {
            console.warn('data-inject not specified for element', el);
            return;
        }

        let targetElement = null;

        if (!targetAttr || targetAttr === 'this' || targetAttr === '#this')
        {
            targetElement = el;
        } else {
            targetElement = document.querySelector(targetAttr);

            if (!targetElement)
            {
                console.warn(`Target selector '${targetAttr}' not found`, el);
                return;
            }
        }

        injectHtml(targetElement, url);
    });
}

document.addEventListener('DOMContentLoaded', autoInject);

// Loading screen fade out
(() => {
    const initLoadingScreen = () => {
        const loadingScreen = document.getElementById('loadingScreen');
        
        if (!loadingScreen) return;
        
        // Get all images and videos
        const images = Array.from(document.querySelectorAll('img'));
        const videos = Array.from(document.querySelectorAll('video'));
        const allMedia = [...images, ...videos];
        
        if (allMedia.length === 0) {
            // No media, fade out immediately after a short delay
            setTimeout(() => {
                loadingScreen.classList.add('hide');
            }, 300);
            return;
        }
        
        let loadedCount = 0;
        
        const checkAllLoaded = () => {
            loadedCount++;
            if (loadedCount >= allMedia.length) {
                // All media loaded, fade out loading screen
                loadingScreen.classList.add('hide');
            }
        };
        
        // Track image loads
        images.forEach(img => {
            if (img.complete) {
                checkAllLoaded();
            } else {
                img.addEventListener('load', checkAllLoaded);
                img.addEventListener('error', checkAllLoaded);
            }
        });
        
        // Track video readiness
        videos.forEach(video => {
            if (video.readyState >= 2) {
                checkAllLoaded();
            } else {
                video.addEventListener('canplay', checkAllLoaded);
                video.addEventListener('error', checkAllLoaded);
            }
        });
        
        // Fallback: fade out after 5 seconds max
        setTimeout(() => {
            loadingScreen.classList.add('hide');
        }, 5000);
    };

    // Wait for all injections to complete (with delay)
    setTimeout(initLoadingScreen, 100);
})();
