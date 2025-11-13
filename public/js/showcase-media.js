const mediaImgs = document.querySelectorAll('.showcase-media');

fetch('assets/data/projects.json')
    .then(res => res.json())
    .then(projects =>
    {
        const mainImages = projects.map(project => project.images[0]);

        mediaImgs.forEach((img, i) =>
        {
            img.src = mainImages[i];
        });
    });