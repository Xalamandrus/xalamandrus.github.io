const mediaImgs = document.querySelectorAll('.showcase-media');

fetch('assets/data/projects.json')
    .then(res => res.json())
    .then(projects =>
    {
        let projectImages = projects.map(project => project.images[0]);
        
        // Shuffle (losowa kolejność)
        for (let i = projectImages.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [projectImages[i], projectImages[j]] = [projectImages[j], projectImages[i]];
        }

        const animationDuration = 24000; // 24s animacja w ms

        let currentPairIndex = 0;

        // Ustaw animation-delay dla 2 img aby były offset
        mediaImgs[0].style.animationDelay = '0s';
        mediaImgs[1].style.animationDelay = '-12s'; // Drugie zdjęcie zaczyna się w połowie

        // Zmienia oba zdjęcia po skończeniu pełnego cyklu
        const changeImages = () => {
            const img1Index = (currentPairIndex * 2) % projectImages.length;
            const img2Index = (currentPairIndex * 2 + 1) % projectImages.length;

            mediaImgs[0].src = projectImages[img1Index];
            mediaImgs[1].src = projectImages[img2Index];

            currentPairIndex++;
            
            // Następna zmiana po 24s
            setTimeout(changeImages, animationDuration);
        };

        // Start
        changeImages();
    });
