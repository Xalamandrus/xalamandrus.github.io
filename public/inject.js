function injectHtml(container, url)
{
    if (!container)
    {
        console.warn(`Container not found`);
        return;
    }

    fetch(url)
        .then(response =>
        {
            if (!response.ok)
            {
                throw new Error(`Failed to fetch '${url}': ${response.status}`);
            }
            
            return response.text();
        })
        .then(html =>
        {
            container.innerHTML = html;
        })
        .catch(error =>
        {
            console.error(`Error injecting HTML from '${url}':`, error);
        });
}

function autoInject()
{
    const elements = document.querySelectorAll('[data-inject]');

    elements.forEach(el =>
    {
        const url = el.getAttribute('data-inject');
        const targetAttr = el.getAttribute('data-target');

        if (!url)
        {
            console.warn(`data-inject not specified for element`, el);
            return;
        }

        let targetElement = null;

        if (!targetAttr || targetAttr === 'this' || targetAttr === '#this')
        {
            targetElement = el;
        } 
        else
        {
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
